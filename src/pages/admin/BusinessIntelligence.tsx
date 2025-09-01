import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { enterpriseApi } from '../../services/enterpriseApi';
import { BusinessMetrics } from '../../types/enterprise';

const BusinessIntelligence = () => {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [customerGrowth, setCustomerGrowth] = useState<any[]>([]);
  const [churnAnalysis, setChurnAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('12m');

  const COLORS = ['#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#F59E0B'];

  useEffect(() => {
    loadBusinessData();
  }, [timeRange]);

  const loadBusinessData = async () => {
    setLoading(true);
    try {
      const [metricsData, revenueAnalytics, growthData, churnData] = await Promise.all([
        enterpriseApi.businessMetrics.getOverview(),
        enterpriseApi.businessMetrics.getRevenueData(timeRange),
        enterpriseApi.businessMetrics.getCustomerGrowth(timeRange),
        enterpriseApi.businessMetrics.getChurnAnalysis()
      ]);
      
      setMetrics(metricsData);
      setRevenueData(revenueAnalytics);
      setCustomerGrowth(growthData);
      setChurnAnalysis(churnData);
    } catch (error) {
      console.error('Error loading business data:', error);
      // Set dummy data for demo
      setMetrics({
        total_revenue: 2450000,
        monthly_recurring_revenue: 185000,
        annual_recurring_revenue: 2220000,
        customer_count: 1247,
        churn_rate: 2.3,
        growth_rate: 15.7,
        average_revenue_per_user: 1485,
        customer_lifetime_value: 18500
      });
      
      setRevenueData([
        { month: 'Jan', revenue: 145000, mrr: 142000 },
        { month: 'Feb', revenue: 152000, mrr: 148000 },
        { month: 'Mar', revenue: 168000, mrr: 155000 },
        { month: 'Apr', revenue: 175000, mrr: 162000 },
        { month: 'May', revenue: 182000, mrr: 168000 },
        { month: 'Jun', revenue: 195000, mrr: 175000 },
        { month: 'Jul', revenue: 205000, mrr: 182000 },
        { month: 'Aug', revenue: 218000, mrr: 188000 },
        { month: 'Sep', revenue: 225000, mrr: 195000 },
        { month: 'Oct', revenue: 235000, mrr: 202000 },
        { month: 'Nov', revenue: 248000, mrr: 210000 },
        { month: 'Dec', revenue: 265000, mrr: 218000 }
      ]);
      
      setCustomerGrowth([
        { month: 'Jan', new_customers: 45, churned: 8, net_growth: 37 },
        { month: 'Feb', new_customers: 52, churned: 12, net_growth: 40 },
        { month: 'Mar', new_customers: 68, churned: 15, net_growth: 53 },
        { month: 'Apr', new_customers: 75, churned: 18, net_growth: 57 },
        { month: 'May', new_customers: 82, churned: 22, net_growth: 60 },
        { month: 'Jun', new_customers: 95, churned: 25, net_growth: 70 }
      ]);
      
      setChurnAnalysis({
        by_plan: [
          { plan: 'Starter', churn_rate: 4.2, customers: 520 },
          { plan: 'Professional', churn_rate: 1.8, customers: 485 },
          { plan: 'Enterprise', churn_rate: 0.9, customers: 242 }
        ],
        reasons: [
          { reason: 'Price', percentage: 35 },
          { reason: 'Features', percentage: 28 },
          { reason: 'Support', percentage: 15 },
          { reason: 'Competition', percentage: 12 },
          { reason: 'Other', percentage: 10 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const reportData = {
      metrics,
      revenue_data: revenueData,
      customer_growth: customerGrowth,
      churn_analysis: churnAnalysis,
      generated_at: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-intelligence-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Intelligence</h1>
          <p className="text-gray-600">Comprehensive analytics and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
            <option value="12m">Last 12 months</option>
            <option value="24m">Last 24 months</option>
          </select>
          <Button
            variant="outline"
            onClick={loadBusinessData}
            icon={<RefreshCw />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={exportReport}
            icon={<Download />}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${metrics?.total_revenue.toLocaleString()}
              </p>
              <p className="text-sm text-green-600">+{metrics?.growth_rate}% growth</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${metrics?.monthly_recurring_revenue.toLocaleString()}
              </p>
              <p className="text-sm text-blue-600">+12.5% from last month</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics?.customer_count.toLocaleString()}
              </p>
              <p className="text-sm text-purple-600">+8.3% this month</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Churn Rate</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.churn_rate}%</p>
              <p className="text-sm text-red-600">-0.5% improvement</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Revenue Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  fillOpacity={1} 
                  fill="url(#revenueGradient)" 
                />
                <Line 
                  type="monotone" 
                  dataKey="mrr" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Customer Growth</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="new_customers" fill="#10B981" name="New Customers" />
                <Bar dataKey="churned" fill="#EF4444" name="Churned" />
                <Bar dataKey="net_growth" fill="#3B82F6" name="Net Growth" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Churn Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Churn by Subscription Plan</h3>
          <div className="space-y-4">
            {churnAnalysis?.by_plan?.map((plan: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{plan.plan}</h4>
                  <p className="text-sm text-gray-600">{plan.customers} customers</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{plan.churn_rate}%</p>
                  <p className="text-sm text-gray-600">churn rate</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Churn Reasons</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={churnAnalysis?.reasons}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="percentage"
                  nameKey="reason"
                >
                  {churnAnalysis?.reasons?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {churnAnalysis?.reasons?.map((reason: any, index: number) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm">{reason.reason}: {reason.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-2">Average Revenue Per User</h4>
          <p className="text-2xl font-bold text-green-600">
            ${metrics?.average_revenue_per_user.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">+5.2% from last month</p>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-2">Customer Lifetime Value</h4>
          <p className="text-2xl font-bold text-blue-600">
            ${metrics?.customer_lifetime_value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">+8.7% from last month</p>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-2">Annual Recurring Revenue</h4>
          <p className="text-2xl font-bold text-purple-600">
            ${metrics?.annual_recurring_revenue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">+15.3% year over year</p>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-2">Growth Rate</h4>
          <p className="text-2xl font-bold text-orange-600">{metrics?.growth_rate}%</p>
          <p className="text-sm text-gray-600">Monthly growth rate</p>
        </Card>
      </div>
    </div>
  );
};

export default BusinessIntelligence;