import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Key, 
  CreditCard, 
  HelpCircle, 
  Download,
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  Calendar,
  Bell,
  Settings
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { enterpriseApi } from '../../services/enterpriseApi';
import { Customer, UsageAnalytics } from '../../types/enterprise';

const CustomerDashboard = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [usageData, setUsageData] = useState<UsageAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock customer ID - in real app, get from auth context
  const customerId = '550e8400-e29b-41d4-a716-446655440001';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [customerData, analyticsData] = await Promise.all([
        enterpriseApi.customers.getById(customerId),
        enterpriseApi.customers.getUsageAnalytics(customerId)
      ]);
      
      setCustomer(customerData);
      setUsageData(analyticsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const usageChartData = usageData.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    usage: item.metric_value
  }));

  const productUsageData = [
    { name: 'NexusAnalytics', value: 45, color: '#10B981' },
    { name: 'NexusGuard', value: 30, color: '#3B82F6' },
    { name: 'NexusFlow', value: 25, color: '#6366F1' }
  ];

  const quickStats = [
    {
      title: 'API Calls This Month',
      value: customer?.monthly_usage?.toLocaleString() || '0',
      change: '+12%',
      icon: Activity,
      color: 'text-green-600'
    },
    {
      title: 'Total Usage',
      value: customer?.total_usage?.toLocaleString() || '0',
      change: '+8%',
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      title: 'Active Projects',
      value: '8',
      change: '+2',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Cost This Month',
      value: '$1,299',
      change: '+5%',
      icon: DollarSign,
      color: 'text-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {customer?.name}
              </h1>
              <p className="text-gray-600">
                {customer?.company} • {customer?.subscription_plan} Plan
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" icon={<Bell />}>
                Notifications
              </Button>
              <Button variant="outline" icon={<Settings />}>
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${stat.color}`}>{stat.change} from last month</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Usage Analytics */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Usage Analytics</h3>
              <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="usage" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Product Usage Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Product Usage</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {productUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {productUsageData.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: product.color }}
                    />
                    <span className="text-sm text-gray-600">{product.name}</span>
                  </div>
                  <span className="text-sm font-medium">{product.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <Key className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold">API Keys</h4>
                <p className="text-sm text-gray-600">Manage your API access</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Billing</h4>
                <p className="text-sm text-gray-600">View invoices & payments</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <HelpCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold">Support</h4>
                <p className="text-sm text-gray-600">Get help & documentation</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg mr-4">
                <Download className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold">Resources</h4>
                <p className="text-sm text-gray-600">Download guides & tools</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8 p-6">
          <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'API key created', time: '2 hours ago', status: 'success' },
              { action: 'Webhook configured', time: '1 day ago', status: 'success' },
              { action: 'Support ticket resolved', time: '2 days ago', status: 'success' },
              { action: 'Payment processed', time: '3 days ago', status: 'success' },
              { action: 'Usage limit warning', time: '5 days ago', status: 'warning' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    activity.status === 'success' ? 'bg-green-500' : 
                    activity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-gray-900">{activity.action}</span>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDashboard;