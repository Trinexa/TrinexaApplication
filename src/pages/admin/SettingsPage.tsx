import { useState, useEffect } from 'react';
import { Save, Users, Shield, Bell, Database, Mail, Calendar, Plus, Edit, Trash2, X } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import AdminInvitationManager from '../../components/admin/AdminInvitationManager';
import { api, AdminUser } from '../../services/api';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userForm, setUserForm] = useState({
    email: '',
    role: 'content_admin'
  });
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    demoReminders: true,
    weeklyReports: true,
    systemMaintenance: false,
    autoAssignDemo: false,
    requireApproval: true,
    sessionTimeout: '30',
    maxFileSize: '10',
    allowedFileTypes: 'pdf,doc,docx',
    smtpServer: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    calendarIntegration: 'google',
    defaultMeetingDuration: '60',
    bufferTime: '15'
  });

  const tabs = [
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'system', name: 'System', icon: Database },
    { id: 'email', name: 'Email Settings', icon: Mail },
    { id: 'calendar', name: 'Calendar', icon: Calendar }
  ];

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const loadAdminUsers = async () => {
    setLoading(true);
    try {
      const users = await api.admin.getAll();
      setAdminUsers(users);
    } catch (error) {
      console.error('Error loading admin users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // Here you would save settings to your backend
      console.log('Saving settings:', settings);
      // For now, just show success message
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  // User Management Functions
  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({ email: '', role: 'content_admin' });
    setShowUserModal(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setUserForm({ email: user.email, role: user.role });
    setShowUserModal(true);
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (!confirm(`Are you sure you want to delete user ${user.email}?`)) {
      return;
    }

    try {
      await api.admin.delete(user.id);
      await loadAdminUsers();
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleSaveUser = async () => {
    if (!userForm.email || !userForm.role) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        // Update existing user
        await api.admin.update(editingUser.id, {
          email: userForm.email,
          role: userForm.role
        });
        alert('User updated successfully!');
      } else {
        // Create new user
        await api.admin.create({
          email: userForm.email,
          role: userForm.role
        });
        alert('User created successfully! Note: Auth user must be created separately.');
      }
      
      setShowUserModal(false);
      await loadAdminUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const renderUserManagement = () => (
    <div className="space-y-8">
      {/* Admin User Invitations */}
      <Card>
        <AdminInvitationManager onInvitationSent={loadAdminUsers} />
      </Card>

      {/* Existing Admin Users */}
      <Card>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Existing Admin Users</h3>
            <Button variant="primary" icon={<Plus />} onClick={handleAddUser}>
              Add User (Manual)
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {adminUsers.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'content_admin' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          variant="text" 
                          className="text-blue-600 hover:text-blue-900 mr-2"
                          icon={<Edit />}
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="text" 
                          className="text-red-600 hover:text-red-900"
                          icon={<Trash2 />}
                          onClick={() => handleDeleteUser(user)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Security Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.requireApproval}
              onChange={(e) => handleSettingChange('requireApproval', e.target.checked)}
              className="mr-2"
            />
            Require approval for new registrations
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max File Size (MB)
          </label>
          <input
            type="number"
            value={settings.maxFileSize}
            onChange={(e) => handleSettingChange('maxFileSize', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Allowed File Types
          </label>
          <input
            type="text"
            value={settings.allowedFileTypes}
            onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="pdf,doc,docx"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Notification Settings</h3>
      
      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
            className="mr-2"
          />
          Enable email notifications
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.demoReminders}
            onChange={(e) => handleSettingChange('demoReminders', e.target.checked)}
            className="mr-2"
          />
          Send demo reminders
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.weeklyReports}
            onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
            className="mr-2"
          />
          Weekly analytics reports
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.systemMaintenance}
            onChange={(e) => handleSettingChange('systemMaintenance', e.target.checked)}
            className="mr-2"
          />
          System maintenance notifications
        </label>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">System Settings</h3>
      
      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.autoAssignDemo}
            onChange={(e) => handleSettingChange('autoAssignDemo', e.target.checked)}
            className="mr-2"
          />
          Auto-assign demo sessions to available team members
        </label>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Email Configuration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SMTP Server
          </label>
          <input
            type="text"
            value={settings.smtpServer}
            onChange={(e) => handleSettingChange('smtpServer', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SMTP Port
          </label>
          <input
            type="text"
            value={settings.smtpPort}
            onChange={(e) => handleSettingChange('smtpPort', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SMTP Username
          </label>
          <input
            type="text"
            value={settings.smtpUsername}
            onChange={(e) => handleSettingChange('smtpUsername', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SMTP Password
          </label>
          <input
            type="password"
            value={settings.smtpPassword}
            onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );

  const renderCalendarSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Calendar Integration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Calendar Provider
          </label>
          <select
            value={settings.calendarIntegration}
            onChange={(e) => handleSettingChange('calendarIntegration', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="google">Google Calendar</option>
            <option value="outlook">Microsoft Outlook</option>
            <option value="apple">Apple Calendar</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Meeting Duration (minutes)
          </label>
          <input
            type="number"
            value={settings.defaultMeetingDuration}
            onChange={(e) => handleSettingChange('defaultMeetingDuration', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buffer Time Between Meetings (minutes)
          </label>
          <input
            type="number"
            value={settings.bufferTime}
            onChange={(e) => handleSettingChange('bufferTime', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return renderUserManagement();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'system':
        return renderSystemSettings();
      case 'email':
        return renderEmailSettings();
      case 'calendar':
        return renderCalendarSettings();
      default:
        return renderUserManagement();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button
          variant="primary"
          onClick={handleSaveSettings}
          icon={<Save />}
        >
          Save Changes
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <Card className="p-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-50 text-green-700 border-r-2 border-green-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="mr-3 h-5 w-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Card>
            {renderTabContent()}
          </Card>
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="content_admin">Content Admin</option>
                  <option value="recruitment_admin">Recruitment Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              {!editingUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This creates the admin user record only. 
                    The authentication user must be created separately through your auth provider.
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="text"
                  onClick={() => setShowUserModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveUser}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;