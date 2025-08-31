import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader, Save, X, Eye, EyeOff } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { 
  api, 
  Testimonial, 
  JobPosition, 
  FAQ, 
  CompanyValue, 
  Benefit, 
  StorySection, 
  MissionVision, 
  LeadershipMember 
} from '../../services/api';

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('testimonials');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Data states
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [companyValues, setCompanyValues] = useState<CompanyValue[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [storySections, setStorySections] = useState<StorySection[]>([]);
  const [missionVision, setMissionVision] = useState<MissionVision[]>([]);
  const [leadershipMembers, setLeadershipMembers] = useState<LeadershipMember[]>([]);

  // Form states
  const [formData, setFormData] = useState<any>({});

  const tabs = [
    { id: 'testimonials', name: 'Testimonials', icon: '💬' },
    { id: 'jobs', name: 'Job Positions', icon: '💼' },
    { id: 'faqs', name: 'FAQs', icon: '❓' },
    { id: 'values', name: 'Company Values', icon: '⭐' },
    { id: 'benefits', name: 'Benefits', icon: '🎁' },
    { id: 'story', name: 'Our Story', icon: '📖' },
    { id: 'mission', name: 'Mission & Vision', icon: '🎯' },
    { id: 'leadership', name: 'Leadership', icon: '👥' }
  ];

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'testimonials':
          const testimonialsData = await api.testimonials.getAllForAdmin();
          setTestimonials(testimonialsData);
          break;
        case 'jobs':
          const jobsData = await api.jobPositions.getAllForAdmin();
          setJobPositions(jobsData);
          break;
        case 'faqs':
          const faqsData = await api.faqs.getAllForAdmin();
          setFaqs(faqsData);
          break;
        case 'values':
          const valuesData = await api.companyValues.getAllForAdmin();
          setCompanyValues(valuesData);
          break;
        case 'benefits':
          const benefitsData = await api.benefits.getAllForAdmin();
          setBenefits(benefitsData);
          break;
        case 'story':
          const storyData = await api.storySections.getAllForAdmin();
          setStorySections(storyData);
          break;
        case 'mission':
          const missionData = await api.missionVision.getAllForAdmin();
          setMissionVision(missionData);
          break;
        case 'leadership':
          const leadershipData = await api.leadershipMembers.getAllForAdmin();
          setLeadershipMembers(leadershipData);
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData(getDefaultFormData());
    setShowForm(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      switch (activeTab) {
        case 'testimonials':
          await api.testimonials.delete(id);
          break;
        case 'jobs':
          await api.jobPositions.delete(id);
          break;
        case 'faqs':
          await api.faqs.delete(id);
          break;
        case 'values':
          await api.companyValues.delete(id);
          break;
        case 'benefits':
          await api.benefits.delete(id);
          break;
        case 'story':
          await api.storySections.delete(id);
          break;
        case 'mission':
          await api.missionVision.delete(id);
          break;
        case 'leadership':
          await api.leadershipMembers.delete(id);
          break;
      }
      loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // Update
        switch (activeTab) {
          case 'testimonials':
            await api.testimonials.update(editingItem.id, formData);
            break;
          case 'jobs':
            await api.jobPositions.update(editingItem.id, formData);
            break;
          case 'faqs':
            await api.faqs.update(editingItem.id, formData);
            break;
          case 'values':
            await api.companyValues.update(editingItem.id, formData);
            break;
          case 'benefits':
            await api.benefits.update(editingItem.id, formData);
            break;
          case 'story':
            await api.storySections.update(editingItem.id, formData);
            break;
          case 'mission':
            await api.missionVision.update(editingItem.id, formData);
            break;
          case 'leadership':
            await api.leadershipMembers.update(editingItem.id, formData);
            break;
        }
      } else {
        // Create
        switch (activeTab) {
          case 'testimonials':
            await api.testimonials.create(formData);
            break;
          case 'jobs':
            await api.jobPositions.create(formData);
            break;
          case 'faqs':
            await api.faqs.create(formData);
            break;
          case 'values':
            await api.companyValues.create(formData);
            break;
          case 'benefits':
            await api.benefits.create(formData);
            break;
          case 'story':
            await api.storySections.create(formData);
            break;
          case 'mission':
            await api.missionVision.create(formData);
            break;
          case 'leadership':
            await api.leadershipMembers.create(formData);
            break;
        }
      }
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const updateData = { is_active: !currentStatus };
      switch (activeTab) {
        case 'testimonials':
          await api.testimonials.update(id, updateData);
          break;
        case 'jobs':
          await api.jobPositions.update(id, updateData);
          break;
        case 'faqs':
          await api.faqs.update(id, updateData);
          break;
        case 'values':
          await api.companyValues.update(id, updateData);
          break;
        case 'benefits':
          await api.benefits.update(id, updateData);
          break;
        case 'story':
          await api.storySections.update(id, updateData);
          break;
        case 'mission':
          await api.missionVision.update(id, updateData);
          break;
        case 'leadership':
          await api.leadershipMembers.update(id, updateData);
          break;
      }
      loadData();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const getDefaultFormData = () => {
    switch (activeTab) {
      case 'testimonials':
        return {
          quote: '',
          author_name: '',
          author_position: '',
          author_company: '',
          author_image: '',
          is_active: true,
          sort_order: 0
        };
      case 'jobs':
        return {
          title: '',
          department: '',
          location: '',
          type: 'Full-time',
          description: '',
          requirements: [''],
          responsibilities: [''],
          benefits: [''],
          salary_range: '',
          is_active: true
        };
      case 'faqs':
        return {
          question: '',
          answer: '',
          category: 'general',
          page_id: 'products',
          is_active: true,
          sort_order: 0
        };
      case 'values':
        return {
          title: '',
          description: '',
          icon: '',
          page_id: 'careers',
          is_active: true,
          sort_order: 0
        };
      case 'benefits':
        return {
          title: '',
          description: '',
          icon: '',
          category: 'general',
          is_active: true,
          sort_order: 0
        };
      case 'story':
        return {
          title: '',
          content: '',
          image_url: '',
          section_type: 'story',
          is_active: true,
          sort_order: 0
        };
      case 'mission':
        return {
          type: 'mission',
          title: '',
          content: '',
          icon: '',
          is_active: true
        };
      case 'leadership':
        return {
          name: '',
          position: '',
          bio: '',
          image_url: '',
          linkedin_url: '',
          twitter_url: '',
          email: '',
          is_active: true,
          sort_order: 0
        };
      default:
        return {};
    }
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'testimonials':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quote *</label>
              <textarea
                value={formData.quote || ''}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author Name *</label>
                <input
                  type="text"
                  value={formData.author_name || ''}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                <input
                  type="text"
                  value={formData.author_position || ''}
                  onChange={(e) => setFormData({ ...formData, author_position: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={formData.author_company || ''}
                  onChange={(e) => setFormData({ ...formData, author_company: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.author_image || ''}
                  onChange={(e) => setFormData({ ...formData, author_image: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order || 0}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        );

      case 'jobs':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <input
                  type="text"
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={formData.type || 'Full-time'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
              {(formData.requirements || ['']).map((req: string, index: number) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => {
                      const newReqs = [...(formData.requirements || [''])];
                      newReqs[index] = e.target.value;
                      setFormData({ ...formData, requirements: newReqs });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter requirement..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const newReqs = (formData.requirements || ['']).filter((_: any, i: number) => i !== index);
                      setFormData({ ...formData, requirements: newReqs });
                    }}
                    icon={<Trash2 className="h-4 w-4" />}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({ 
                    ...formData, 
                    requirements: [...(formData.requirements || ['']), ''] 
                  });
                }}
                icon={<Plus className="h-4 w-4" />}
              >
                Add Requirement
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
              <input
                type="text"
                value={formData.salary_range || ''}
                onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., $80,000 - $120,000"
              />
            </div>
          </div>
        );

      case 'faqs':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
              <input
                type="text"
                value={formData.question || ''}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Answer *</label>
              <textarea
                value={formData.answer || ''}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category || 'general'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page</label>
                <select
                  value={formData.page_id || 'products'}
                  onChange={(e) => setFormData({ ...formData, page_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="products">Products</option>
                  <option value="about">About</option>
                  <option value="careers">Careers</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'leadership':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                <input
                  type="text"
                  value={formData.position || ''}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio *</label>
              <textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
              <input
                type="url"
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedin_url || ''}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        );

      default:
        return <div>Form not implemented for this tab</div>;
    }
  };

  const renderList = () => {
    let data: any[] = [];
    switch (activeTab) {
      case 'testimonials':
        data = testimonials;
        break;
      case 'jobs':
        data = jobPositions;
        break;
      case 'faqs':
        data = faqs;
        break;
      case 'values':
        data = companyValues;
        break;
      case 'benefits':
        data = benefits;
        break;
      case 'story':
        data = storySections;
        break;
      case 'mission':
        data = missionVision;
        break;
      case 'leadership':
        data = leadershipMembers;
        break;
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No items found. Click "Add New" to create one.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {activeTab === 'testimonials' && (
                  <div>
                    <p className="font-medium">"{item.quote.substring(0, 100)}..."</p>
                    <p className="text-sm text-gray-600">
                      - {item.author_name}, {item.author_position}
                      {item.author_company && `, ${item.author_company}`}
                    </p>
                  </div>
                )}
                {activeTab === 'jobs' && (
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-gray-600">
                      {item.department} • {item.location} • {item.type}
                    </p>
                    {item.salary_range && (
                      <p className="text-sm text-green-600">{item.salary_range}</p>
                    )}
                  </div>
                )}
                {activeTab === 'faqs' && (
                  <div>
                    <h3 className="font-medium">{item.question}</h3>
                    <p className="text-sm text-gray-600">{item.answer.substring(0, 100)}...</p>
                    <p className="text-xs text-gray-500">{item.category} • {item.page_id}</p>
                  </div>
                )}
                {activeTab === 'leadership' && (
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.position}</p>
                    <p className="text-sm text-gray-500">{item.bio.substring(0, 100)}...</p>
                  </div>
                )}
                {(activeTab === 'values' || activeTab === 'benefits') && (
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description.substring(0, 100)}...</p>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleToggleActive(item.id, item.is_active)}
                  className={`p-1 rounded ${
                    item.is_active ? 'text-green-600' : 'text-gray-400'
                  }`}
                  title={item.is_active ? 'Hide' : 'Show'}
                >
                  {item.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <Button
                  variant="text"
                  onClick={() => handleEdit(item)}
                  icon={<Edit className="h-4 w-4" />}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Edit
                </Button>
                <Button
                  variant="text"
                  onClick={() => handleDelete(item.id)}
                  icon={<Trash2 className="h-4 w-4" />}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Content Management</h1>
        <Button
          variant="primary"
          onClick={handleCreate}
          icon={<Plus />}
        >
          Add New
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader className="animate-spin h-8 w-8 text-green-500" />
          </div>
        ) : (
          renderList()
        )}
      </Card>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingItem ? 'Edit' : 'Add New'} {tabs.find(t => t.id === activeTab)?.name}
              </h3>
              <Button
                variant="text"
                onClick={() => setShowForm(false)}
                icon={<X />}
              />
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              {renderForm()}
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={<Save />}
                >
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;