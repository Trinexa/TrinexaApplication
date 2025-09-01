import { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  Clock3,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Card from '../../components/common/Card';
import { dashboardService, DashboardData } from '../../services/dashboardApi';

const DashboardPage = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardData(timeRange);
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate stats data from dashboard data
  const stats = dashboardData ? [
    {
      name: 'Total Users',
      value: dashboardData.stats.totalUsers.toLocaleString(),
      change: dashboardData.stats.totalUsersChange,
      trend: dashboardData.stats.totalUsersChange.startsWith('+') ? 'up' : 'down',
      icon: Users
    },
    {
      name: 'Demo Requests',
      value: dashboardData.stats.demoRequests.toLocaleString(),
      change: dashboardData.stats.demoRequestsChange,
      trend: dashboardData.stats.demoRequestsChange.startsWith('+') ? 'up' : 'down',
      icon: Calendar
    },
    {
      name: 'Messages',
      value: dashboardData.stats.messages.toLocaleString(),
      change: dashboardData.stats.messagesChange,
      trend: dashboardData.stats.messagesChange.startsWith('+') ? 'up' : 'down',
      icon: MessageSquare
    },
    {
      name: 'Conversion Rate',
      value: `${dashboardData.stats.conversionRate}%`,
      change: dashboardData.stats.conversionRateChange,
      trend: dashboardData.stats.conversionRateChange.startsWith('+') ? 'up' : 'down',
      icon: TrendingUp
    }
  ] : [];

  const userActivityData = dashboardData?.userActivity || [];
  const demoRequestsData = dashboardData?.demoRequests || [];
  const productUsageData = dashboardData?.productUsage || [];
  const recentActivity = dashboardData?.recentActivity || [];

  const COLORS = ['#10B981', '#3B82F6', '#6366F1', '#8B5CF6'];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock3 className="h-5 w-5 text-yellow-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'scheduled':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'open':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={loadDashboardData}
                className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Dashboard Overview</h1>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="day">Last 24 hours</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="year">Last year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.name} className="relative overflow-hidden">
            <div className="absolute top-0 right-0 mt-4 mr-4 text-gray-400 opacity-20">
              <stat.icon className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-600">{stat.name}</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
              <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 ml-1" />
                )}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Activity Chart */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Activity</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userActivityData}>
                <defs>
                  <linearGradient id="userActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#10B981" 
                  fillOpacity={1} 
                  fill="url(#userActivity)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Demo Requests Chart */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Demo Requests</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demoRequestsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="requests" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Usage Chart */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Usage</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productUsageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {productUsageData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {productUsageData.map((product, index) => (
              <div key={product.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-600">{product.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start p-4 bg-gray-50 rounded-lg">
                  {getStatusIcon(activity.status)}
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.company}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent activity to display</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;