export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  subscription_plan: 'starter' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'cancelled' | 'past_due' | 'trial';
  trial_end_date?: string;
  created_at: string;
  last_login?: string;
  total_usage: number;
  monthly_usage: number;
}

export interface Subscription {
  id: string;
  customer_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trial';
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  customer_id: string;
  name: string;
  key: string;
  permissions: string[];
  rate_limit: number;
  usage_count: number;
  last_used?: string;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

export interface SupportTicket {
  id: string;
  customer_id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: 'customer' | 'admin';
  message: string;
  attachments?: string[];
  created_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'template' | 'guide';
  category: string;
  file_url?: string;
  content?: string;
  access_level: 'public' | 'customer' | 'premium';
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface UsageAnalytics {
  id: string;
  customer_id: string;
  product_id: string;
  metric_name: string;
  metric_value: number;
  date: string;
  created_at: string;
}

export interface BusinessMetrics {
  total_revenue: number;
  monthly_recurring_revenue: number;
  annual_recurring_revenue: number;
  customer_count: number;
  churn_rate: number;
  growth_rate: number;
  average_revenue_per_user: number;
  customer_lifetime_value: number;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  type: 'webhook' | 'api' | 'oauth';
  status: 'active' | 'inactive';
  configuration: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Webhook {
  id: string;
  customer_id: string;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  last_triggered?: string;
  failure_count: number;
  created_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused';
  subject?: string;
  content: string;
  target_audience: string;
  scheduled_at?: string;
  sent_count: number;
  open_rate: number;
  click_rate: number;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'webinar' | 'workshop' | 'conference' | 'demo';
  start_date: string;
  end_date: string;
  max_attendees: number;
  registered_count: number;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  meeting_url?: string;
  created_at: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  is_active: boolean;
  usage_count: number;
  created_at: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'delay';
  configuration: Record<string, any>;
  next_step_id?: string;
  order: number;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  channel: 'email' | 'sms' | 'push' | 'in_app';
  is_read: boolean;
  created_at: string;
}

export interface ForumPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  reply_count: number;
  is_solved: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatbotConversation {
  id: string;
  user_id?: string;
  session_id: string;
  messages: ChatMessage[];
  status: 'active' | 'resolved' | 'escalated';
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'bot' | 'agent';
  message: string;
  intent?: string;
  confidence?: number;
  created_at: string;
}