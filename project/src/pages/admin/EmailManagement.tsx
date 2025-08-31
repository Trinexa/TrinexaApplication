import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Settings,
  TrendingUp,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { api, EmailTemplate } from '../../services/api';

const EmailManagement: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    category: 'transactional',
    subject: '',
    content: '',
    is_active: true
  });

  // Stats data
  const [stats, setStats] = useState({
    totalTemplates: 0,
    activeTemplates: 0,
    totalUsage: 0
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all email templates from the unified table
      const data = await api.emailTemplates.getAll();
      
      setTemplates(data);
      
      setStats({
        totalTemplates: data.length,
        activeTemplates: data.filter(t => t.is_active).length,
        totalUsage: 0 // TODO: Add usage tracking in future
      });
    } catch (error) {
      console.error('Error loading templates:', error);
      setError('Failed to load email templates. Please check your connection and try again.');
      
      // Show empty state on error - no fallback sample data
      setTemplates([]);
      setStats({
        totalTemplates: 0,
        activeTemplates: 0,
        totalUsage: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      setError(null);
      const variables = extractVariables(templateForm.content);
      const newTemplateData = {
        name: templateForm.name,
        category: templateForm.category,
        subject: templateForm.subject,
        content: templateForm.content,
        variables,
        is_active: templateForm.is_active,
        created_by: undefined
      };
      
      await api.emailTemplates.create(newTemplateData);
      
      // Reload templates to get fresh data from database
      await loadTemplates();
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating template:', error);
      setError('Failed to create template. Please try again.');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;
    
    try {
      setError(null);
      const variables = extractVariables(templateForm.content);
      const updateData = {
        name: templateForm.name,
        category: templateForm.category,
        subject: templateForm.subject,
        content: templateForm.content,
        variables,
        is_active: templateForm.is_active
      };
      
      await api.emailTemplates.update(editingTemplate.id, updateData);
      
      // Reload templates to get fresh data from database
      await loadTemplates();
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error updating template:', error);
      setError('Failed to update template. Please try again.');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      setError(null);
      await api.emailTemplates.delete(id);
      
      // Reload templates to get fresh data from database
      await loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      setError('Failed to delete template. Please try again.');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      setError(null);
      const template = templates.find(t => t.id === id);
      if (!template) return;

      await api.emailTemplates.update(id, {
        is_active: !template.is_active
      });

      // Reload templates to get fresh data from database
      await loadTemplates();
    } catch (error) {
      console.error('Error toggling template status:', error);
      setError('Failed to update template status. Please try again.');
    }
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{[^}]+\}\}/g) || [];
    return [...new Set(matches)];
  };

  const resetForm = () => {
    setTemplateForm({
      name: '',
      category: 'transactional',
      subject: '',
      content: '',
      is_active: true
    });
    setEditingTemplate(null);
  };

  const openEditModal = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      category: template.category,
      subject: template.subject,
      content: template.content,
      is_active: template.is_active
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Management</h1>
          <p className="text-gray-600">
            Manage email templates for job applications and notifications
          </p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                  <div className="mt-2">
                    <Button
                      onClick={loadTemplates}
                      variant="outline"
                      size="sm"
                      className="text-red-800 border-red-300 hover:bg-red-50"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-100">
                <Mail className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{stats.totalTemplates}</h3>
                <p className="text-sm text-gray-600">Total Templates</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{stats.activeTemplates}</h3>
                <p className="text-sm text-gray-600">Active Templates</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{templates.reduce((sum, t) => sum + (t.variables?.length || 0), 0)}</h3>
                <p className="text-sm text-gray-600">Total Variables</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Templates Section */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Email Templates</h2>
            <Button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variables
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {error ? 'Failed to load templates' : 'No email templates found'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          {error ? error : 'Get started by creating your first email template.'}
                        </p>
                        {!error && (
                          <Button
                            onClick={() => {
                              resetForm();
                              setShowModal(true);
                            }}
                            className="inline-flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Create Template
                          </Button>
                        )}
                        {error && (
                          <Button
                            onClick={loadTemplates}
                            variant="outline"
                            className="inline-flex items-center gap-2"
                          >
                            Try Again
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{template.name}</div>
                        <div className="text-sm text-gray-500">{template.subject}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {template.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {template.variables?.length || 0} variables
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(template.id)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                          template.is_active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                        title={`Click to ${template.is_active ? 'deactivate' : 'activate'} template`}
                      >
                        {template.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(template)}
                          className="text-emerald-600 hover:text-emerald-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingTemplate ? 'Edit Template' : 'Create Template'}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Template Name</label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter template name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={templateForm.category}
                      onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="transactional">Transactional</option>
                      <option value="welcome">Welcome</option>
                      <option value="newsletter">Newsletter</option>
                      <option value="promotional">Promotional</option>
                      <option value="notification">Notification</option>
                      <option value="demo_assignment">Demo Assignment</option>
                      <option value="demo_confirmation">Demo Confirmation</option>
                      <option value="demo_reminder">Demo Reminder</option>
                      <option value="demo_cancellation">Demo Cancellation</option>
                      <option value="admin_invitation">Admin Invitation</option>
                      <option value="password_reset">Password Reset</option>
                      <option value="account_welcome">Account Welcome</option>
                      <option value="job_application">Job Application</option>
                      <option value="recruitment">Recruitment</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <input
                      type="text"
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter email subject"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    <textarea
                      value={templateForm.content}
                      onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                      rows={10}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter email content (HTML supported)"
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={templateForm.is_active}
                        onChange={(e) => setTemplateForm({ ...templateForm, is_active: e.target.checked })}
                        className="mr-2 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Active Template</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Inactive templates won't be used automatically but can be manually selected
                    </p>
                  </div>

                  {templateForm.content && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Variables Found</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {extractVariables(templateForm.content).map((variable, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                          >
                            {variable}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                  >
                    {editingTemplate ? 'Update' : 'Create'} Template
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailManagement;
