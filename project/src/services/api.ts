import { supabase } from '../lib/supabase';

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
  created_at?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  image_url: string;
  created_at?: string;
}

export interface Career {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  created_at?: string;
}

export interface DemoBooking {
  id?: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  product_interest: string;
  message?: string;
  preferred_date: string;
  status?: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  created_at?: string;
}

export interface TeamMemberProfile {
  id: string;
  name: string;
  email: string;
  role: 'BA' | 'SE' | 'Manager' | 'Sales' | 'QA' | 'DevOps';
  department: string;
  is_active: boolean;
  expertise: string[];
  availability?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface DemoSessionAssignment {
  id: string;
  demo_booking_id: string;
  team_member_id: string;
  role_in_demo: string;
  assigned_by: string;
  assigned_at: string;
  notes?: string;
  team_member?: TeamMemberProfile;
}

export interface DemoSessionSchedule {
  id: string;
  demo_booking_id: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  google_meet_link?: string;
  google_event_id?: string;
  meeting_room?: string;
  agenda?: string;
  preparation_notes?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AvailableTimeSlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  max_concurrent_demos: number;
  slot_name: string;
  created_at: string;
}

// Note: Demo email templates now use the unified EmailTemplate interface
// with category field set to demo_* values

export interface GeneralApplication {
  id?: string;
  name: string;
  email: string;
  phone: string;
  resume_url: string;
  cover_letter: string;
  portfolio_url?: string;
  linkedin_url?: string;
  status?: 'pending' | 'shortlisted' | 'rejected';
  created_at?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'content_admin' | 'recruitment_admin';
  created_at?: string;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'text' | 'image' | 'json' | 'boolean' | 'number';
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageContent {
  id: string;
  page_id: string;
  section_id: string;
  content: Record<string, any>;
  section_type?: string;
  metadata?: Record<string, any>;
  updated_at: string;
  updated_by: string;
}

export interface PageSection {
  id: string;
  page_id: string;
  section_id: string;
  section_name: string;
  section_type: string;
  default_content: Record<string, any>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface AdminMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  source?: string;
  admin_notes?: string;
  assigned_to?: string;
  replied_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  content: string;
  variables: string[];
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsData {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_type: 'count' | 'percentage' | 'currency' | 'time' | 'custom';
  date_recorded: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ContentVersion {
  id: string;
  page_id: string;
  section_id: string;
  content: Record<string, any>;
  version_number: number;
  change_summary?: string;
  created_by?: string;
  created_at: string;
  is_published: boolean;
}

export interface AdminActivityLog {
  id: string;
  admin_user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface FileUpload {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by?: string;
  upload_type: 'general' | 'resume' | 'logo' | 'favicon' | 'image' | 'document';
  metadata: Record<string, any>;
  created_at: string;
}

export interface SentMessage {
  id: string;
  content: string;
  recipient_type: string;
  recipient_ids: string[];
  sent_at: string;
  sent_by: string;
}

export interface ScheduledMessage {
  id: string;
  subject: string;
  content: string;
  recipient_type: string;
  recipient_ids: string[];
  scheduled_for: string;
  status: 'pending' | 'sent' | 'cancelled';
  created_by: string;
  created_at: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  category: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  subject: string;
  content: string;
  variables: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'inactive' | 'development';
  pricing: Record<string, any>;
  features: string[];
  technical_specs: Record<string, any>;
  documentation_url?: string;
  demo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductAnalytics {
  id: string;
  product_id: string;
  metric_name: string;
  metric_value: number;
  date: string;
  created_at: string;
}

export interface DemoAssignment {
  id: string;
  demo_booking_id: string;
  admin_user_id: string;
  role: string;
  assigned_at: string;
  assigned_by: string;
  admin_user?: AdminUser;
}

export interface Testimonial {
  id: string;
  quote: string;
  author_name: string;
  author_position: string;
  author_company?: string;
  author_image?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  salary_range?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id?: string;
  job_position_id: string;
  name: string;
  email: string;
  phone: string;
  resume_url: string;
  cover_letter: string;
  portfolio_url?: string;
  linkedin_url?: string;
  status?: 'pending' | 'shortlisted' | 'rejected' | 'interviewed';
  created_at?: string;
  job_position?: JobPosition; // For joined queries
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  page_id: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyValue {
  id: string;
  title: string;
  description: string;
  icon?: string;
  page_id: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  icon?: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface StorySection {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  section_type: 'story' | 'history' | 'milestone';
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MissionVision {
  id: string;
  type: 'mission' | 'vision';
  title: string;
  content: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminInvitation {
  id: string;
  email: string;
  role: string;
  invited_by: string;
  invitation_token: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  created_at: string;
  accepted_at?: string;
}

export interface InvitationEmailTemplate {
  id: string;
  name: string;
  category: 'welcome' | 'newsletter' | 'promotional' | 'transactional' | 'notification' | 'general';
  subject: string;
  content: string; // This is the HTML content in the existing schema
  variables: string[];
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ExtendedAdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'content_admin' | 'recruitment_admin';
  name?: string;
  password_hash?: string;
  is_email_verified: boolean;
  email_verified_at?: string;
  last_login_at?: string;
  account_status: 'pending' | 'active' | 'suspended' | 'deactivated';
  created_at: string;
  updated_at: string;
}

export interface LeadershipMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  image_url: string;
  linkedin_url?: string;
  twitter_url?: string;
  email?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const api = {
  services: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Service[];
    },
    
    create: async (service: Omit<Service, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('services')
        .insert(service)
        .select()
        .single();
      
      if (error) throw error;
      return data as Service;
    },
    
    update: async (id: string, service: Partial<Service>) => {
      const { data, error } = await supabase
        .from('services')
        .update(service)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Service;
    },
    
    delete: async (id: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },
  
  team: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as TeamMember[];
    },
    
    create: async (member: Omit<TeamMember, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('team_members')
        .insert(member)
        .select()
        .single();
      
      if (error) throw error;
      return data as TeamMember;
    },
    
    update: async (id: string, member: Partial<TeamMember>) => {
      const { data, error } = await supabase
        .from('team_members')
        .update(member)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as TeamMember;
    },
    
    delete: async (id: string) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },
  
  careers: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Career[];
    },
    
    create: async (career: Omit<Career, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('careers')
        .insert(career)
        .select()
        .single();
      
      if (error) throw error;
      return data as Career;
    },
    
    update: async (id: string, career: Partial<Career>) => {
      const { data, error } = await supabase
        .from('careers')
        .update(career)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Career;
    },
    
    delete: async (id: string) => {
      const { error } = await supabase
        .from('careers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  demoBookings: {
    create: async (booking: Omit<DemoBooking, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('demo_bookings')
        .insert(booking)
        .select()
        .single();
      
      if (error) throw error;
      return data as DemoBooking;
    },

    getAll: async () => {
      const { data, error } = await supabase
        .from('demo_bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DemoBooking[];
    },

    search: async (filters: { startDate?: string; endDate?: string; product?: string; status?: string }) => {
      let query = supabase
        .from('demo_bookings')
        .select('*');

      if (filters.startDate) {
        query = query.gte('preferred_date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('preferred_date', filters.endDate);
      }

      if (filters.product) {
        query = query.eq('product_interest', filters.product);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DemoBooking[];
    },

    updateStatus: async (id: string, status: string) => {
      const { data, error } = await supabase
        .from('demo_bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as DemoBooking;
    },

    scheduleMeeting: async (params: { bookingId: string; date: string; time: string }) => {
      // Update booking status to scheduled
      await api.demoBookings.updateStatus(params.bookingId, 'scheduled');
      
      // Here you would integrate with calendar API (Google Calendar, Outlook, etc.)
      // For now, we'll just simulate the scheduling
      console.log('Meeting scheduled:', params);
      
      return { success: true };
    }
  },

  generalApplications: {
    create: async (application: Omit<GeneralApplication, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('general_applications')
        .insert(application)
        .select()
        .single();
      
      if (error) throw error;
      return data as GeneralApplication;
    },

    getAll: async () => {
      const { data, error } = await supabase
        .from('general_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as GeneralApplication[];
    },

    search: async (filters: { startDate?: string; endDate?: string; status?: string }) => {
      let query = supabase
        .from('general_applications')
        .select('*');

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as GeneralApplication[];
    },

    updateStatus: async (id: string, status: 'shortlisted' | 'rejected') => {
      const { data, error } = await supabase
        .from('general_applications')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as GeneralApplication;
    },

    scheduleInterview: async (params: { applicationId: string; date: string; time: string }) => {
      // Here you would integrate with calendar API and send email
      console.log('Interview scheduled:', params);
      return { success: true };
    }
  },

  demoAssignments: {
    getByDemoId: async (demoId: string) => {
      const { data, error } = await supabase
        .from('demo_assignments')
        .select(`
          *,
          admin_user:admin_users(*)
        `)
        .eq('demo_booking_id', demoId);
      
      if (error) throw error;
      return data as DemoAssignment[];
    },

    create: async (assignment: { demo_booking_id: string; admin_user_id: string; role: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('demo_assignments')
        .insert({
          ...assignment,
          assigned_by: user?.id
        })
        .select(`
          *,
          admin_user:admin_users(*)
        `)
        .single();
      
      if (error) throw error;
      return data as DemoAssignment;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('demo_assignments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  messageTemplates: {
    getAll: async () => {
      console.log('Fetching all templates...');
      
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('category', { ascending: true });
      
      console.log('Templates query result:', { data, error, count: data?.length });
      
      if (error) {
        console.error('Error fetching templates:', error);
        throw error;
      }
      
      return data as MessageTemplate[];
    },

    getByCategory: async (category: string) => {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('category', category)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as MessageTemplate[];
    },

    create: async (template: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating template:', template);
      
      try {
        // Get current session and user info
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Current session:', session ? 'EXISTS' : 'NONE', 'Session error:', sessionError);
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error('Authentication error. Please log in again.');
        }
        
        if (!session) {
          console.error('No active session');
          throw new Error('Please log in to create templates.');
        }
        
        console.log('Session user:', session.user.id, session.user.email);
        
        // Find the corresponding admin user
        let adminUserId = session.user.id;
        
        // First try to find admin user by auth ID (should work after ID fix)
        const { data: adminByIdData, error: adminByIdError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (adminByIdError && adminByIdError.code !== 'PGRST116') {
          console.error('Error finding admin by ID:', adminByIdError);
        }
        
        if (adminByIdData) {
          console.log('Found admin user by ID:', adminByIdData.email, adminByIdData.role);
          adminUserId = adminByIdData.id;
        } else {
          // Fallback: find by email
          console.log('Admin user not found by ID, trying email lookup...');
          const { data: adminByEmailData, error: adminByEmailError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', session.user.email)
            .single();
          
          if (adminByEmailError) {
            console.error('Error finding admin by email:', adminByEmailError);
            throw new Error('Admin user not found. Please ensure you have admin privileges.');
          }
          
          console.log('Found admin user by email:', adminByEmailData.email, adminByEmailData.role);
          adminUserId = adminByEmailData.id;
        }
        
        // Prepare template data with correct created_by ID
        const templateData = {
          ...template,
          created_by: adminUserId
        };
        
        console.log('Final template data to insert:', templateData);
        
        const { data, error } = await supabase
          .from('message_templates')
          .insert(templateData)
          .select()
          .single();
        
        console.log('Insert result:', { data, error });
        
        if (error) {
          console.error('Database error:', error);
          
          // Provide specific error messages based on error codes
          if (error.code === '42501') {
            throw new Error('Permission denied. Please ensure you are logged in as an admin user with the correct permissions.');
          } else if (error.code === '23503') {
            throw new Error('Invalid user reference. Please contact system administrator.');
          } else {
            throw new Error(`Database error (${error.code}): ${error.message}`);
          }
        }
        
        console.log('Template created successfully:', data);
        return data as MessageTemplate;
        
      } catch (error) {
        console.error('Template creation error:', error);
        throw error;
      }
    },

    update: async (id: string, template: Partial<MessageTemplate>) => {
      const { data, error } = await supabase
        .from('message_templates')
        .update({
          ...template,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as MessageTemplate;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  products: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Product[];
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Product;
    },

    create: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      
      if (error) throw error;
      return data as Product;
    },

    update: async (id: string, product: Partial<Product>) => {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...product,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Product;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },

    getAnalytics: async (productId: string) => {
      const { data, error } = await supabase
        .from('product_analytics')
        .select('*')
        .eq('product_id', productId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as ProductAnalytics[];
    },

    addAnalytics: async (analytics: Omit<ProductAnalytics, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('product_analytics')
        .insert(analytics)
        .select()
        .single();
      
      if (error) throw error;
      return data as ProductAnalytics;
    }
  },

  // New CMS APIs
  testimonials: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Testimonial[];
    },

    getAllForAdmin: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Testimonial[];
    },

    create: async (testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('testimonials')
        .insert(testimonial)
        .select()
        .single();
      
      if (error) throw error;
      return data as Testimonial;
    },

    update: async (id: string, testimonial: Partial<Testimonial>) => {
      const { data, error } = await supabase
        .from('testimonials')
        .update({
          ...testimonial,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Testimonial;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  jobPositions: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('job_positions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as JobPosition[];
    },

    getAllForAdmin: async () => {
      const { data, error } = await supabase
        .from('job_positions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as JobPosition[];
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('job_positions')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as JobPosition;
    },

    create: async (position: Omit<JobPosition, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('job_positions')
        .insert(position)
        .select()
        .single();
      
      if (error) throw error;
      return data as JobPosition;
    },

    update: async (id: string, position: Partial<JobPosition>) => {
      const { data, error } = await supabase
        .from('job_positions')
        .update({
          ...position,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as JobPosition;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('job_positions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  faqs: {
    getAll: async (pageId?: string) => {
      let query = supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true);

      if (pageId) {
        query = query.eq('page_id', pageId);
      }

      const { data, error } = await query.order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as FAQ[];
    },

    getAllForAdmin: async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('page_id', { ascending: true })
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as FAQ[];
    },

    create: async (faq: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('faqs')
        .insert(faq)
        .select()
        .single();
      
      if (error) throw error;
      return data as FAQ;
    },

    update: async (id: string, faq: Partial<FAQ>) => {
      const { data, error } = await supabase
        .from('faqs')
        .update({
          ...faq,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as FAQ;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  companyValues: {
    getAll: async (pageId?: string) => {
      let query = supabase
        .from('company_values')
        .select('*')
        .eq('is_active', true);

      if (pageId) {
        query = query.eq('page_id', pageId);
      }

      const { data, error } = await query.order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as CompanyValue[];
    },

    getAllForAdmin: async () => {
      const { data, error } = await supabase
        .from('company_values')
        .select('*')
        .order('page_id', { ascending: true })
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as CompanyValue[];
    },

    create: async (value: Omit<CompanyValue, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('company_values')
        .insert(value)
        .select()
        .single();
      
      if (error) throw error;
      return data as CompanyValue;
    },

    update: async (id: string, value: Partial<CompanyValue>) => {
      const { data, error } = await supabase
        .from('company_values')
        .update({
          ...value,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as CompanyValue;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('company_values')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  benefits: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('benefits')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Benefit[];
    },

    getAllForAdmin: async () => {
      const { data, error } = await supabase
        .from('benefits')
        .select('*')
        .order('category', { ascending: true })
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Benefit[];
    },

    create: async (benefit: Omit<Benefit, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('benefits')
        .insert(benefit)
        .select()
        .single();
      
      if (error) throw error;
      return data as Benefit;
    },

    update: async (id: string, benefit: Partial<Benefit>) => {
      const { data, error } = await supabase
        .from('benefits')
        .update({
          ...benefit,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Benefit;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('benefits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  storySections: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('story_sections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as StorySection[];
    },

    getAllForAdmin: async () => {
      const { data, error } = await supabase
        .from('story_sections')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as StorySection[];
    },

    create: async (section: Omit<StorySection, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('story_sections')
        .insert(section)
        .select()
        .single();
      
      if (error) throw error;
      return data as StorySection;
    },

    update: async (id: string, section: Partial<StorySection>) => {
      const { data, error } = await supabase
        .from('story_sections')
        .update({
          ...section,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as StorySection;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('story_sections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  missionVision: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('mission_vision')
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: true });
      
      if (error) throw error;
      return data as MissionVision[];
    },

    getAllForAdmin: async () => {
      const { data, error } = await supabase
        .from('mission_vision')
        .select('*')
        .order('type', { ascending: true });
      
      if (error) throw error;
      return data as MissionVision[];
    },

    create: async (item: Omit<MissionVision, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('mission_vision')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data as MissionVision;
    },

    update: async (id: string, item: Partial<MissionVision>) => {
      const { data, error } = await supabase
        .from('mission_vision')
        .update({
          ...item,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as MissionVision;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('mission_vision')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  leadershipMembers: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('leadership_members')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as LeadershipMember[];
    },

    getAllForAdmin: async () => {
      const { data, error } = await supabase
        .from('leadership_members')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as LeadershipMember[];
    },

    create: async (member: Omit<LeadershipMember, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('leadership_members')
        .insert(member)
        .select()
        .single();
      
      if (error) throw error;
      return data as LeadershipMember;
    },

    update: async (id: string, member: Partial<LeadershipMember>) => {
      const { data, error } = await supabase
        .from('leadership_members')
        .update({
          ...member,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as LeadershipMember;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('leadership_members')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  admin: {
    login: async (email: string, password: string) => {
      // First validate inputs
      if (!email || !email.trim()) {
        throw new Error('Email is required');
      }
      
      if (!password || !password.trim()) {
        throw new Error('Password is required');
      }

      console.log('Admin login attempt for:', email.trim());

      try {
        // Clear any existing session first to prevent token conflicts
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
          console.warn('Sign out error (continuing):', signOutError);
        }

        // Wait a moment for session clearing
        await new Promise(resolve => setTimeout(resolve, 100));

        // Attempt authentication with enhanced error handling
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        });

        if (authError) {
          console.error('Supabase Auth error details:', {
            message: authError.message,
            status: authError.status,
            name: authError.name
          });
          
          // Enhanced error mapping for different scenarios
          if (authError.message?.includes('Invalid login credentials') || authError.status === 400) {
            throw new Error('Invalid email or password. If you just created this account, please try again in a moment.');
          } else if (authError.message?.includes('Email not confirmed')) {
            throw new Error('Please confirm your email address before logging in.');
          } else if (authError.message?.includes('Too many requests') || authError.status === 429) {
            throw new Error('Too many login attempts. Please wait a moment and try again.');
          } else if (authError.message?.includes('Network error') || authError.message?.includes('Failed to fetch')) {
            throw new Error('Network connection error. Please check your internet connection and try again.');
          } else if (authError.status === 422) {
            throw new Error('Invalid request format. Please refresh the page and try again.');
          } else {
            throw new Error(`Authentication failed (${authError.status}): ${authError.message}. Please try again or contact support.`);
          }
        }
        
        const { user, session } = authData;
        
        if (!user || !session) {
          throw new Error('Login failed - no user session created. Please try again.');
        }

        console.log('Supabase auth successful, user ID:', user.id, 'email:', user.email);
        console.log('Session token present:', !!session.access_token);

        // Enhanced admin verification with multiple fallback methods
        let adminUser = null;
        
        // Method 1: Find by auth user ID
        try {
          const { data: adminByIdData, error: adminByIdError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', user.id)
            .eq('account_status', 'active')
            .single();
          
          if (adminByIdData && !adminByIdError) {
            adminUser = adminByIdData;
            console.log('Admin user found by ID:', adminUser.email);
          }
        } catch (error) {
          console.log('Admin lookup by ID failed, trying email method...');
        }

        // Method 2: Find by email if ID lookup failed
        if (!adminUser) {
          try {
            const { data: adminByEmailData, error: adminByEmailError } = await supabase
              .from('admin_users')
              .select('*')
              .eq('email', email.trim())
              .eq('account_status', 'active')
              .single();
            
            if (adminByEmailData && !adminByEmailError) {
              adminUser = adminByEmailData;
              console.log('Admin user found by email:', adminUser.email);
              
              // Update the admin_users record with the correct auth user ID
              try {
                await supabase
                  .from('admin_users')
                  .update({ id: user.id, updated_at: new Date().toISOString() })
                  .eq('email', email.trim());
                console.log('Admin user ID synchronized with auth user ID');
              } catch (updateError) {
                console.warn('Failed to sync admin user ID:', updateError);
              }
            }
          } catch (error) {
            console.error('Admin lookup by email failed:', error);
          }
        }

        if (!adminUser) {
          console.error('Admin user not found. Email:', email.trim(), 'User ID:', user.id);
          await supabase.auth.signOut();
          throw new Error('Admin account not found. Please ensure you have admin privileges or contact the system administrator.');
        }

        // Verify session is properly established
        const { data: { session: verifySession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !verifySession) {
          console.error('Session verification failed:', sessionError);
          throw new Error('Login session could not be established. Please try again.');
        }

        console.log('✅ Admin login successful for:', adminUser.email, 'Role:', adminUser.role);
        console.log('Session established with token:', !!verifySession.access_token);
        
        return adminUser as AdminUser;
        
      } catch (error) {
        console.error('Login process error:', error);
        // Ensure clean state on any error
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.warn('Error during cleanup sign out:', signOutError);
        }
        throw error;
      }
    },

    logout: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    getCurrentUser: async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) return null;

      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (adminError) {
        // If user not found in admin_users, try by email
        const { data: adminUserByEmail, error: emailError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', session.user.email)
          .single();
        
        if (emailError) throw emailError;
        return adminUserByEmail as AdminUser;
      }
      
      return adminUser as AdminUser;
    },

    getAll: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AdminUser[];
    },

    create: async (adminUser: { email: string; role: string }) => {
      // For now, just create the admin user record without auth user
      // In production, you would handle auth user creation on the server side
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          email: adminUser.email,
          role: adminUser.role
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as AdminUser;
    },

    update: async (id: string, updates: { email?: string; role?: string }) => {
      const { data, error } = await supabase
        .from('admin_users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as AdminUser;
    },

    delete: async (id: string) => {
      // Delete from admin_users table
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      // Note: In production, you would also delete the auth user via server-side API
    },

    pageContent: {
      get: async (pageId: string) => {
        const { data, error } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_id', pageId)
          .order('section_id');
        
        if (error) throw error;
        return data as PageContent[];
      },

      getBySection: async (pageId: string, sectionId: string) => {
        const { data, error } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_id', pageId)
          .eq('section_id', sectionId)
          .single();
        
        if (error) throw error;
        return data as PageContent;
      },

      update: async (pageId: string, sectionId: string, content: Record<string, any>, metadata?: Record<string, any>) => {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
          .from('page_content')
          .upsert({
            page_id: pageId,
            section_id: sectionId,
            content,
            metadata: metadata || {},
            updated_at: new Date().toISOString(),
            updated_by: user?.id || '00000000-0000-0000-0000-000000000001' // Fallback to system user
          }, {
            onConflict: 'page_id,section_id'
          })
          .select()
          .single();
        
        if (error) throw error;
        return data as PageContent;
      }
    },

    pageSections: {
      getAll: async () => {
        const { data, error } = await supabase
          .from('page_sections')
          .select('*')
          .eq('is_active', true)
          .order('page_id')
          .order('sort_order');
        
        if (error) throw error;
        return data as PageSection[];
      },

      getByPage: async (pageId: string) => {
        const { data, error } = await supabase
          .from('page_sections')
          .select('*')
          .eq('page_id', pageId)
          .eq('is_active', true)
          .order('sort_order');
        
        if (error) throw error;
        return data as PageSection[];
      },

      create: async (section: Omit<PageSection, 'id' | 'created_at'>) => {
        const { data, error } = await supabase
          .from('page_sections')
          .insert(section)
          .select()
          .single();
        
        if (error) throw error;
        return data as PageSection;
      },

      update: async (id: string, section: Partial<PageSection>) => {
        const { data, error } = await supabase
          .from('page_sections')
          .update(section)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data as PageSection;
      },

      delete: async (id: string) => {
        const { error } = await supabase
          .from('page_sections')
          .update({ is_active: false })
          .eq('id', id);
        
        if (error) throw error;
      }
    },

    messages: {
      send: async (message: Omit<AdminMessage, 'id' | 'sent_at' | 'sent_by'>) => {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
          .from('admin_messages')
          .insert({
            ...message,
            sent_by: user?.id
          })
          .select()
          .single();
        
        if (error) throw error;
        return data as AdminMessage;
      },

      schedule: async (message: Omit<ScheduledMessage, 'id' | 'created_at' | 'created_by' | 'status'>) => {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
          .from('scheduled_messages')
          .insert({
            ...message,
            created_by: user?.id,
            status: 'pending'
          })
          .select()
          .single();
        
        if (error) throw error;
        return data as ScheduledMessage;
      },

      getScheduled: async () => {
        const { data, error } = await supabase
          .from('scheduled_messages')
          .select('*')
          .order('scheduled_for', { ascending: true });
        
        if (error) throw error;
        return data as ScheduledMessage[];
      },

      cancelScheduled: async (id: string) => {
        const { data, error } = await supabase
          .from('scheduled_messages')
          .update({ status: 'cancelled' })
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data as ScheduledMessage;
      },

      getAll: async () => {
        const { data, error } = await supabase
          .from('admin_messages')
          .select('*')
          .order('sent_at', { ascending: false });
        
        if (error) throw error;
        return data as AdminMessage[];
      }
    }
  },

  // Public API for fetching page content
  public: {
    getPageContent: async (pageId: string, sectionId?: string) => {
      let query = supabase
        .from('page_content')
        .select('*')
        .eq('page_id', pageId);

      if (sectionId) {
        query = query.eq('section_id', sectionId);
        const { data, error } = await query.single();
        if (error) throw error;
        return data as PageContent;
      } else {
        const { data, error } = await query.order('section_id');
        if (error) throw error;
        return data as PageContent[];
      }
    }
  },

  jobApplications: {
    create: async (application: Omit<JobApplication, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('job_applications')
        .insert(application)
        .select()
        .single();
      
      if (error) throw error;
      return data as JobApplication;
    },

    getAll: async () => {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job_position:job_positions(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (JobApplication & { job_position: JobPosition })[];
    },

    getByPosition: async (positionId: string) => {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job_position:job_positions(*)
        `)
        .eq('job_position_id', positionId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (JobApplication & { job_position: JobPosition })[];
    },

    search: async (filters: { 
      startDate?: string; 
      endDate?: string; 
      status?: string; 
      positionId?: string;
    }) => {
      let query = supabase
        .from('job_applications')
        .select(`
          *,
          job_position:job_positions(*)
        `);

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.positionId) {
        query = query.eq('job_position_id', filters.positionId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (JobApplication & { job_position: JobPosition })[];
    },

    updateStatus: async (id: string, status: 'pending' | 'shortlisted' | 'rejected' | 'interviewed') => {
      const { data, error } = await supabase
        .from('job_applications')
        .update({ status })
        .eq('id', id)
        .select(`
          *,
          job_position:job_positions(*)
        `)
        .single();
      
      if (error) throw error;
      return data as JobApplication & { job_position: JobPosition };
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },

    scheduleInterview: async (params: { applicationId: string; date: string; time: string }) => {
      // Here you would integrate with calendar API and send email
      console.log('Interview scheduled:', params);
      return { success: true };
    }
  },

  systemSettings: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('is_active', true)
        .order('setting_key');
      
      if (error) throw error;
      return data;
    },

    getByKey: async (key: string) => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('setting_key', key)
        .eq('is_active', true)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    update: async (key: string, value: string) => {
      const { data, error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    updateMultiple: async (settings: Record<string, string>) => {
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('system_settings')
        .upsert(updates, {
          onConflict: 'setting_key'
        })
        .select();
      
      if (error) throw error;
      return data;
    },

    // Messages API for message management
    messages: {
      getAll: async () => {
        return api.adminMessages.getAll();
      },

      getScheduled: async () => {
        // For now, return empty array as scheduled messages functionality 
        // can be implemented when needed
        return [] as any[];
      },

      send: async (messageData: {
        subject: string;
        content: string;
        recipient_type: string;
        recipient_ids: string[];
      }): Promise<any> => {
        // This would implement actual email sending logic
        // For now, we'll create a record in admin_messages as a log
        try {
          return await api.adminMessages.create({
            name: 'System Message',
            email: 'system@trinexa.com',
            subject: messageData.subject,
            message: messageData.content,
            status: 'replied',
            priority: 'normal',
            source: messageData.recipient_type,
            admin_notes: `Bulk message sent to ${messageData.recipient_type}`
          });
        } catch (error) {
          console.error('Error sending message:', error);
          throw error;
        }
      },

      schedule: async (messageData: {
        subject: string;
        content: string;
        recipient_type: string;
        recipient_ids: string[];
        scheduled_for: string;
      }): Promise<ScheduledMessage> => {
        // Return a mock scheduled message for now
        return {
          id: 'scheduled-' + Date.now(),
          subject: messageData.subject,
          content: messageData.content,
          recipient_type: messageData.recipient_type,
          recipient_ids: messageData.recipient_ids,
          scheduled_for: messageData.scheduled_for,
          status: 'pending' as const,
          created_by: 'system',
          created_at: new Date().toISOString()
        };
      },

      cancelScheduled: async (_id: string) => {
        // Return success for now
        return { success: true };
      }
    }
  },

  // Admin Messages/Contact Management
  adminMessages: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('admin_messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AdminMessage[];
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('admin_messages')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as AdminMessage;
    },

    create: async (message: Omit<AdminMessage, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('admin_messages')
        .insert(message)
        .select()
        .single();
      
      if (error) throw error;
      return data as AdminMessage;
    },

    update: async (id: string, updates: Partial<AdminMessage>) => {
      const { data, error } = await supabase
        .from('admin_messages')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as AdminMessage;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('admin_messages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },

    markAsRead: async (id: string) => {
      const { data, error } = await supabase
        .from('admin_messages')
        .update({ status: 'read', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as AdminMessage;
    }
  },

  // Email Templates Management
  emailTemplates: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as EmailTemplate[];
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as EmailTemplate;
    },

    create: async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('email_templates')
        .insert(template)
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
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  // Analytics/Business Intelligence
  analytics: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('analytics_data')
        .select('*')
        .order('date_recorded', { ascending: false });
      
      if (error) throw error;
      return data as AnalyticsData[];
    },

    getByMetric: async (metricName: string) => {
      const { data, error } = await supabase
        .from('analytics_data')
        .select('*')
        .eq('metric_name', metricName)
        .order('date_recorded', { ascending: false });
      
      if (error) throw error;
      return data as AnalyticsData[];
    },

    create: async (analytics: Omit<AnalyticsData, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('analytics_data')
        .insert(analytics)
        .select()
        .single();
      
      if (error) throw error;
      return data as AnalyticsData;
    },

    getDashboardMetrics: async () => {
      const { data, error } = await supabase
        .from('analytics_data')
        .select('*')
        .eq('date_recorded', new Date().toISOString().split('T')[0])
        .order('metric_name');
      
      if (error) throw error;
      return data as AnalyticsData[];
    }
  },

  // Content Versions Management
  contentVersions: {
    getAll: async (pageId?: string) => {
      let query = supabase
        .from('content_versions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (pageId) {
        query = query.eq('page_id', pageId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ContentVersion[];
    },

    create: async (version: Omit<ContentVersion, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('content_versions')
        .insert(version)
        .select()
        .single();
      
      if (error) throw error;
      return data as ContentVersion;
    },

    publish: async (id: string) => {
      const { data, error } = await supabase
        .from('content_versions')
        .update({ is_published: true })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as ContentVersion;
    }
  },

  // Activity Log
  activityLog: {
    getAll: async (adminUserId?: string) => {
      let query = supabase
        .from('admin_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (adminUserId) {
        query = query.eq('admin_user_id', adminUserId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as AdminActivityLog[];
    },

    create: async (log: Omit<AdminActivityLog, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('admin_activity_log')
        .insert(log)
        .select()
        .single();
      
      if (error) throw error;
      return data as AdminActivityLog;
    }
  },

  // File Uploads Management
  fileUploads: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('file_uploads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FileUpload[];
    },

    getByType: async (uploadType: string) => {
      const { data, error } = await supabase
        .from('file_uploads')
        .select('*')
        .eq('upload_type', uploadType)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FileUpload[];
    },

    create: async (upload: Omit<FileUpload, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('file_uploads')
        .insert(upload)
        .select()
        .single();
      
      if (error) throw error;
      return data as FileUpload;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('file_uploads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  // Team Members Management
  teamMembers: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as TeamMemberProfile[];
    },

    getByRole: async (role: string) => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('role', role)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as TeamMemberProfile[];
    },

    create: async (teamMember: Omit<TeamMemberProfile, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('team_members')
        .insert(teamMember)
        .select()
        .single();
      
      if (error) throw error;
      return data as TeamMemberProfile;
    },

    update: async (id: string, updates: Partial<TeamMemberProfile>) => {
      const { data, error } = await supabase
        .from('team_members')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as TeamMemberProfile;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  // Demo Session Team Assignments
  demoTeamAssignments: {
    getByDemoId: async (demoBookingId: string) => {
      const { data, error } = await supabase
        .from('demo_session_assignments')
        .select(`
          *,
          team_member:team_members(*)
        `)
        .eq('demo_booking_id', demoBookingId);
      
      if (error) throw error;
      return data as DemoSessionAssignment[];
    },

    assign: async (assignment: Omit<DemoSessionAssignment, 'id' | 'assigned_at'>) => {
      const { data, error } = await supabase
        .from('demo_session_assignments')
        .insert({
          ...assignment,
          assigned_at: new Date().toISOString()
        })
        .select(`
          *,
          team_member:team_members(*)
        `)
        .single();
      
      if (error) throw error;
      return data as DemoSessionAssignment;
    },

    remove: async (id: string) => {
      const { error } = await supabase
        .from('demo_session_assignments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },

    updateRole: async (id: string, roleInDemo: string, notes?: string) => {
      const { data, error } = await supabase
        .from('demo_session_assignments')
        .update({ role_in_demo: roleInDemo, notes })
        .eq('id', id)
        .select(`
          *,
          team_member:team_members(*)
        `)
        .single();
      
      if (error) throw error;
      return data as DemoSessionAssignment;
    }
  },

  // Demo Session Scheduling
  demoScheduling: {
    getSchedule: async (demoBookingId: string) => {
      const { data, error } = await supabase
        .from('demo_session_schedules')
        .select('*')
        .eq('demo_booking_id', demoBookingId)
        .maybeSingle();
      
      if (error) {
        console.error('getSchedule error:', error);
        throw error;
      }
      console.log('getSchedule result:', data);
      return data as DemoSessionSchedule | null;
    },

    getAvailableSlots: async (date: string) => {
      const dayOfWeek = new Date(date).getDay();
      
      const { data, error } = await supabase
        .from('available_time_slots')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .order('start_time');
      
      if (error) throw error;
      
      // Check for existing bookings on this date
      const { data: existingBookings } = await supabase
        .from('demo_session_schedules')
        .select('start_time, end_time')
        .eq('scheduled_date', date)
        .eq('status', 'scheduled');
      
      // Filter out booked slots
      const availableSlots = data.filter(slot => {
        return !existingBookings?.some(booking => 
          booking.start_time === slot.start_time && booking.end_time === slot.end_time
        );
      });
      
      return availableSlots as AvailableTimeSlot[];
    },

    schedule: async (schedule: Omit<DemoSessionSchedule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('demo_session_schedules')
        .insert({
          ...schedule,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;

      // Update demo booking status to scheduled
      await api.demoBookings.updateStatus(schedule.demo_booking_id, 'scheduled');
      
      return data as DemoSessionSchedule;
    },

    reschedule: async (id: string, newDate: string, newStartTime: string, newEndTime: string) => {
      const { data, error } = await supabase
        .from('demo_session_schedules')
        .update({
          scheduled_date: newDate,
          start_time: newStartTime,
          end_time: newEndTime,
          status: 'rescheduled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as DemoSessionSchedule;
    },

    cancel: async (id: string) => {
      const { data, error } = await supabase
        .from('demo_session_schedules')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as DemoSessionSchedule;
    },

    updateGoogleMeet: async (id: string, googleMeetLink: string, googleEventId?: string) => {
      const { data, error } = await supabase
        .from('demo_session_schedules')
        .update({
          google_meet_link: googleMeetLink,
          google_event_id: googleEventId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as DemoSessionSchedule;
    }
  },

  // Email Templates for Demo Sessions (now unified with email_templates)
  demoEmailTemplates: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .like('category', 'demo_%')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as EmailTemplate[];
    },

    getByType: async (templateType: string) => {
      // Map old template types to new categories
      const categoryMap: { [key: string]: string } = {
        'assignment_notification': 'demo_assignment',
        'schedule_confirmation': 'demo_confirmation',
        'reminder': 'demo_reminder',
        'cancellation': 'demo_cancellation'
      };
      
      const category = categoryMap[templateType] || `demo_${templateType}`;
      
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as EmailTemplate;
    }
  },

  // Admin Invitation System
  adminInvitations: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('admin_invitations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AdminInvitation[];
    },

    create: async (invitation: { email: string; role: string }) => {
      // Generate invitation token
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_invitation_token');
      
      if (tokenError) throw tokenError;
      
      // Set expiry to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      const { data, error } = await supabase
        .from('admin_invitations')
        .insert({
          email: invitation.email,
          role: invitation.role,
          invitation_token: tokenData,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as AdminInvitation;
    },

    getByToken: async (token: string) => {
      const { data, error } = await supabase
        .from('admin_invitations')
        .select('*')
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .single();
      
      if (error) throw error;
      return data as AdminInvitation;
    },

    acceptInvitation: async (token: string, password: string, name?: string) => {
      // First get the invitation
      const invitation = await api.adminInvitations.getByToken(token);
      
      // Check if invitation is still valid
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('Invitation has expired');
      }
      
      // Hash the password
      const { data: hashedPassword, error: hashError } = await supabase
        .rpc('hash_password', { plain_password: password });
      
      if (hashError) throw hashError;
      
      // Create or update admin user
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .upsert({
          email: invitation.email,
          role: invitation.role,
          name: name,
          password_hash: hashedPassword,
          is_email_verified: true,
          email_verified_at: new Date().toISOString(),
          account_status: 'active'
        })
        .select()
        .single();
      
      if (adminError) throw adminError;
      
      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from('admin_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('invitation_token', token);
      
      if (updateError) throw updateError;
      
      return adminUser as ExtendedAdminUser;
    },

    cancelInvitation: async (id: string) => {
      const { error } = await supabase
        .from('admin_invitations')
        .update({ status: 'cancelled' })
        .eq('id', id);
      
      if (error) throw error;
    },

    resendInvitation: async (id: string) => {
      // Generate new token and extend expiry
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_invitation_token');
      
      if (tokenError) throw tokenError;
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      const { data, error } = await supabase
        .from('admin_invitations')
        .update({
          invitation_token: tokenData,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as AdminInvitation;
    }
  },

  // Email Templates for Admin System
  invitationEmailTemplates: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as InvitationEmailTemplate[];
    },

    getByType: async (templateName: string) => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('name', templateName)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data as InvitationEmailTemplate | null;
    },

    create: async (template: Omit<InvitationEmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name: template.name,
          category: template.category,
          subject: template.subject,
          content: template.content,
          variables: template.variables,
          is_active: template.is_active,
          created_by: template.created_by || 'admin'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as InvitationEmailTemplate;
    },

    update: async (id: string, template: Partial<InvitationEmailTemplate>) => {
      const { data, error } = await supabase
        .from('email_templates')
        .update({
          name: template.name,
          category: template.category,
          subject: template.subject,
          content: template.content,
          variables: template.variables,
          is_active: template.is_active
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as InvitationEmailTemplate;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  // Admin Authentication
  adminAuth: {
    login: async (email: string, password: string) => {
      // Get admin user
      const { data: adminUser, error: userError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .eq('account_status', 'active')
        .single();
      
      if (userError) throw new Error('Invalid credentials');
      
      // Verify password
      const { data: isValid, error: verifyError } = await supabase
        .rpc('verify_password', {
          plain_password: password,
          hashed_password: adminUser.password_hash
        });
      
      if (verifyError || !isValid) {
        throw new Error('Invalid credentials');
      }
      
      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', adminUser.id);
      
      return adminUser as ExtendedAdminUser;
    },

    getCurrentUser: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return null;
      
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', session.user.email)
        .single();
      
      if (error) return null;
      
      return adminUser as ExtendedAdminUser;
    }
  }
};