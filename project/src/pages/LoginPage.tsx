import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Brain, Zap, Shield, BarChart, User, Settings } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useUser } from '../contexts/UserContext';
import Button from '../components/common/Button';
import { supabase } from '../lib/supabase';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login: adminLogin } = useAdmin();
  const { login: userLogin } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate inputs
    if (!email?.trim() || !password?.trim()) {
      setError('Email and password are required');
      setIsLoading(false);
      return;
    }

    const emailValue = email.trim();
    const passwordValue = password.trim();

    try {
      console.log('Attempting login for:', emailValue);

      // First check if user is an admin
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', emailValue)
        .eq('account_status', 'active')
        .maybeSingle();

      if (adminUser && !adminError) {
        console.log('Admin user found, using admin login flow');
        // User is an admin - use admin login flow
        await adminLogin(emailValue, passwordValue);
        navigate('/admin/dashboard', { replace: true });
      } else {
        console.log('Admin user not found, trying regular user login');
        // Try regular user login
        await userLogin(emailValue, passwordValue);
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-green-600/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 relative mr-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-green-400 rounded-full" />
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-3 bg-green-400 rounded-full" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-green-400 rounded-full" />
                <div className="absolute top-1/2 transform translate-y-[-50%] left-1/2 -translate-x-1/2 w-8 h-8 border-[3px] border-green-400 rotate-45" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Trinexa
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Welcome Back
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Access your personalized dashboard and explore AI-powered solutions that transform your business.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <Brain className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <h3 className="font-semibold">AI Analytics</h3>
                <p className="text-sm text-gray-300">Advanced insights</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <Shield className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <h3 className="font-semibold">Security</h3>
                <p className="text-sm text-gray-300">Enterprise-grade</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <Zap className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <h3 className="font-semibold">Automation</h3>
                <p className="text-sm text-gray-300">Intelligent workflows</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <BarChart className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-gray-300">Real-time data</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-green-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-600/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-green-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-4">
                <LogIn className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
              <p className="mt-2 text-gray-600">
                Access your account to continue
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={isLoading}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-green-600 hover:text-green-500 font-medium">
                  Sign up here
                </Link>
              </p>
            </div>

            <div className="mt-6 text-center border-t pt-6">
              <p className="text-xs text-gray-500 mb-2">
                Demo Accounts:
              </p>
              <div className="text-xs text-gray-600 space-y-1 mb-4">
                <div className="flex items-center justify-center">
                  <Settings className="h-3 w-3 mr-1" />
                  <span>Admin: admin@trinexa.com / admin123</span>
                </div>
                <div className="flex items-center justify-center">
                  <User className="h-3 w-3 mr-1" />
                  <span>User: demo@user.com / demo123</span>
                </div>
              </div>
              <div className="text-center">
                <Link 
                  to="/admin/setup" 
                  className="text-xs text-blue-600 hover:text-blue-500"
                >
                  First time? Set up admin user →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
