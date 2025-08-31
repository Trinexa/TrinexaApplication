import { useState, useEffect } from 'react';
import { Search, Download, Loader, Calendar, Users, Clock, Mail } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { api, DemoBooking, DemoSessionAssignment, DemoSessionSchedule } from '../../services/api';
import { TeamAssignmentModal, ScheduleModal } from '../../components/admin/DemoSessionModals';
import { format } from 'date-fns';

const DemoSessionsManagement = () => {
  const [sessions, setSessions] = useState<DemoBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    product: '',
    status: ''
  });
  
  // Modal states
  const [showTeamAssignmentModal, setShowTeamAssignmentModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<DemoBooking | null>(null);
  
  // Session data
  const [sessionAssignments, setSessionAssignments] = useState<{ [key: string]: DemoSessionAssignment[] }>({});
  const [sessionSchedules, setSessionSchedules] = useState<{ [key: string]: DemoSessionSchedule }>({});

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async (searchFilters = filters) => {
    setLoading(true);
    try {
      const data = await api.demoBookings.search(searchFilters);
      setSessions(data);
      
      // Load assignments and schedules for each session
      for (const session of data) {
        if (session.id) {
          await loadSessionData(session.id);
        }
      }
    } catch (error) {
      console.error('Error loading demo sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionData = async (sessionId: string) => {
    try {
      // Load assignments
      const assignments = await api.demoTeamAssignments.getByDemoId(sessionId);
      setSessionAssignments(prev => ({ ...prev, [sessionId]: assignments }));
      
      // Load schedule
      const schedule = await api.demoScheduling.getSchedule(sessionId);
      if (schedule) {
        setSessionSchedules(prev => ({ ...prev, [sessionId]: schedule }));
      }
    } catch (error) {
      console.error('Error loading session data:', error);
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
    loadSessions(filters);
  };

  const handleAssignTeam = (session: DemoBooking) => {
    setSelectedSession(session);
    setShowTeamAssignmentModal(true);
  };

  const handleScheduleDemo = (session: DemoBooking) => {
    const assignments = sessionAssignments[session.id || ''] || [];
    
    if (assignments.length === 0) {
      alert('Please assign team members before scheduling the demo session.');
      return;
    }
    
    setSelectedSession(session);
    setShowScheduleModal(true);
  };

  const handleAssignmentComplete = () => {
    if (selectedSession?.id) {
      loadSessionData(selectedSession.id);
    }
  };

  const handleScheduleComplete = () => {
    if (selectedSession?.id) {
      loadSessionData(selectedSession.id);
      loadSessions(); // Reload to update status
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'scheduled': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeString;
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Client', 'Company', 'Email', 'Product', 'Status', 'Team Members', 'Scheduled Date'];
    const csvData = sessions.map(session => [
      formatDate(session.created_at || ''),
      session.name,
      session.company,
      session.email,
      session.product_interest,
      session.status || 'pending',
      sessionAssignments[session.id || '']?.length || 0,
      sessionSchedules[session.id || '']?.scheduled_date || 'Not scheduled'
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demo-sessions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Demo Sessions Management</h1>
        <Button variant="secondary" onClick={exportToCSV}>
          <Download size={20} className="mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product
              </label>
              <select
                name="product"
                value={filters.product}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Products</option>
                <option value="NexusAnalytics">NexusAnalytics</option>
                <option value="NexusGuard">NexusGuard</option>
                <option value="NexusFlow">NexusFlow</option>
                <option value="NexusAssist">NexusAssist</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary">
              <Search size={20} className="mr-2" />
              Search
            </Button>
          </div>
        </form>
      </Card>

      {/* Sessions List */}
      <Card>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Demo Session Requests</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="animate-spin" size={24} />
              <span className="ml-2">Loading sessions...</span>
            </div>
          ) : sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => {
                const assignments = sessionAssignments[session.id || ''] || [];
                const schedule = sessionSchedules[session.id || ''];
                const isScheduled = schedule && schedule.status === 'scheduled';
                
                return (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium">{session.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status || 'pending')}`}>
                            {session.status || 'pending'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <strong>Company:</strong> {session.company}
                          </div>
                          <div>
                            <strong>Email:</strong> {session.email}
                          </div>
                          <div>
                            <strong>Product:</strong> {session.product_interest}
                          </div>
                          <div>
                            <strong>Requested Date:</strong> {formatDate(session.preferred_date)}
                          </div>
                        </div>

                        {session.message && (
                          <div className="mt-3 text-sm">
                            <strong>Message:</strong> {session.message}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Team Assignments Display */}
                    {assignments.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Users size={16} />
                          Assigned Team Members ({assignments.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {assignments.map((assignment) => (
                            <div key={assignment.id} className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {assignment.team_member?.name} ({assignment.role_in_demo})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Schedule Display */}
                    {isScheduled && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Calendar size={16} />
                          Scheduled Meeting
                        </h4>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <strong>Date:</strong> {formatDate(schedule.scheduled_date)}
                            </div>
                            <div>
                              <strong>Time:</strong> {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                            </div>
                            <div>
                              <strong>Status:</strong> {schedule.status}
                            </div>
                          </div>
                          {schedule.google_meet_link && (
                            <div className="mt-2">
                              <a 
                                href={schedule.google_meet_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                              >
                                <Mail size={14} />
                                Join Google Meet
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAssignTeam(session)}
                        className="flex items-center gap-2"
                      >
                        <Users size={16} />
                        {assignments.length > 0 ? 'Manage Team' : 'Assign Team'}
                      </Button>

                      <Button
                        variant={assignments.length > 0 ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleScheduleDemo(session)}
                        disabled={assignments.length === 0}
                        className="flex items-center gap-2"
                      >
                        <Calendar size={16} />
                        {isScheduled ? 'Reschedule' : 'Schedule'}
                      </Button>

                      {assignments.length === 0 && (
                        <div className="text-sm text-yellow-600 flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded">
                          <Clock size={14} />
                          Assign team members first
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No demo sessions found</p>
            </div>
          )}
        </div>
      </Card>

      {/* Modals */}
      {selectedSession && (
        <>
          <TeamAssignmentModal
            isOpen={showTeamAssignmentModal}
            onClose={() => setShowTeamAssignmentModal(false)}
            demoBooking={selectedSession}
            onAssignmentComplete={handleAssignmentComplete}
          />

          <ScheduleModal
            isOpen={showScheduleModal}
            onClose={() => setShowScheduleModal(false)}
            demoBooking={selectedSession}
            assignments={sessionAssignments[selectedSession.id || ''] || []}
            onScheduleComplete={handleScheduleComplete}
          />
        </>
      )}
    </div>
  );
};

export default DemoSessionsManagement;