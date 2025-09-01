import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileEdit, 
  MessageSquare, 
  Users, 
  Package, 
  Calendar,
  Menu,
  X,
  LogOut,
  Bell,
  Settings,
  FileText,
  BarChart3,
  Mail,
  ScrollText
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAdmin();
  const { getSetting } = useSystemSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Get dynamic branding settings
  const logoUrl = getSetting('logo_url');
  const companyName = getSetting('company_name') || 'Trinexa';

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Business Intelligence', href: '/admin/business-intelligence', icon: BarChart3 },
    { name: 'Page Management', href: '/admin/pages', icon: FileEdit },
    { name: 'Content Management', href: '/admin/content', icon: FileText },
    { name: 'Email Management', href: '/admin/email', icon: Mail },
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
    { name: 'Recruitment', href: '/admin/recruitment', icon: Users },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Demo Sessions', href: '/admin/demo-sessions', icon: Calendar },
    { name: 'System Logs', href: '/admin/logs', icon: ScrollText },
    { name: 'Settings', href: '/admin/settings', icon: Settings }
  ];

  const notifications = [
    { id: 1, title: 'New demo request', message: 'TechCorp requested a product demo', time: '5m ago' },
    { id: 2, title: 'Application received', message: 'New job application for AI Engineer', time: '1h ago' },
    { id: 3, title: 'System update', message: 'New features deployed successfully', time: '2h ago' },
    { id: 4, title: 'Scheduled message', message: 'Weekly newsletter sent to 1,247 subscribers', time: '3h ago' },
    { id: 5, title: 'Product analytics', message: 'NexusAnalytics usage increased by 15%', time: '4h ago' }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link to="/admin" className="flex items-center space-x-3">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="w-10 h-10 rounded-lg object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{companyName.charAt(0)}</span>
                </div>
              )}
              <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                {companyName}
              </span>
            </Link>
            <button
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-green-500' : 'text-gray-400'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user?.email?.[0].toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Top bar */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 bg-white border-b">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              className="text-gray-500 lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none relative"
                >
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50 border">
                    <div className="px-4 py-2 border-b">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-500">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t">
                      <button className="text-sm text-green-600 hover:text-green-500 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/admin/settings" className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none">
                <Settings className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;