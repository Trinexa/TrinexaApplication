import { supabase } from '../lib/supabase';
import {
  Customer,
  Subscription,
  ApiKey,
  SupportTicket,
  Resource,
  UsageAnalytics,
  BusinessMetrics,
  Integration,
  Webhook,
  Campaign,
  Event,
  WorkflowTemplate,
  AuditLog,
  Notification,
  ForumPost,
  ChatbotConversation
} from '../types/enterprise';

export const enterpriseApi = {
  // Customer Management
  customers: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Customer[];
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Customer;
    },

    create: async (customer: Omit<Customer, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single();
      
      if (error) throw error;
      return data as Customer;
    },

    update: async (id: string, updates: Partial<Customer>) => {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Customer;
    },

    getUsageAnalytics: async (customerId: string, period: string = '30d') => {
      const { data, error } = await supabase
        .from('usage_analytics')
        .select('*')
        .eq('customer_id', customerId)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data as UsageAnalytics[];
    }
  },

  // Subscription Management
  subscriptions: {
    getByCustomer: async (customerId: string) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('customer_id', customerId)
        .single();
      
      if (error) throw error;
      return data as Subscription;
    },

    create: async (subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(subscription)
        .select()
        .single();
      
      if (error) throw error;
      return data as Subscription;
    },

    update: async (id: string, updates: Partial<Subscription>) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Subscription;
    },

    cancel: async (id: string) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'cancelled',
          cancel_at_period_end: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Subscription;
    }
  },

  // API Key Management
  apiKeys: {
    getByCustomer: async (customerId: string) => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ApiKey[];
    },

    create: async (apiKey: Omit<ApiKey, 'id' | 'created_at' | 'key'>) => {
      const generatedKey = `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      const { data, error } = await supabase
        .from('api_keys')
        .insert({ ...apiKey, key: generatedKey })
        .select()
        .single();
      
      if (error) throw error;
      return data as ApiKey;
    },

    update: async (id: string, updates: Partial<ApiKey>) => {
      const { data, error } = await supabase
        .from('api_keys')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as ApiKey;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },

    incrementUsage: async (keyId: string) => {
      const { data, error } = await supabase
        .rpc('increment_api_usage', { key_id: keyId });
      
      if (error) throw error;
      return data;
    }
  },

  // Support Tickets
  supportTickets: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          customer:customers(name, email, company),
          messages:ticket_messages(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SupportTicket[];
    },

    getByCustomer: async (customerId: string) => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          messages:ticket_messages(*)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SupportTicket[];
    },

    create: async (ticket: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at' | 'messages'>) => {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert(ticket)
        .select()
        .single();
      
      if (error) throw error;
      return data as SupportTicket;
    },

    update: async (id: string, updates: Partial<SupportTicket>) => {
      const { data, error } = await supabase
        .from('support_tickets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as SupportTicket;
    },

    addMessage: async (ticketId: string, message: {
      sender_id: string;
      sender_type: 'customer' | 'admin';
      message: string;
      attachments?: string[];
    }) => {
      const { data, error } = await supabase
        .from('ticket_messages')
        .insert({ ...message, ticket_id: ticketId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Resources
  resources: {
    getAll: async (accessLevel?: string) => {
      let query = supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (accessLevel) {
        query = query.eq('access_level', accessLevel);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Resource[];
    },

    getByCategory: async (category: string) => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Resource[];
    },

    create: async (resource: Omit<Resource, 'id' | 'created_at' | 'updated_at' | 'download_count'>) => {
      const { data, error } = await supabase
        .from('resources')
        .insert({ ...resource, download_count: 0 })
        .select()
        .single();
      
      if (error) throw error;
      return data as Resource;
    },

    update: async (id: string, updates: Partial<Resource>) => {
      const { data, error } = await supabase
        .from('resources')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Resource;
    },

    incrementDownload: async (id: string) => {
      const { data, error } = await supabase
        .rpc('increment_download_count', { resource_id: id });
      
      if (error) throw error;
      return data;
    },

    search: async (query: string) => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Resource[];
    }
  },

  // Business Intelligence
  businessMetrics: {
    getOverview: async () => {
      const { data, error } = await supabase
        .rpc('get_business_metrics');
      
      if (error) throw error;
      return data as BusinessMetrics;
    },

    getRevenueData: async (period: string = '12m') => {
      const { data, error } = await supabase
        .from('revenue_analytics')
        .select('*')
        .gte('date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data;
    },

    getCustomerGrowth: async (period: string = '12m') => {
      const { data, error } = await supabase
        .from('customer_growth_analytics')
        .select('*')
        .gte('date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data;
    },

    getChurnAnalysis: async () => {
      const { data, error } = await supabase
        .rpc('get_churn_analysis');
      
      if (error) throw error;
      return data;
    }
  },

  // Integrations
  integrations: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Integration[];
    },

    create: async (integration: Omit<Integration, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('integrations')
        .insert(integration)
        .select()
        .single();
      
      if (error) throw error;
      return data as Integration;
    },

    update: async (id: string, updates: Partial<Integration>) => {
      const { data, error } = await supabase
        .from('integrations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Integration;
    }
  },

  // Webhooks
  webhooks: {
    getByCustomer: async (customerId: string) => {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Webhook[];
    },

    create: async (webhook: Omit<Webhook, 'id' | 'created_at' | 'secret' | 'failure_count'>) => {
      const secret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      const { data, error } = await supabase
        .from('webhooks')
        .insert({ ...webhook, secret, failure_count: 0 })
        .select()
        .single();
      
      if (error) throw error;
      return data as Webhook;
    },

    update: async (id: string, updates: Partial<Webhook>) => {
      const { data, error } = await supabase
        .from('webhooks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Webhook;
    },

    trigger: async (webhookId: string, payload: any) => {
      const { data, error } = await supabase
        .rpc('trigger_webhook', { webhook_id: webhookId, payload });
      
      if (error) throw error;
      return data;
    }
  },

  // Campaigns
  campaigns: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Campaign[];
    },

    create: async (campaign: Omit<Campaign, 'id' | 'created_at' | 'sent_count' | 'open_rate' | 'click_rate'>) => {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({ ...campaign, sent_count: 0, open_rate: 0, click_rate: 0 })
        .select()
        .single();
      
      if (error) throw error;
      return data as Campaign;
    },

    update: async (id: string, updates: Partial<Campaign>) => {
      const { data, error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Campaign;
    },

    send: async (id: string) => {
      const { data, error } = await supabase
        .rpc('send_campaign', { campaign_id: id });
      
      if (error) throw error;
      return data;
    }
  },

  // Events
  events: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      return data as Event[];
    },

    create: async (event: Omit<Event, 'id' | 'created_at' | 'registered_count'>) => {
      const { data, error } = await supabase
        .from('events')
        .insert({ ...event, registered_count: 0 })
        .select()
        .single();
      
      if (error) throw error;
      return data as Event;
    },

    register: async (eventId: string, userId: string) => {
      const { data, error } = await supabase
        .from('event_registrations')
        .insert({ event_id: eventId, user_id: userId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    getRegistrations: async (eventId: string) => {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          user:users(name, email)
        `)
        .eq('event_id', eventId);
      
      if (error) throw error;
      return data;
    }
  },

  // Workflows
  workflows: {
    getTemplates: async () => {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false });
      
      if (error) throw error;
      return data as WorkflowTemplate[];
    },

    createTemplate: async (template: Omit<WorkflowTemplate, 'id' | 'created_at' | 'usage_count'>) => {
      const { data, error } = await supabase
        .from('workflow_templates')
        .insert({ ...template, usage_count: 0 })
        .select()
        .single();
      
      if (error) throw error;
      return data as WorkflowTemplate;
    },

    executeWorkflow: async (templateId: string, context: any) => {
      const { data, error } = await supabase
        .rpc('execute_workflow', { template_id: templateId, context });
      
      if (error) throw error;
      return data;
    }
  },

  // Audit Logs
  auditLogs: {
    getAll: async (limit: number = 100) => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as AuditLog[];
    },

    create: async (log: Omit<AuditLog, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert(log)
        .select()
        .single();
      
      if (error) throw error;
      return data as AuditLog;
    },

    search: async (filters: {
      user_id?: string;
      action?: string;
      resource_type?: string;
      start_date?: string;
      end_date?: string;
    }) => {
      let query = supabase
        .from('audit_logs')
        .select('*');

      if (filters.user_id) query = query.eq('user_id', filters.user_id);
      if (filters.action) query = query.eq('action', filters.action);
      if (filters.resource_type) query = query.eq('resource_type', filters.resource_type);
      if (filters.start_date) query = query.gte('created_at', filters.start_date);
      if (filters.end_date) query = query.lte('created_at', filters.end_date);

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AuditLog[];
    }
  },

  // Notifications
  notifications: {
    getByUser: async (userId: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Notification[];
    },

    create: async (notification: Omit<Notification, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();
      
      if (error) throw error;
      return data as Notification;
    },

    markAsRead: async (id: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Notification;
    },

    markAllAsRead: async (userId: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      
      if (error) throw error;
      return data;
    }
  },

  // Forum
  forum: {
    getPosts: async (category?: string) => {
      let query = supabase
        .from('forum_posts')
        .select(`
          *,
          user:users(name, email),
          replies:forum_replies(count)
        `)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as ForumPost[];
    },

    createPost: async (post: Omit<ForumPost, 'id' | 'created_at' | 'updated_at' | 'upvotes' | 'downvotes' | 'reply_count'>) => {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({ ...post, upvotes: 0, downvotes: 0, reply_count: 0 })
        .select()
        .single();
      
      if (error) throw error;
      return data as ForumPost;
    },

    vote: async (postId: string, voteType: 'up' | 'down') => {
      const { data, error } = await supabase
        .rpc('vote_forum_post', { post_id: postId, vote_type: voteType });
      
      if (error) throw error;
      return data;
    },

    search: async (query: string) => {
      const { data, error } = await supabase
        .from('forum_posts')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ForumPost[];
    }
  },

  // Chatbot
  chatbot: {
    getConversations: async (userId?: string) => {
      let query = supabase
        .from('chatbot_conversations')
        .select(`
          *,
          messages:chat_messages(*)
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as ChatbotConversation[];
    },

    createConversation: async (userId?: string) => {
      const sessionId = `session_${Math.random().toString(36).substring(2, 15)}`;
      
      const { data, error } = await supabase
        .from('chatbot_conversations')
        .insert({ 
          user_id: userId,
          session_id: sessionId,
          status: 'active'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as ChatbotConversation;
    },

    addMessage: async (conversationId: string, message: {
      sender_type: 'user' | 'bot' | 'agent';
      message: string;
      intent?: string;
      confidence?: number;
    }) => {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({ ...message, conversation_id: conversationId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    processMessage: async (message: string, conversationId: string) => {
      // Simple AI response logic - in production, integrate with actual AI service
      const responses = [
        "I understand you're looking for help. Let me assist you with that.",
        "That's a great question! Here's what I can tell you...",
        "I'd be happy to help you with that. Can you provide more details?",
        "Based on your question, I recommend checking our documentation.",
        "Let me connect you with a human agent for better assistance."
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      return {
        message: response,
        intent: 'general_inquiry',
        confidence: 0.8
      };
    }
  }
};