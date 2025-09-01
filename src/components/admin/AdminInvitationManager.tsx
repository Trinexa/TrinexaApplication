import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import { api, AdminInvitation } from '../../services/api';
import { emailService } from '../../services/emailService';

interface AdminInvitationManagerProps {
  onInvitationSent?: () => void;
}

export const AdminInvitationManager: React.FC<AdminInvitationManagerProps> = ({
  onInvitationSent
}) => {
  const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'admin'
  });

  // Load invitations on component mount
  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const data = await api.adminInvitations.getAll();
      setInvitations(data);
    } catch (err) {
      setError('Failed to load invitations');
      console.error('Error loading invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteData.email || !inviteData.role) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Create invitation
      const invitation = await api.adminInvitations.create(inviteData);
      
      // Send invitation email
      await emailService.sendInvitationEmail(invitation);
      
      // Refresh invitations list
      await loadInvitations();
      
      // Reset form
      setInviteData({ email: '', role: 'admin' });
      setShowInviteForm(false);
      
      if (onInvitationSent) {
        onInvitationSent();
      }
      
    } catch (err) {
      setError('Failed to send invitation');
      console.error('Error sending invitation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvitation = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this invitation?')) {
      return;
    }

    try {
      setLoading(true);
      await api.adminInvitations.cancelInvitation(id);
      await loadInvitations();
    } catch (err) {
      setError('Failed to cancel invitation');
      console.error('Error canceling invitation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (id: string) => {
    try {
      setLoading(true);
      const updatedInvitation = await api.adminInvitations.resendInvitation(id);
      await emailService.sendInvitationEmail(updatedInvitation);
      await loadInvitations();
    } catch (err) {
      setError('Failed to resend invitation');
      console.error('Error resending invitation:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Admin Invitations</h3>
        <Button
          onClick={() => setShowInviteForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          Send Invitation
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Invite Form Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <h4 className="text-lg font-medium mb-4">Send Admin Invitation</h4>
            
            <form onSubmit={handleSendInvitation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Invitation'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Invitations List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && invitations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Loading invitations...
                  </td>
                </tr>
              ) : invitations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No invitations found
                  </td>
                </tr>
              ) : (
                invitations.map((invitation) => {
                  const expired = isExpired(invitation.expires_at);
                  const actualStatus = expired && invitation.status === 'pending' ? 'expired' : invitation.status;
                  
                  return (
                    <tr key={invitation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invitation.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invitation.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(actualStatus)}`}>
                          {actualStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invitation.expires_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {invitation.status === 'pending' && !expired && (
                          <>
                            <button
                              onClick={() => handleResendInvitation(invitation.id)}
                              className="text-blue-600 hover:text-blue-900"
                              disabled={loading}
                            >
                              Resend
                            </button>
                            <button
                              onClick={() => handleCancelInvitation(invitation.id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {(invitation.status === 'cancelled' || (invitation.status === 'pending' && expired)) && (
                          <span className="text-gray-400">No actions</span>
                        )}
                        {invitation.status === 'accepted' && (
                          <span className="text-green-600">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminInvitationManager;
