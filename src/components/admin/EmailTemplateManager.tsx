import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import { api, InvitationEmailTemplate } from '../../services/api';

interface EmailTemplateManagerProps {
  onTemplateUpdate?: () => void;
}

export const EmailTemplateManager: React.FC<EmailTemplateManagerProps> = ({
  onTemplateUpdate
}) => {
  const [templates, setTemplates] = useState<InvitationEmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<InvitationEmailTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await api.invitationEmailTemplates.getAll();
      setTemplates(data);
    } catch (err) {
      setError('Failed to load email templates');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate({
      id: '',
      name: '',
      category: 'transactional',
      subject: '',
      content: '',
      variables: ['email', 'role', 'invitation_url', 'expires_at', 'company_name'],
      is_active: true,
      created_by: 'admin',
      created_at: '',
      updated_at: ''
    });
    setIsCreating(true);
    setShowEditor(true);
  };

  const handleEditTemplate = (template: InvitationEmailTemplate) => {
    setSelectedTemplate(template);
    setIsCreating(false);
    setShowEditor(true);
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setLoading(true);
      setError(null);

      if (isCreating) {
        const { id, created_at, updated_at, ...templateData } = selectedTemplate;
        await api.invitationEmailTemplates.create(templateData);
      } else {
        await api.invitationEmailTemplates.update(selectedTemplate.id, selectedTemplate);
      }

      await loadTemplates();
      setShowEditor(false);
      setSelectedTemplate(null);
      
      if (onTemplateUpdate) {
        onTemplateUpdate();
      }
    } catch (err) {
      setError('Failed to save template');
      console.error('Error saving template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      setLoading(true);
      await api.invitationEmailTemplates.delete(id);
      await loadTemplates();
    } catch (err) {
      setError('Failed to delete template');
      console.error('Error deleting template:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTemplateTypeColor = (category: string) => {
    switch (category) {
      case 'transactional': return 'text-blue-600 bg-blue-100';
      case 'welcome': return 'text-green-600 bg-green-100';
      case 'notification': return 'text-purple-600 bg-purple-100';
      case 'general': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Email Templates</h3>
        <Button
          onClick={handleCreateTemplate}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          Create Template
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Template Editor Modal */}
      {showEditor && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-medium">
                {isCreating ? 'Create Email Template' : 'Edit Email Template'}
              </h4>
              <button
                onClick={() => setShowEditor(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={selectedTemplate.name}
                    onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Category
                  </label>
                  <select
                    value={selectedTemplate.category}
                    onChange={(e) => setSelectedTemplate(prev => prev ? { 
                      ...prev, 
                      category: e.target.value as 'welcome' | 'newsletter' | 'promotional' | 'transactional' | 'notification' | 'general'
                    } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="transactional">Transactional</option>
                    <option value="welcome">Welcome</option>
                    <option value="notification">Notification</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              {/* Default Template Buttons */}
              <div className="flex space-x-2">
                <span className="text-sm text-gray-600">
                  Tip: Check the database for default templates or create your own custom templates.
                </span>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={selectedTemplate.subject}
                  onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, subject: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* HTML Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Content (HTML)
                </label>
                <textarea
                  value={selectedTemplate.content}
                  onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, content: e.target.value } : null)}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  required
                />
              </div>

              {/* Available Variables */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Variables
                </label>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  <p className="mb-2">You can use these variables in your template:</p>
                  <div className="flex flex-wrap gap-2">
                    {['email', 'role', 'invitation_url', 'expires_at', 'company_name', 'support_email', 'name', 'login_url', 'reset_url'].map(variable => (
                      <code key={variable} className="bg-white px-2 py-1 rounded border">
                        {`{{${variable}}}`}
                      </code>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={selectedTemplate.is_active}
                  onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Active (users will receive emails using this template)
                </label>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleSaveTemplate}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Template'}
                </Button>
                <Button
                  onClick={() => setShowEditor(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Templates List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
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
              {loading && templates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Loading templates...
                  </td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No templates found
                  </td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr key={template.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {template.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTemplateTypeColor(template.category)}`}>
                        {template.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {template.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        template.is_active ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                      }`}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="text-blue-600 hover:text-blue-900"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default EmailTemplateManager;
