import { supabase } from '../lib/supabase';

export interface DashboardStats {
  totalUsers: number;
  totalUsersChange: string;
  demoRequests: number;
  demoRequestsChange: string;
  messages: number;
  messagesChange: string;
  conversionRate: number;
  conversionRateChange: string;
}

export interface UserActivityData {
  name: string;
  users: number;
}

export interface DemoRequestsData {
  name: string;
  requests: number;
}

export interface ProductUsageData {
  name: string;
  value: number;
}

export interface RecentActivity {
  id: string;
  type: 'demo_request' | 'new_user' | 'support' | 'application';
  title: string;
  company: string;
  status: 'pending' | 'completed' | 'in_progress' | 'open' | 'scheduled';
  time: string;
}

export interface DashboardData {
  stats: DashboardStats;
  userActivity: UserActivityData[];
  demoRequests: DemoRequestsData[];
  productUsage: ProductUsageData[];
  recentActivity: RecentActivity[];
}

export class DashboardService {
  // Calculate percentage change between two values
  private calculateChange(current: number, previous: number): string {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  }

  // Format time ago
  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    return date.toLocaleDateString();
  }

  // Get dashboard statistics
  async getDashboardStats(timeRange: string = 'week'): Promise<DashboardStats> {
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    // Calculate date ranges based on timeRange
    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 48 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    }

    try {
      // Get total newsletter subscribers (as user count)
      const { count: totalUsers } = await supabase
        .from('newsletter_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { count: previousUsers } = await supabase
        .from('newsletter_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .lt('subscribed_at', startDate.toISOString());

      // Get demo requests
      const { count: demoRequests } = await supabase
        .from('demo_bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      const { count: previousDemoRequests } = await supabase
        .from('demo_bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      // Get support messages/tickets
      const { count: messages } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      const { count: previousMessages } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      // Calculate conversion rate (demo requests / total users)
      const currentConversionRate = totalUsers ? (demoRequests || 0) / (totalUsers || 1) * 100 : 0;
      const previousConversionRate = previousUsers ? (previousDemoRequests || 0) / (previousUsers || 1) * 100 : 0;

      return {
        totalUsers: totalUsers || 0,
        totalUsersChange: this.calculateChange(totalUsers || 0, (previousUsers || 0)),
        demoRequests: demoRequests || 0,
        demoRequestsChange: this.calculateChange(demoRequests || 0, previousDemoRequests || 0),
        messages: messages || 0,
        messagesChange: this.calculateChange(messages || 0, previousMessages || 0),
        conversionRate: parseFloat(currentConversionRate.toFixed(1)),
        conversionRateChange: this.calculateChange(currentConversionRate, previousConversionRate),
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalUsers: 0,
        totalUsersChange: '0%',
        demoRequests: 0,
        demoRequestsChange: '0%',
        messages: 0,
        messagesChange: '0%',
        conversionRate: 0,
        conversionRateChange: '0%',
      };
    }
  }

  // Get user activity data (last 7 days)
  async getUserActivity(): Promise<UserActivityData[]> {
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('subscribed_at')
        .gte('subscribed_at', sevenDaysAgo.toISOString())
        .order('subscribed_at', { ascending: true });

      if (error) throw error;

      // Group by day
      const dailyData: { [key: string]: number } = {};
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      // Initialize all days with 0
      for (let i = 0; i < 7; i++) {
        const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
        const dayName = days[date.getDay()];
        dailyData[dayName] = 0;
      }

      // Count actual data
      data?.forEach(item => {
        const date = new Date(item.subscribed_at);
        const dayName = days[date.getDay()];
        if (dailyData.hasOwnProperty(dayName)) {
          dailyData[dayName]++;
        }
      });

      return Object.entries(dailyData).map(([name, users]) => ({ name, users }));
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [
        { name: 'Mon', users: 0 },
        { name: 'Tue', users: 0 },
        { name: 'Wed', users: 0 },
        { name: 'Thu', users: 0 },
        { name: 'Fri', users: 0 },
        { name: 'Sat', users: 0 },
        { name: 'Sun', users: 0 }
      ];
    }
  }

  // Get demo requests data (last 6 months)
  async getDemoRequests(): Promise<DemoRequestsData[]> {
    try {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

      const { data, error } = await supabase
        .from('demo_bookings')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by month
      const monthlyData: { [key: string]: number } = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      // Initialize last 6 months with 0
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = months[date.getMonth()];
        monthlyData[monthName] = 0;
      }

      // Count actual data
      data?.forEach(item => {
        const date = new Date(item.created_at);
        const monthName = months[date.getMonth()];
        if (monthlyData.hasOwnProperty(monthName)) {
          monthlyData[monthName]++;
        }
      });

      return Object.entries(monthlyData).map(([name, requests]) => ({ name, requests }));
    } catch (error) {
      console.error('Error fetching demo requests:', error);
      return [
        { name: 'Jan', requests: 0 },
        { name: 'Feb', requests: 0 },
        { name: 'Mar', requests: 0 },
        { name: 'Apr', requests: 0 },
        { name: 'May', requests: 0 },
        { name: 'Jun', requests: 0 }
      ];
    }
  }

  // Get product usage data (based on demo bookings product interest)
  async getProductUsage(): Promise<ProductUsageData[]> {
    try {
      const { data, error } = await supabase
        .from('demo_bookings')
        .select('product_interest');

      if (error) throw error;

      // Count product interests
      const productCounts: { [key: string]: number } = {};
      data?.forEach(item => {
        const product = item.product_interest || 'Other';
        productCounts[product] = (productCounts[product] || 0) + 1;
      });

      // Convert to array and sort by count
      const productArray = Object.entries(productCounts)
        .map(([name, count]) => ({ name, value: count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 4); // Top 4 products

      // If no data, return default products
      if (productArray.length === 0) {
        return [
          { name: 'NexusAnalytics', value: 0 },
          { name: 'NexusGuard', value: 0 },
          { name: 'NexusFlow', value: 0 },
          { name: 'NexusAssist', value: 0 }
        ];
      }

      return productArray;
    } catch (error) {
      console.error('Error fetching product usage:', error);
      return [
        { name: 'NexusAnalytics', value: 0 },
        { name: 'NexusGuard', value: 0 },
        { name: 'NexusFlow', value: 0 },
        { name: 'NexusAssist', value: 0 }
      ];
    }
  }

  // Get recent activity
  async getRecentActivity(): Promise<RecentActivity[]> {
    try {
      const activities: RecentActivity[] = [];

      // Get recent demo requests
      const { data: demoData } = await supabase
        .from('demo_bookings')
        .select('id, name, company, status, created_at, product_interest')
        .order('created_at', { ascending: false })
        .limit(5);

      demoData?.forEach(item => {
        activities.push({
          id: item.id,
          type: 'demo_request',
          title: `Demo Request: ${item.product_interest || 'Product Demo'}`,
          company: item.company || item.name,
          status: item.status || 'pending',
          time: this.formatTimeAgo(new Date(item.created_at))
        });
      });

      // Get recent newsletter subscriptions (as new users)
      const { data: userData } = await supabase
        .from('newsletter_subscriptions')
        .select('id, email, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      userData?.forEach(item => {
        activities.push({
          id: item.id,
          type: 'new_user',
          title: 'New Newsletter Subscription',
          company: item.email.split('@')[1] || 'Unknown Company',
          status: 'completed',
          time: this.formatTimeAgo(new Date(item.created_at))
        });
      });

      // Get recent support tickets
      const { data: supportData } = await supabase
        .from('support_tickets')
        .select('id, subject, status, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      supportData?.forEach(item => {
        activities.push({
          id: item.id,
          type: 'support',
          title: `Support: ${item.subject}`,
          company: 'Support Request',
          status: item.status === 'open' ? 'pending' : item.status,
          time: this.formatTimeAgo(new Date(item.created_at))
        });
      });

      // Get recent job applications
      const { data: applicationData } = await supabase
        .from('general_applications')
        .select('id, name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(2);

      applicationData?.forEach(item => {
        activities.push({
          id: item.id,
          type: 'application',
          title: 'New Job Application',
          company: item.email.split('@')[1] || item.name,
          status: 'pending',
          time: this.formatTimeAgo(new Date(item.created_at))
        });
      });

      // Sort all activities by most recent and limit to 10
      // Since we're already sorting by created_at in individual queries, 
      // we just need to limit the results
      return activities.slice(0, 10);

    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  // Get all dashboard data
  async getDashboardData(timeRange: string = 'week'): Promise<DashboardData> {
    try {
      const [stats, userActivity, demoRequests, productUsage, recentActivity] = await Promise.all([
        this.getDashboardStats(timeRange),
        this.getUserActivity(),
        this.getDemoRequests(),
        this.getProductUsage(),
        this.getRecentActivity()
      ]);

      return {
        stats,
        userActivity,
        demoRequests,
        productUsage,
        recentActivity
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
