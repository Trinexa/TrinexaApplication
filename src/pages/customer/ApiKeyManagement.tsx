import { useState, useEffect } from 'react';
import { Plus, Copy, Eye, EyeOff, Trash2, Settings, AlertTriangle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { enterpriseApi } from '../../services/enterpriseApi';
import { ApiKey } from '../../types/enterprise';

const ApiKeyManagement = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[],
    rate_limit: 1000,
    expires_at: ''
  });

  // Mock customer ID
  const customerId = '550e8400-e29b-41d4-a716-446655440001';

  const availablePermissions = [
    'read:analytics',
    'write:analytics',
    'read:products',
    'write:products',
    'read:webhooks',
    'write:webhooks',
    'admin:all'
  ];

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const keys = await enterpriseApi.apiKeys.getByCustomer(customerId);
      setApiKeys(keys);
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await enterpriseApi.apiKeys.create({
        customer_id: customerId,
        name: formData.name,
        permissions: formData.permissions,
        rate_limit: formData.rate_limit,
        usage_count: 0,
        is_active: true,
        expires_at: formData.expires_at || undefined
      });
      
      setShowCreateForm(false);
      setFormData({ name: '', permissions: [], rate_limit: 1000, expires_at: '' });
      loadApiKeys();
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      try {
        await enterpriseApi.apiKeys.delete(keyId);
        loadApiKeys();
      } catch (error) {
        console.error('Error deleting API key:', error);
      }
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const maskApiKey = (key: string) => {
    return `${key.substring(0, 8)}${'*'.repeat(24)}${key.substring(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">API Key Management</h1>
            <p className="text-gray-600">Manage your API keys and access permissions</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(true)}
            icon={<Plus />}
          >
            Create API Key
          </Button>
        </div>

        {/* API Usage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total API Keys</h3>
            <p className="text-3xl font-bold text-green-600">{apiKeys.length}</p>
            <p className="text-sm text-gray-600">Active keys</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Monthly Usage</h3>
            <p className="text-3xl font-bold text-blue-600">
              {apiKeys.reduce((sum, key) => sum + key.usage_count, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">API calls this month</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Rate Limit</h3>
            <p className="text-3xl font-bold text-purple-600">
              {Math.max(...apiKeys.map(key => key.rate_limit), 0)}
            </p>
            <p className="text-sm text-gray-600">Requests per hour</p>
          </Card>
        </div>

        {/* API Keys List */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Your API Keys</h3>
          
          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys yet</h3>
              <p className="text-gray-600 mb-6">Create your first API key to start using our services</p>
              <Button
                variant="primary"
                onClick={() => setShowCreateForm(true)}
                icon={<Plus />}
              >
                Create API Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{key.name}</h4>
                      <p className="text-sm text-gray-600">
                        Created {new Date(key.created_at).toLocaleDateString()}
                        {key.expires_at && (
                          <span className="ml-2">
                            • Expires {new Date(key.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        key.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {key.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Button
                        variant="text"
                        onClick={() => handleDeleteKey(key.id)}
                        icon={<Trash2 className="h-4 w-4" />}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-mono">
                          {visibleKeys.has(key.id) ? key.key : maskApiKey(key.key)}
                        </code>
                        <Button
                          variant="outline"
                          onClick={() => toggleKeyVisibility(key.id)}
                          icon={visibleKeys.has(key.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        />
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(key.key)}
                          icon={<Copy className="h-4 w-4" />}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Usage Statistics
                      </label>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Usage Count:</span>
                          <span className="font-medium">{key.usage_count.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Rate Limit:</span>
                          <span className="font-medium">{key.rate_limit}/hour</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Last Used:</span>
                          <span className="font-medium">
                            {key.last_used ? new Date(key.last_used).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Permissions
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {key.permissions.map((permission, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>

                  {key.expires_at && new Date(key.expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="text-sm text-yellow-800">
                          This API key will expire soon. Consider renewing it.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Create API Key Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Create New API Key</h3>
              
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Production API Key"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate Limit (requests/hour)
                  </label>
                  <input
                    type="number"
                    value={formData.rate_limit}
                    onChange={(e) => setFormData({ ...formData, rate_limit: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="1"
                    max="10000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Date (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availablePermissions.map((permission) => (
                      <label key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                permissions: [...formData.permissions, permission]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                permissions: formData.permissions.filter(p => p !== permission)
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    Create API Key
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeyManagement;