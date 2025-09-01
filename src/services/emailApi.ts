import { supabase } from '../lib/supabase';

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  template_id?: string;
  sender_name: string;
  sender_email: string;
  target_audience: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  scheduled_at?: string;
  sent_at?: string;
  total_recipients: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  unsubscribed_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: 'welcome' | 'newsletter' | 'promotional' | 'transactional' | 'notification' | 'general';
  subject: string;
  content: string;
  variables: string[];
  is_active: boolean;
  usage_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmailRecipient {
  id: string;
  campaign_id: string;
  recipient_email: string;
  recipient_name?: string;
  recipient_type: string;
  recipient_id?: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed';
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  bounced_at?: string;
  unsubscribed_at?: string;
  error_message?: string;
  created_at: string;
}

export interface EmailAnalytics {
  id: string;
  campaign_id: string;
  recipient_id: string;
  event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'complained';
  event_data: Record<string, any>;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
}

export interface EmailList {
  id: string;
  name: string;
  description?: string;
  list_type: 'custom' | 'dynamic' | 'imported';
  criteria: Record<string, any>;
  subscriber_count: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  name?: string;
  preferences: Record<string, boolean>;
  source: string;
  subscribed_at: string;
  unsubscribed_at?: string;
  is_active: boolean;
  verification_token?: string;
  verified_at?: string;
}

export const emailApi = {
  // Email Campaigns
  campaigns: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmailCampaign[];
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as EmailCampaign;
    },

    create: async (campaign: Omit<EmailCampaign, 'id' | 'created_at' | 'updated_at' | 'total_recipients' | 'delivered_count' | 'opened_count' | 'clicked_count' | 'bounced_count' | 'unsubscribed_count'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          ...campaign,
          created_by: user?.id,
          total_recipients: 0,
          delivered_count: 0,
          opened_count: 0,
          clicked_count: 0,
          bounced_count: 0,
          unsubscribed_count: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as EmailCampaign;
    },

    update: async (id: string, updates: Partial<EmailCampaign>) => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as EmailCampaign;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },

    send: async (id: string) => {
      // Get campaign details
      const campaign = await emailApi.campaigns.getById(id);
      
      // Get recipients based on target audience
      const { data: recipients, error: recipientsError } = await supabase
        .rpc('get_email_recipients', { target_audience: campaign.target_audience });
      
      if (recipientsError) throw recipientsError;
      
      // Create recipient records
      const recipientRecords = recipients.map((recipient: any) => ({
        campaign_id: id,
        recipient_email: recipient.email,
        recipient_name: recipient.name,
        recipient_type: recipient.recipient_type,
        recipient_id: recipient.recipient_id,
        status: 'pending'
      }));
      
      const { error: insertError } = await supabase
        .from('email_recipients')
        .insert(recipientRecords);
      
      if (insertError) throw insertError;
      
      // Update campaign status
      await emailApi.campaigns.update(id, {
        status: 'sending',
        sent_at: new Date().toISOString()
      });
      
      // In a real implementation, you would integrate with an email service like SendGrid, Mailgun, etc.
      // For now, we'll simulate sending by updating recipient statuses
      setTimeout(async () => {
        // Simulate email delivery
        const { error: updateError } = await supabase
          .from('email_recipients')
          .update({ 
            status: 'delivered',
            sent_at: new Date().toISOString(),
            delivered_at: new Date().toISOString()
          })
          .eq('campaign_id', id);
        
        if (!updateError) {
          // Update campaign analytics
          await supabase.rpc('update_campaign_analytics', { campaign_id: id });
          
          // Update campaign status to sent
          await emailApi.campaigns.update(id, { status: 'sent' });
        }
      }, 2000);
      
      return { success: true, message: 'Email campaign started successfully' };
    },

    getRecipients: async (campaignId: string) => {
      const { data, error } = await supabase
        .from('email_recipients')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmailRecipient[];
    },

    getAnalytics: async (campaignId: string) => {
      const { data, error } = await supabase
        .from('email_analytics')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmailAnalytics[];
    }
  },

  // Email Templates
  templates: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as EmailTemplate[];
    },

    getByCategory: async (category: string) => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as EmailTemplate[];
    },

    create: async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          ...template,
          created_by: user?.id,
          usage_count: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as EmailTemplate;
    },

    update: async (id: string, updates: Partial<EmailTemplate>) => {
      const { data, error } = await supabase
        .from('email_templates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as EmailTemplate;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('email_templates')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },

    incrementUsage: async (id: string) => {
      // First get current usage count, then increment
      const { data: template, error: fetchError } = await supabase
        .from('email_templates')
        .select('usage_count')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const { error } = await supabase
        .from('email_templates')
        .update({ 
          usage_count: (template.usage_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  // Email Lists
  lists: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('email_lists')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmailList[];
    },

    create: async (list: Omit<EmailList, 'id' | 'created_at' | 'updated_at' | 'subscriber_count'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('email_lists')
        .insert({
          ...list,
          created_by: user?.id,
          subscriber_count: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as EmailList;
    },

    update: async (id: string, updates: Partial<EmailList>) => {
      const { data, error } = await supabase
        .from('email_lists')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as EmailList;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('email_lists')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },

    getSubscribers: async (listId: string) => {
      const { data, error } = await supabase
        .from('email_list_subscribers')
        .select('*')
        .eq('list_id', listId)
        .eq('is_active', true)
        .order('subscribed_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    addSubscriber: async (listId: string, email: string, name?: string, metadata?: Record<string, any>) => {
      const { data, error } = await supabase
        .from('email_list_subscribers')
        .insert({
          list_id: listId,
          email,
          name,
          metadata: metadata || {}
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update subscriber count
      const { data: list, error: listError } = await supabase
        .from('email_lists')
        .select('subscriber_count')
        .eq('id', listId)
        .single();
      
      if (listError) throw listError;
      
      await supabase
        .from('email_lists')
        .update({ 
          subscriber_count: (list.subscriber_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', listId);
      
      return data;
    }
  },

  // Newsletter Subscriptions
  newsletter: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .eq('is_active', true)
        .order('subscribed_at', { ascending: false });
      
      if (error) throw error;
      return data as NewsletterSubscription[];
    },

    subscribe: async (email: string, name?: string, preferences?: Record<string, boolean>) => {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .insert({
          email,
          name,
          preferences: preferences || {
            marketing: true,
            product_updates: true,
            newsletters: true
          },
          source: 'website',
          verified_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as NewsletterSubscription;
    },

    unsubscribe: async (email: string) => {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .update({
          is_active: false,
          unsubscribed_at: new Date().toISOString()
        })
        .eq('email', email)
        .select()
        .single();
      
      if (error) throw error;
      return data as NewsletterSubscription;
    },

    updatePreferences: async (email: string, preferences: Record<string, boolean>) => {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .update({ preferences })
        .eq('email', email)
        .select()
        .single();
      
      if (error) throw error;
      return data as NewsletterSubscription;
    }
  },

  // Transactional Emails
  transactional: {
    sendJobApplicationConfirmation: async (params: {
      recipientEmail: string;
      recipientName: string;
      jobTitle: string;
      jobId: string;
      applicationId: string;
    }) => {
      try {
        // Get the job application confirmation template
        const { data: template, error: templateError } = await supabase
          .from('email_templates')
          .select('*')
          .eq('category', 'transactional')
          .eq('name', 'Job Application Confirmation')
          .eq('is_active', true)
          .single();

        if (templateError) {
          console.error('Error fetching email template:', templateError);
          throw new Error('Email template not found');
        }

        // Replace variables in the template
        let emailContent = template.content;
        let emailSubject = template.subject;

        const variables = {
          '{{RECIPIENT_NAME}}': params.recipientName,
          '{{JOB_TITLE}}': params.jobTitle,
          '{{APPLICATION_ID}}': params.applicationId,
          '{{COMPANY_NAME}}': 'Trinexa',
          '{{SUPPORT_EMAIL}}': 'hr@trinexa.com',
          '{{DATE}}': new Date().toLocaleDateString(),
          '{{YEAR}}': new Date().getFullYear().toString()
        };

        // Replace all variables in content and subject
        Object.entries(variables).forEach(([variable, value]) => {
          emailContent = emailContent.replace(new RegExp(variable, 'g'), value);
          emailSubject = emailSubject.replace(new RegExp(variable, 'g'), value);
        });

        // In a real implementation, you would send via email service (SendGrid, AWS SES, etc.)
        // For now, we'll log and create a record
        console.log('Sending job application confirmation email:', {
          to: params.recipientEmail,
          subject: emailSubject,
          content: emailContent
        });

        // Create email record for tracking
        const { data: emailRecord, error: emailError } = await supabase
          .from('email_campaigns')
          .insert({
            name: `Job Application Confirmation - ${params.jobTitle}`,
            subject: emailSubject,
            content: emailContent,
            sender_name: 'Trinexa HR Team',
            sender_email: 'hr@trinexa.com',
            target_audience: 'job_applicants',
            status: 'sent',
            total_recipients: 1,
            delivered_count: 1,
            sent_at: new Date().toISOString(),
            created_by: 'system'
          })
          .select()
          .single();

        if (emailError) throw emailError;

        // Create recipient record
        await supabase
          .from('email_recipients')
          .insert({
            campaign_id: emailRecord.id,
            recipient_email: params.recipientEmail,
            recipient_name: params.recipientName,
            recipient_type: 'job_applicant',
            recipient_id: params.applicationId,
            status: 'delivered',
            sent_at: new Date().toISOString(),
            delivered_at: new Date().toISOString()
          });

        return { success: true, message: 'Job application confirmation email sent successfully' };
      } catch (error) {
        console.error('Error sending job application confirmation email:', error);
        throw error;
      }
    },

    sendGeneralApplicationConfirmation: async (params: {
      recipientEmail: string;
      recipientName: string;
      applicationId: string;
    }) => {
      try {
        // Get the general application confirmation template
        const { data: template, error: templateError } = await supabase
          .from('email_templates')
          .select('*')
          .eq('category', 'transactional')
          .eq('name', 'General Application Confirmation')
          .eq('is_active', true)
          .single();

        if (templateError) {
          console.error('Error fetching email template:', templateError);
          throw new Error('Email template not found');
        }

        // Replace variables in the template
        let emailContent = template.content;
        let emailSubject = template.subject;

        const variables = {
          '{{RECIPIENT_NAME}}': params.recipientName,
          '{{APPLICATION_ID}}': params.applicationId,
          '{{COMPANY_NAME}}': 'Trinexa',
          '{{SUPPORT_EMAIL}}': 'hr@trinexa.com',
          '{{DATE}}': new Date().toLocaleDateString(),
          '{{YEAR}}': new Date().getFullYear().toString()
        };

        // Replace all variables in content and subject
        Object.entries(variables).forEach(([variable, value]) => {
          emailContent = emailContent.replace(new RegExp(variable, 'g'), value);
          emailSubject = emailSubject.replace(new RegExp(variable, 'g'), value);
        });

        // Create email record for tracking
        const { data: emailRecord, error: emailError } = await supabase
          .from('email_campaigns')
          .insert({
            name: `General Application Confirmation`,
            subject: emailSubject,
            content: emailContent,
            sender_name: 'Trinexa HR Team',
            sender_email: 'hr@trinexa.com',
            target_audience: 'job_applicants',
            status: 'sent',
            total_recipients: 1,
            delivered_count: 1,
            sent_at: new Date().toISOString(),
            created_by: 'system'
          })
          .select()
          .single();

        if (emailError) throw emailError;

        // Create recipient record
        await supabase
          .from('email_recipients')
          .insert({
            campaign_id: emailRecord.id,
            recipient_email: params.recipientEmail,
            recipient_name: params.recipientName,
            recipient_type: 'job_applicant',
            recipient_id: params.applicationId,
            status: 'delivered',
            sent_at: new Date().toISOString(),
            delivered_at: new Date().toISOString()
          });

        return { success: true, message: 'General application confirmation email sent successfully' };
      } catch (error) {
        console.error('Error sending general application confirmation email:', error);
        throw error;
      }
    }
  },

  // Analytics and Reporting
  analytics: {
    getCampaignPerformance: async (timeRange: string = '30d') => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));
      
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmailCampaign[];
    },

    getOverallStats: async () => {
      const { data: campaigns, error } = await supabase
        .from('email_campaigns')
        .select('total_recipients, delivered_count, opened_count, clicked_count, bounced_count')
        .eq('status', 'sent');
      
      if (error) throw error;
      
      const stats = campaigns.reduce((acc, campaign) => ({
        total_sent: acc.total_sent + campaign.total_recipients,
        total_delivered: acc.total_delivered + campaign.delivered_count,
        total_opened: acc.total_opened + campaign.opened_count,
        total_clicked: acc.total_clicked + campaign.clicked_count,
        total_bounced: acc.total_bounced + campaign.bounced_count
      }), {
        total_sent: 0,
        total_delivered: 0,
        total_opened: 0,
        total_clicked: 0,
        total_bounced: 0
      });
      
      return {
        ...stats,
        delivery_rate: stats.total_sent > 0 ? (stats.total_delivered / stats.total_sent) * 100 : 0,
        open_rate: stats.total_delivered > 0 ? (stats.total_opened / stats.total_delivered) * 100 : 0,
        click_rate: stats.total_delivered > 0 ? (stats.total_clicked / stats.total_delivered) * 100 : 0,
        bounce_rate: stats.total_sent > 0 ? (stats.total_bounced / stats.total_sent) * 100 : 0
      };
    },

    getTopPerformingCampaigns: async (limit: number = 10) => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('status', 'sent')
        .order('opened_count', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as EmailCampaign[];
    }
  }
};