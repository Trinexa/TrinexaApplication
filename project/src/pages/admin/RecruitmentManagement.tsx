import { useState, useEffect } from 'react';
import { Search, Download, Loader, Calendar, Star, CheckCircle, XCircle, Plus, Edit, Trash2, Briefcase, Users } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { api, JobApplication, JobPosition } from '../../services/api';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface GeneralApplication {
  id?: string;
  name: string;
  email: string;
  phone: string;
  resume_url: string;
  cover_letter: string;
  portfolio_url?: string;
  linkedin_url?: string;
  created_at?: string;
  status?: 'pending' | 'shortlisted' | 'rejected';
  type: 'general';
}

interface PositionApplication extends JobApplication {
  job_position: JobPosition;
  type: 'position';
}

type Application = GeneralApplication | PositionApplication;

const RecruitmentManagement = () => {
  const [activeTab, setActiveTab] = useState<'applications' | 'positions'>('applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    positionId: ''
  });
  const [showScheduler, setShowScheduler] = useState(false);
  const [showPositionForm, setShowPositionForm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<JobPosition | null>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [positionForm, setPositionForm] = useState({
    title: '',
    department: '',
    location: '',
    type: 'full-time',
    description: '',
    requirements: [''],
    responsibilities: [''],
    benefits: [''],
    salary_range: '',
    is_active: true
  });

  // Analytics data
  const statusData = [
    { name: 'Pending', value: applications.filter(app => !app.status || app.status === 'pending').length },
    { name: 'Shortlisted', value: applications.filter(app => app.status === 'shortlisted').length },
    { name: 'Rejected', value: applications.filter(app => app.status === 'rejected').length }
  ];

  const COLORS = ['#FCD34D', '#10B981', '#EF4444'];

  useEffect(() => {
    loadApplications();
    loadPositions();
  }, []);

  const loadApplications = async (searchFilters = filters) => {
    setLoading(true);
    try {
      // Load both general applications and job-specific applications
      const [generalApps, jobApps] = await Promise.all([
        api.generalApplications.search({
          startDate: searchFilters.startDate,
          endDate: searchFilters.endDate,
          status: searchFilters.status
        }),
        api.jobApplications.search({
          startDate: searchFilters.startDate,
          endDate: searchFilters.endDate,
          status: searchFilters.status,
          positionId: searchFilters.positionId
        })
      ]);

      // Combine and type both application types
      const allApplications: Application[] = [
        ...generalApps.map(app => ({ ...app, type: 'general' as const })),
        ...jobApps.map(app => ({ ...app, type: 'position' as const }))
      ];

      // Sort by creation date (newest first)
      allApplications.sort((a, b) => 
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );

      setApplications(allApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPositions = async () => {
    setPositionsLoading(true);
    try {
      const data = await api.jobPositions.getAllForAdmin();
      setPositions(data);
    } catch (error) {
      console.error('Error loading positions:', error);
    } finally {
      setPositionsLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadApplications(filters);
  };

  const handleStatusChange = async (applicationId: string, status: 'shortlisted' | 'rejected') => {
    try {
      // Find the application to determine its type
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;

      // Update application status based on type
      if (application.type === 'general') {
        await api.generalApplications.updateStatus(applicationId, status);
      } else {
        await api.jobApplications.updateStatus(applicationId, status);
      }
      
      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status } : app
        )
      );
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedApplication || !selectedApplication.id || !interviewDate || !interviewTime) return;

    try {
      // Create calendar event and send email based on application type
      if (selectedApplication.type === 'general') {
        await api.generalApplications.scheduleInterview({
          applicationId: selectedApplication.id,
          date: interviewDate,
          time: interviewTime
        });
      } else {
        await api.jobApplications.scheduleInterview({
          applicationId: selectedApplication.id,
          date: interviewDate,
          time: interviewTime
        });
      }

      // Update UI
      setShowScheduler(false);
      setSelectedApplication(null);
      setInterviewDate('');
      setInterviewTime('');
    } catch (error) {
      console.error('Error scheduling interview:', error);
    }
  };

  // Position management functions
  const handlePositionFormChange = (field: string, value: any) => {
    setPositionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayFieldChange = (field: 'requirements' | 'responsibilities' | 'benefits', index: number, value: string) => {
    setPositionForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field: 'requirements' | 'responsibilities' | 'benefits') => {
    setPositionForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field: 'requirements' | 'responsibilities' | 'benefits', index: number) => {
    setPositionForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleCreatePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const filteredForm = {
        ...positionForm,
        requirements: positionForm.requirements.filter(req => req.trim() !== ''),
        responsibilities: positionForm.responsibilities.filter(resp => resp.trim() !== ''),
        benefits: positionForm.benefits.filter(benefit => benefit.trim() !== '')
      };

      if (selectedPosition) {
        await api.jobPositions.update(selectedPosition.id, filteredForm);
      } else {
        await api.jobPositions.create(filteredForm);
      }

      await loadPositions();
      setShowPositionForm(false);
      setSelectedPosition(null);
      setPositionForm({
        title: '',
        department: '',
        location: '',
        type: 'full-time',
        description: '',
        requirements: [''],
        responsibilities: [''],
        benefits: [''],
        salary_range: '',
        is_active: true
      });
    } catch (error) {
      console.error('Error saving position:', error);
    }
  };

  const handleEditPosition = (position: JobPosition) => {
    setSelectedPosition(position);
    setPositionForm({
      title: position.title,
      department: position.department,
      location: position.location,
      type: position.type,
      description: position.description,
      requirements: position.requirements.length > 0 ? position.requirements : [''],
      responsibilities: position.responsibilities.length > 0 ? position.responsibilities : [''],
      benefits: position.benefits.length > 0 ? position.benefits : [''],
      salary_range: position.salary_range || '',
      is_active: position.is_active
    });
    setShowPositionForm(true);
  };

  const handleDeletePosition = async (positionId: string) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      try {
        await api.jobPositions.delete(positionId);
        await loadPositions();
      } catch (error) {
        console.error('Error deleting position:', error);
      }
    }
  };

  const handleTogglePositionStatus = async (positionId: string, isActive: boolean) => {
    try {
      await api.jobPositions.update(positionId, { is_active: !isActive });
      await loadPositions();
    } catch (error) {
      console.error('Error updating position status:', error);
    }
  };

  const exportShortlisted = () => {
    const shortlisted = applications.filter(app => app.status === 'shortlisted');
    const summary = shortlisted.map(app => ({
      Name: app.name,
      Email: app.email,
      Phone: app.phone,
      Resume: app.resume_url,
      Portfolio: app.portfolio_url || 'N/A',
      LinkedIn: app.linkedin_url || 'N/A',
      'Application Date': app.created_at ? format(new Date(app.created_at), 'MMM d, yyyy') : 'N/A'
    }));

    // Create CSV content
    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(summary[0]).join(",") + "\n" +
      summary.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "shortlisted_candidates.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recruitment Management</h1>
        <div className="flex gap-4">
          {activeTab === 'applications' && (
            <Button
              variant="outline"
              onClick={exportShortlisted}
              icon={<Download />}
            >
              Export Shortlisted
            </Button>
          )}
          {activeTab === 'positions' && (
            <Button
              variant="primary"
              onClick={() => {
                setSelectedPosition(null);
                setPositionForm({
                  title: '',
                  department: '',
                  location: '',
                  type: 'full-time',
                  description: '',
                  requirements: [''],
                  responsibilities: [''],
                  benefits: [''],
                  salary_range: '',
                  is_active: true
                });
                setShowPositionForm(true);
              }}
              icon={<Plus />}
            >
              Add Position
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applications'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="inline-block w-4 h-4 mr-2" />
              Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab('positions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'positions'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Briefcase className="inline-block w-4 h-4 mr-2" />
              Open Positions ({positions.filter(p => p.is_active).length})
            </button>
          </nav>
        </div>
      </div>

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Analytics Card */}
            <Card className="lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4">Application Status Overview</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  {statusData.map((status, index) => (
                    <div key={status.name} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <span className="text-sm">
                        {status.name}: {status.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Filters Card */}
            <Card>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="positionId" className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <select
                    id="positionId"
                    name="positionId"
                    value={filters.positionId}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Positions</option>
                    {positions.map((position) => (
                      <option key={position.id} value={position.id}>
                        {position.title} - {position.department}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  icon={<Search />}
                >
                  Search
                </Button>
              </form>
            </Card>
          </div>

          <Card>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader className="animate-spin h-8 w-8 text-green-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documents
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applied On
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((application) => (
                      <tr key={application.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{application.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{application.email}</div>
                          <div className="text-sm text-gray-500">{application.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {application.type === 'position' ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {application.job_position?.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {application.job_position?.department}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              General Application
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <a
                              href={application.resume_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-green-600 hover:text-green-500 block"
                            >
                              Resume
                            </a>
                            {application.portfolio_url && (
                              <a
                                href={application.portfolio_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-green-600 hover:text-green-500 block"
                              >
                                Portfolio
                              </a>
                            )}
                            {application.linkedin_url && (
                              <a
                                href={application.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-green-600 hover:text-green-500 block"
                              >
                                LinkedIn
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {application.created_at ? format(new Date(application.created_at), 'MMM d, yyyy') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            application.status === 'shortlisted'
                              ? 'bg-green-100 text-green-800'
                              : application.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {application.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="text"
                              onClick={() => application.id && handleStatusChange(application.id, 'shortlisted')}
                              icon={<Star className="h-4 w-4" />}
                              className="text-green-600 hover:text-green-900"
                              disabled={!application.id}
                            >
                              Shortlist
                            </Button>
                            <Button
                              variant="text"
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowScheduler(true);
                              }}
                              icon={<Calendar className="h-4 w-4" />}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Schedule
                            </Button>
                            <Button
                              variant="text"
                              onClick={() => application.id && handleStatusChange(application.id, 'rejected')}
                              icon={<XCircle className="h-4 w-4" />}
                              className="text-red-600 hover:text-red-900"
                              disabled={!application.id}
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {applications.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No applications found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Positions Tab */}
      {activeTab === 'positions' && (
        <Card>
          {positionsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader className="animate-spin h-8 w-8 text-green-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {positions.map((position) => (
                    <tr key={position.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{position.title}</div>
                        {position.salary_range && (
                          <div className="text-sm text-gray-500">{position.salary_range}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{position.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{position.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">{position.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePositionStatus(position.id, position.is_active)}
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                            position.is_active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {position.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(position.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="text"
                            onClick={() => handleEditPosition(position)}
                            icon={<Edit className="h-4 w-4" />}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="text"
                            onClick={() => handleDeletePosition(position.id)}
                            icon={<Trash2 className="h-4 w-4" />}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {positions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        No positions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Position Form Modal */}
      {showPositionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {selectedPosition ? 'Edit Position' : 'Add New Position'}
            </h3>
            <form onSubmit={handleCreatePosition} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={positionForm.title}
                    onChange={(e) => handlePositionFormChange('title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    value={positionForm.department}
                    onChange={(e) => handlePositionFormChange('department', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={positionForm.location}
                    onChange={(e) => handlePositionFormChange('location', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Type *
                  </label>
                  <select
                    value={positionForm.type}
                    onChange={(e) => handlePositionFormChange('type', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary Range (Optional)
                </label>
                <input
                  type="text"
                  value={positionForm.salary_range}
                  onChange={(e) => handlePositionFormChange('salary_range', e.target.value)}
                  placeholder="e.g., $50,000 - $70,000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description *
                </label>
                <textarea
                  value={positionForm.description}
                  onChange={(e) => handlePositionFormChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requirements
                </label>
                {positionForm.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => handleArrayFieldChange('requirements', index, e.target.value)}
                      placeholder="Enter requirement"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeArrayField('requirements', index)}
                      className="px-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayField('requirements')}
                  icon={<Plus />}
                  className="mt-2"
                >
                  Add Requirement
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsibilities
                </label>
                {positionForm.responsibilities.map((resp, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={resp}
                      onChange={(e) => handleArrayFieldChange('responsibilities', index, e.target.value)}
                      placeholder="Enter responsibility"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeArrayField('responsibilities', index)}
                      className="px-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayField('responsibilities')}
                  icon={<Plus />}
                  className="mt-2"
                >
                  Add Responsibility
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Benefits
                </label>
                {positionForm.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => handleArrayFieldChange('benefits', index, e.target.value)}
                      placeholder="Enter benefit"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeArrayField('benefits', index)}
                      className="px-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayField('benefits')}
                  icon={<Plus />}
                  className="mt-2"
                >
                  Add Benefit
                </Button>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={positionForm.is_active}
                  onChange={(e) => handlePositionFormChange('is_active', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Position is active
                </label>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPositionForm(false);
                    setSelectedPosition(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={<CheckCircle />}
                >
                  {selectedPosition ? 'Update Position' : 'Create Position'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interview Scheduler Modal */}
      {showScheduler && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Schedule Interview with {selectedApplication.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowScheduler(false);
                    setSelectedApplication(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleScheduleInterview}
                  icon={<Calendar />}
                >
                  Schedule Interview
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruitmentManagement;