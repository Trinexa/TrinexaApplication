import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import { 
  setupDefaultAdmin, 
  setupDefaultUser, 
  createAdminUser, 
  createRegularUser,
  validateDatabaseSetup,
  performCompleteSetup 
} from '../../utils/setupAdmin';
import { testUserAuth } from '../../utils/userAuth';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface ValidationResult {
  success: boolean;
  adminUsersCount?: number;
  regularUsersCount?: number;
  hasActiveSession?: boolean;
  issues?: string[];
  recommendations?: string[];
}

export const AdminSetup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [createdUsers, setCreatedUsers] = useState<any[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Validate database setup on component mount
    const checkDatabase = async () => {
      try {
        const result = await validateDatabaseSetup();
        setValidation(result);
        if (!result.success) {
          setMessage(`⚠️ Database issues detected: ${result.issues?.join(', ')}`);
        }
      } catch (error) {
        console.error('Initial validation error:', error);
        setMessage('⚠️ Unable to validate database setup');
      }
    };
    
    checkDatabase();
  }, []);

  const handleCompleteSetup = async () => {
    setLoading(true);
    setMessage('🚀 Performing complete system setup...');
    
    try {
      const result = await performCompleteSetup();
      
      if (result.success) {
        const users = [];
        if (result.adminUsersCreated) {
          users.push({
            type: 'Admin',
            email: 'admin@trinexa.com',
            password: 'admin123',
            id: 'created'
          });
        }
        if (result.regularUsersCreated) {
          users.push({
            type: 'Demo User',
            email: 'demo@user.com',
            password: 'demo123',
            id: 'created'
          });
        }
        
        setCreatedUsers(users);
        setValidation(result.finalState);
        
        if (users.length > 0) {
          setMessage('✅ Complete setup finished! Users created successfully.');
        } else {
          setMessage('ℹ️ Setup complete! All required users already exist.');
        }
      }
    } catch (error: any) {
      console.error('Complete setup error:', error);
      setMessage(`❌ Setup Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupDefaultUsers = async () => {
    setLoading(true);
    setMessage('Creating default users...');
    
    try {
      // Create admin user
      const adminUser = await setupDefaultAdmin();
      console.log('Admin user created:', adminUser);
      
      // Create demo user
      const demoUser = await setupDefaultUser();
      console.log('Demo user created:', demoUser);
      
      setCreatedUsers([
        { 
          type: 'Admin', 
          email: 'admin@trinexa.com', 
          password: 'admin123',
          id: adminUser?.id || 'created'
        },
        { 
          type: 'Demo User', 
          email: 'demo@user.com', 
          password: 'demo123',
          id: demoUser?.id || 'created'
        }
      ]);
      
      setMessage('✅ Default users created successfully!');
      
      // Re-validate after creation
      const newValidation = await validateDatabaseSetup();
      setValidation(newValidation);
      
    } catch (error: any) {
      console.error('Setup error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomAdmin = async () => {
    const email = prompt('Enter admin email:');
    const password = prompt('Enter admin password:');
    
    if (!email || !password) {
      setMessage('❌ Email and password are required');
      return;
    }
    
    setLoading(true);
    setMessage('Creating custom admin user...');
    
    try {
      const adminUser = await createAdminUser(email, password);
      console.log('Custom admin created:', adminUser);
      
      setCreatedUsers(prev => [...prev, { 
        type: 'Admin', 
        email, 
        password,
        id: adminUser?.id || 'created'
      }]);
      
      setMessage(`✅ Admin user ${email} created successfully!`);
    } catch (error: any) {
      console.error('Setup error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomUser = async () => {
    const email = prompt('Enter user email:');
    const password = prompt('Enter user password:');
    const fullName = prompt('Enter user full name:');
    
    if (!email || !password || !fullName) {
      setMessage('❌ All fields are required');
      return;
    }
    
    setLoading(true);
    setMessage('Creating custom user...');
    
    try {
      const user = await createRegularUser(email, password, fullName);
      console.log('Custom user created:', user);
      
      setCreatedUsers(prev => [...prev, { 
        type: 'User', 
        email, 
        password,
        fullName,
        id: user?.id || 'created'
      }]);
      
      setMessage(`✅ User ${email} created successfully!`);
    } catch (error: any) {
      console.error('Setup error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    navigate('/admin/login');
  };

  const handleTestAdminAuth = async () => {
    setLoading(true);
    setMessage('🧪 Testing admin authentication...');
    
    try {
      const result = await api.admin.login('admin@trinexa.com', 'admin123');
      console.log('Admin auth test result:', result);
      setMessage('✅ Admin authentication test successful!');
      
      // Sign out after test
      await api.admin.logout();
    } catch (error: any) {
      console.error('Admin auth test error:', error);
      setMessage(`❌ Admin Auth Test Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestUserAuth = async () => {
    setLoading(true);
    setMessage('🧪 Testing user authentication...');
    
    try {
      const result = await testUserAuth('demo@user.com', 'demo123');
      console.log('User auth test result:', result);
      
      if (result.success) {
        setMessage('✅ User authentication test successful!');
      } else {
        setMessage(`❌ User Auth Test Failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error('User auth test error:', error);
      setMessage(`❌ User Auth Test Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Setup</h2>
            <p className="text-gray-600 mb-8">
              Create admin and user accounts to resolve authentication issues
            </p>
          </div>

          {/* Database Status */}
          {validation && (
            <div className={`mb-6 p-4 rounded-md ${
              validation.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                <span className={`text-sm font-medium ${
                  validation.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  Database Status: {validation.success ? '✅ Healthy' : '❌ Issues Found'}
                </span>
              </div>
              {validation.success && (
                <div className="mt-2 text-sm text-green-700">
                  <div>Admin Users: {validation.adminUsersCount}</div>
                  <div>Regular Users: {validation.regularUsersCount}</div>
                  <div>Auth Session: {validation.hasActiveSession ? 'Active' : 'None'}</div>
                </div>
              )}
              {!validation.success && validation.issues && (
                <div className="mt-2 text-sm text-red-700">
                  {validation.issues.map((issue, index) => (
                    <div key={index}>• {issue}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.includes('❌') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleCompleteSetup}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? 'Setting up...' : '🚀 Complete Setup'}
            </Button>
            
            <div className="text-sm text-gray-600 text-center">
              Automatically validates database and creates necessary users
            </div>

            <div className="border-t pt-4">
              <Button
                onClick={handleSetupDefaultUsers}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 mb-2"
              >
                {loading ? 'Creating...' : 'Create Default Users'}
              </Button>
              
              <div className="text-sm text-gray-600 text-center mb-4">
                Creates: admin@trinexa.com (admin123) and demo@user.com (demo123)
              </div>
            </div>

            <div className="border-t pt-4">
              <Button
                onClick={handleCreateCustomAdmin}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 mb-2"
              >
                Create Custom Admin
              </Button>
              
              <Button
                onClick={handleCreateCustomUser}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Create Custom User
              </Button>
            </div>
          </div>

          {createdUsers.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Created Users</h3>
              <div className="space-y-3">
                {createdUsers.map((user, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm font-medium text-gray-900">
                      {user.type}: {user.email}
                    </div>
                    <div className="text-sm text-gray-600">
                      Password: {user.password}
                    </div>
                    {user.fullName && (
                      <div className="text-sm text-gray-600">
                        Name: {user.fullName}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Test Authentication</h4>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleTestAdminAuth}
                    disabled={loading}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    🧪 Test Admin
                  </Button>
                  <Button
                    onClick={handleTestUserAuth}
                    disabled={loading}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    🧪 Test User
                  </Button>
                </div>
              </div>
              
              <Button
                onClick={goToLogin}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
              >
                Go to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
