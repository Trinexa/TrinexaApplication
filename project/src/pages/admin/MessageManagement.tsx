import { useState, useEffect } from 'react';
import { Send, Loader, Clock, Calendar, X, CheckCircle, Plus, Edit, Trash2, Copy, FileText, AlertCircle, Users, TrendingUp, Eye, Download, Upload, Search, Filter } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import QuickLogin from '../../components/common/QuickLogin';
import { api, ScheduledMessage, MessageTemplate } from '../../services/api';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

const recipientTypes = [
  { id: 'all', name: 'All Users' },
  { id: 'demo_requesters', name: 'Demo Requesters' },
  { id: 'job_applicants', name: 'Job Applicants' },
  { id: 'newsletter', name: 'Newsletter Subscribers' },
  { id: 'admin_users', name: 'Admin Users' }
];

const templateCategories = [
  { id: 'custom', name: 'Custom' },
  { id: 'daily', name: 'Daily' },
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' },
  { id: 'yearly', name: 'Yearly' }
];

const MessageManagement = () => {
  const [activeTab, setActiveTab] = useState('compose');
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    recipientType: recipientTypes[0].id,
    scheduleType: 'immediate',
    scheduledDate: '',
    scheduledTime: ''
  });
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  
  // Template management
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    category: 'custom',
    subject: '',
    content: '',
    variables: ''
  });

  // New states for enhanced features
  const [recipientPreview, setRecipientPreview] = useState<any[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [messageHistory, setMessageHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showMessagePreview, setShowMessagePreview] = useState(false);
  const [selectedScheduledMessages, setSelectedScheduledMessages] = useState<string[]>([]);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('all');
  const [authStatus, setAuthStatus] = useState<{isAuthenticated: boolean, user: any, isAdmin: boolean}>({
    isAuthenticated: false,
    user: null,
    isAdmin: false
  });
  const [showQuickLogin, setShowQuickLogin] = useState(false);

  useEffect(() => {
    // Check authentication status on component mount
    const checkAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('⚠️ You are not logged in. Please log in as an admin to access all features.');
          setAuthStatus({ isAuthenticated: false, user: null, isAdmin: false });
          console.warn('No active session detected on component mount');
        } else {
          // Verify admin status
          const { data: adminUser } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', session.user.email)
            .single();
          
          if (!adminUser) {
            setError('⚠️ Your account does not have admin privileges. Some features may not work.');
            setAuthStatus({ isAuthenticated: true, user: session.user, isAdmin: false });
          } else {
            console.log('✅ Admin user authenticated:', adminUser.email, '-', adminUser.role);
            setAuthStatus({ isAuthenticated: true, user: session.user, isAdmin: true });
            // Clear any auth-related errors
            setError('');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthStatus({ isAuthenticated: false, user: null, isAdmin: false });
      }
    };

    checkAuthStatus();
    loadScheduledMessages();
    loadTemplates();
    loadMessageHistory();
    loadAnalytics();
  }, []);

  const loadScheduledMessages = async () => {
    setLoadingScheduled(true);
    try {
      const messages = await api.admin.messages.getScheduled();
      setScheduledMessages(messages);
    } catch (error) {
      console.error('Error loading scheduled messages:', error);
    } finally {
      setLoadingScheduled(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await api.messageTemplates.getAll();
      setTemplates(data);
      console.log('Templates loaded successfully:', data.length, 'templates');
    } catch (error) {
      console.error('Error loading templates:', error);
      setError('Failed to load templates. Please refresh the page.');
    }
  };

  const loadMessageHistory = async () => {
    setLoadingHistory(true);
    try {
      const messages = await api.admin.messages.getAll();
      setMessageHistory(messages);
    } catch (error) {
      console.error('Error loading message history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const messages = await api.admin.messages.getAll();
      const scheduled = await api.admin.messages.getScheduled();
      const templates = await api.messageTemplates.getAll();
      
      // Calculate analytics
      const totalSent = messages.length;
      const totalScheduled = scheduled.filter(m => m.status === 'pending').length;
      const recentMessages = messages.slice(0, 5);
      
      const recipientTypeCounts = messages.reduce((acc, msg) => {
        const source = msg.source || 'unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate time-based analytics
      const now = new Date();
      const thisMonth = messages.filter(msg => {
        const msgDate = new Date(msg.created_at);
        return msgDate.getMonth() === now.getMonth() && msgDate.getFullYear() === now.getFullYear();
      });

      const lastMonth = messages.filter(msg => {
        const msgDate = new Date(msg.created_at);
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
        return msgDate.getMonth() === lastMonthDate.getMonth() && msgDate.getFullYear() === lastMonthDate.getFullYear();
      });

      // Calculate daily stats for the last 7 days
      const dailyStats: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        dailyStats[dateStr] = messages.filter(msg => {
          const msgDate = new Date(msg.created_at);
          return msgDate.toDateString() === dateStr;
        }).length;
      }

      // Template usage statistics
      const templateUsage = templates.reduce((acc, template) => {
        const usage = messages.filter(msg => 
          (msg.subject && msg.subject.includes(template.subject.substring(0, 10))) || 
          (msg.message && msg.message.includes(template.content.substring(0, 20)))
        ).length;
        acc[template.name] = usage;
        return acc;
      }, {} as Record<string, number>);

      setAnalytics({
        totalSent,
        totalScheduled,
        recentMessages,
        recipientTypeCounts,
        thisMonth: thisMonth.length,
        lastMonth: lastMonth.length,
        dailyStats,
        templateUsage,
        growthRate: lastMonth.length > 0 ? ((thisMonth.length - lastMonth.length) / lastMonth.length * 100) : 0
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const previewRecipients = async (recipientType: string) => {
    setLoadingPreview(true);
    try {
      let recipients: any[] = [];
      
      switch (recipientType) {
        case 'demo_requesters':
          const { data: demoData } = await supabase
            .from('demo_bookings')
            .select('id, name, email, company')
            .limit(10);
          recipients = demoData || [];
          break;
          
        case 'job_applicants':
          const { data: jobData } = await supabase
            .from('general_applications')
            .select('id, name, email')
            .limit(10);
          recipients = jobData || [];
          break;
          
        case 'admin_users':
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('id, email')
            .limit(10);
          recipients = adminData || [];
          break;
          
        case 'all':
          // Get a sample from each type
          const [demo, job, admin] = await Promise.all([
            supabase.from('demo_bookings').select('id, name, email, company').limit(5),
            supabase.from('general_applications').select('id, name, email').limit(5),
            supabase.from('admin_users').select('id, email').limit(5)
          ]);
          recipients = [
            ...(demo.data || []).map((r: any) => ({ ...r, type: 'Demo Requester' })),
            ...(job.data || []).map((r: any) => ({ ...r, type: 'Job Applicant' })),
            ...(admin.data || []).map((r: any) => ({ ...r, name: r.email, type: 'Admin User' }))
          ];
          break;
      }
      
      setRecipientPreview(recipients);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Error previewing recipients:', error);
      setError('Failed to load recipient preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleTemplateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTemplateForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.scheduleType === 'scheduled' && (!formData.scheduledDate || !formData.scheduledTime)) {
      setError('Please select date and time for scheduled message');
      return;
    }

    setSending(true);
    setError('');
    
    try {
      // First, check if we have recipients for this type
      const recipientCount = await getRecipientCount(formData.recipientType);
      if (recipientCount === 0) {
        setError('No recipients found for the selected recipient type. Please choose a different recipient type.');
        setSending(false);
        return;
      }

      if (formData.scheduleType === 'immediate') {
        await api.admin.messages.send({
          subject: formData.subject,
          content: formData.content,
          recipient_type: formData.recipientType,
          recipient_ids: []
        } as any);
        setSuccessMessage(`Message sent successfully to ${recipientCount} recipients!`);
      } else {
        const scheduledFor = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString();
        await api.admin.messages.schedule({
          subject: formData.subject,
          content: formData.content,
          recipient_type: formData.recipientType,
          recipient_ids: [],
          scheduled_for: scheduledFor
        } as any);
        setSuccessMessage(`Message scheduled successfully for ${recipientCount} recipients!`);
        loadScheduledMessages();
      }
      
      // Reset form
      setFormData({
        subject: '',
        content: '',
        recipientType: recipientTypes[0].id,
        scheduleType: 'immediate',
        scheduledDate: '',
        scheduledTime: ''
      });
      
      // Reload data
      loadMessageHistory();
      loadAnalytics();
      
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error sending/scheduling message:', error);
      setError('Failed to send/schedule message. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  const getRecipientCount = async (recipientType: string): Promise<number> => {
    try {
      let count = 0;
      
      switch (recipientType) {
        case 'demo_requesters':
          const { count: demoCount } = await supabase
            .from('demo_bookings')
            .select('*', { count: 'exact', head: true })
            .not('email', 'is', null);
          count = demoCount || 0;
          break;
          
        case 'job_applicants':
          const { count: jobCount } = await supabase
            .from('general_applications')
            .select('*', { count: 'exact', head: true })
            .not('email', 'is', null);
          count = jobCount || 0;
          break;
          
        case 'admin_users':
          const { count: adminCount } = await supabase
            .from('admin_users')
            .select('*', { count: 'exact', head: true })
            .not('email', 'is', null);
          count = adminCount || 0;
          break;
          
        case 'all':
          const [demoResult, jobResult, adminResult] = await Promise.all([
            supabase.from('demo_bookings').select('*', { count: 'exact', head: true }).not('email', 'is', null),
            supabase.from('general_applications').select('*', { count: 'exact', head: true }).not('email', 'is', null),
            supabase.from('admin_users').select('*', { count: 'exact', head: true }).not('email', 'is', null)
          ]);
          count = (demoResult.count || 0) + (jobResult.count || 0) + (adminResult.count || 0);
          break;
      }
      
      return count;
    } catch (error) {
      console.error('Error getting recipient count:', error);
      return 0;
    }
  };

  const handleCancelScheduled = async (id: string) => {
    try {
      await api.admin.messages.cancelScheduled(id);
      loadScheduledMessages();
      setSuccessMessage('Scheduled message cancelled successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error cancelling scheduled message:', error);
      setError('Failed to cancel scheduled message. Please try again.');
    }
  };

  const handleBulkCancelScheduled = async () => {
    if (selectedScheduledMessages.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to cancel ${selectedScheduledMessages.length} scheduled messages?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedScheduledMessages.map(id => api.admin.messages.cancelScheduled(id))
      );
      loadScheduledMessages();
      setSelectedScheduledMessages([]);
      setSuccessMessage(`${selectedScheduledMessages.length} scheduled messages cancelled successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error cancelling scheduled messages:', error);
      setError('Failed to cancel some scheduled messages. Please try again.');
    }
  };

  const toggleScheduledMessageSelection = (id: string) => {
    setSelectedScheduledMessages(prev =>
      prev.includes(id)
        ? prev.filter(msgId => msgId !== id)
        : [...prev, id]
    );
  };

  const toggleAllScheduledMessages = () => {
    const pendingMessages = scheduledMessages.filter(m => m.status === 'pending');
    if (selectedScheduledMessages.length === pendingMessages.length) {
      setSelectedScheduledMessages([]);
    } else {
      setSelectedScheduledMessages(pendingMessages.map(m => m.id));
    }
  };

  const handleUseTemplate = (template: MessageTemplate) => {
    // Process template content with common variables
    const processedSubject = processTemplateVariables(template.subject);
    const processedContent = processTemplateVariables(template.content);
    
    setFormData(prev => ({
      ...prev,
      subject: processedSubject,
      content: processedContent
    }));
    setActiveTab('compose');
  };

  const processTemplateVariables = (text: string): string => {
    let processed = text;
    
    // Common default variables
    const defaultVariables = {
      company_name: 'Trinexa',
      current_date: new Date().toLocaleDateString(),
      current_year: new Date().getFullYear().toString(),
      support_email: 'support@trinexa.com',
      website_url: 'https://trinexa.com',
      current_time: new Date().toLocaleTimeString()
    };
    
    // Replace variables in the format {variable_name}
    Object.entries(defaultVariables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      processed = processed.replace(regex, value);
    });
    
    return processed;
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!templateForm.name.trim() || !templateForm.subject.trim() || !templateForm.content.trim()) {
      setError('Please fill in all required fields for the template');
      return;
    }
    
    try {
      console.log('Starting template save process...');
      
      // Check authentication first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session:', session ? 'EXISTS' : 'NONE', sessionError);
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setError('Authentication error. Please log in again and try again.');
        return;
      }
      
      if (!session || !session.user) {
        console.error('No active session - user needs to log in');
        setError('You must be logged in as an admin to create templates.');
        setShowQuickLogin(true);
        return;
      }
      
      // Verify user is actually an admin
      const { data: adminUser, error: adminCheckError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', session.user.email)
        .single();
      
      if (adminCheckError || !adminUser) {
        console.error('User is not an admin:', adminCheckError);
        setError('Access denied. You must be logged in as an admin user to create templates.');
        return;
      }
      
      console.log('Admin user verified:', adminUser.email, '-', adminUser.role);
      
      console.log('Session user:', session.user.id, session.user.email);
      
      const variables = templateForm.variables.split(',').map(v => v.trim()).filter(v => v);
      
      if (editingTemplate) {
        console.log('Updating existing template:', editingTemplate.id);
        await api.messageTemplates.update(editingTemplate.id, {
          name: templateForm.name,
          category: templateForm.category as any,
          subject: templateForm.subject,
          content: templateForm.content,
          variables
        });
        setSuccessMessage('Template updated successfully!');
      } else {
        console.log('Creating new template...');
        
        const templateData = {
          name: templateForm.name,
          category: templateForm.category as any,
          subject: templateForm.subject,
          content: templateForm.content,
          variables,
          created_by: session.user.id
        };
        
        console.log('Template data to create:', templateData);
        
        await api.messageTemplates.create(templateData);
        setSuccessMessage('Template created successfully!');
      }
      
      console.log('Template operation completed, reloading templates...');
      
      // Reload templates to show the new/updated template
      await loadTemplates();
      
      // Close modal and reset form
      setShowTemplateModal(false);
      setEditingTemplate(null);
      setTemplateForm({
        name: '',
        category: 'custom',
        subject: '',
        content: '',
        variables: ''
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error saving template:', error);
      
      // Provide more specific error messages
      if (error && typeof error === 'object' && 'code' in error) {
        const errorObj = error as any;
        if (errorObj.code === '42501') {
          setError('Permission denied. Please ensure you are logged in as an admin user and have the correct permissions.');
        } else if (errorObj.code === 'PGRST301') {
          setError('Authentication required. Please log in again.');
        } else {
          setError(`Database error (${errorObj.code}): ${errorObj.message || 'Unknown error'}`);
        }
      } else {
        setError(`Failed to ${editingTemplate ? 'update' : 'create'} template. Please try again.`);
      }
      
      setTimeout(() => setError(''), 8000);
    }
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      category: template.category,
      subject: template.subject,
      content: template.content,
      variables: template.variables.join(', ')
    });
    setShowTemplateModal(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await api.messageTemplates.delete(id);
        loadTemplates();
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const getRecipientTypeName = (type: string) => {
    return recipientTypes.find(rt => rt.id === type)?.name || type;
  };

  const getCategoryName = (category: string) => {
    return templateCategories.find(c => c.id === category)?.name || category;
  };

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !templateSearchQuery || 
      template.name.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(templateSearchQuery.toLowerCase());
    
    const matchesCategory = templateCategoryFilter === 'all' || template.category === templateCategoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, MessageTemplate[]>);

  // Export templates functionality
  const exportTemplates = () => {
    const dataStr = JSON.stringify(templates, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `message-templates-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import templates functionality
  const importTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedTemplates = JSON.parse(e.target?.result as string);
        
        for (const template of importedTemplates) {
          await api.messageTemplates.create({
            name: `${template.name} (Imported)`,
            category: template.category,
            subject: template.subject,
            content: template.content,
            variables: template.variables,
            created_by: ''
          });
        }
        
        loadTemplates();
        setSuccessMessage(`Successfully imported ${importedTemplates.length} templates!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error importing templates:', error);
        setError('Failed to import templates. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Message Management</h1>
          
          {/* Authentication Status Indicator */}
          <div className="flex items-center space-x-2">
            {authStatus.isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${authStatus.isAdmin ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className={`text-sm ${authStatus.isAdmin ? 'text-green-700' : 'text-yellow-700'}`}>
                  {authStatus.isAdmin ? 'Admin Access' : 'Limited Access'}
                </span>
                {authStatus.user?.email && (
                  <span className="text-sm text-gray-500">({authStatus.user.email})</span>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm text-red-700">Not Logged In</span>
                <button
                  onClick={() => setShowQuickLogin(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'compose'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Compose Message
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'templates'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Message Templates
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'scheduled'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Scheduled Messages
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Analytics
          </button>
        </div>

        {activeTab === 'compose' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Message Composer */}
            <Card className="lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4">Compose Message</h2>
              
              {successMessage && (
                <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="recipientType" className="block text-sm font-medium text-gray-700">
                      Recipients *
                    </label>
                    <Button
                      type="button"
                      variant="text"
                      size="sm"
                      onClick={() => previewRecipients(formData.recipientType)}
                      icon={<Eye className="h-4 w-4" />}
                      className="text-green-600 hover:text-green-700"
                    >
                      Preview Recipients
                    </Button>
                  </div>
                  <select
                    id="recipientType"
                    name="recipientType"
                    value={formData.recipientType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {recipientTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Type *
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="scheduleType"
                        value="immediate"
                        checked={formData.scheduleType === 'immediate'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Send Immediately
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="scheduleType"
                        value="scheduled"
                        checked={formData.scheduleType === 'scheduled'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Schedule for Later
                    </label>
                  </div>
                </div>

                {formData.scheduleType === 'scheduled' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        id="scheduledDate"
                        name="scheduledDate"
                        value={formData.scheduledDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-1">
                        Time *
                      </label>
                      <input
                        type="time"
                        id="scheduledTime"
                        name="scheduledTime"
                        value={formData.scheduledTime}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter message subject..."
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Message Content *
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your message..."
                  />
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={() => setShowMessagePreview(true)}
                    icon={<Eye />}
                    disabled={!formData.subject.trim() || !formData.content.trim()}
                  >
                    Preview Message
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={sending}
                    icon={sending ? <Loader className="animate-spin" /> : formData.scheduleType === 'immediate' ? <Send /> : <Clock />}
                  >
                    {sending ? 'Processing...' : formData.scheduleType === 'immediate' ? 'Send Message' : 'Schedule Message'}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Quick Templates */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Quick Templates</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {templates.slice(0, 5).map((template) => (
                  <div
                    key={template.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {getCategoryName(template.category)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate">{template.subject}</p>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                fullWidth
                className="mt-4"
                onClick={() => setActiveTab('templates')}
              >
                View All Templates
              </Button>
            </Card>
          </div>
        )}

        {activeTab === 'templates' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-lg font-semibold">Message Templates</h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={templateSearchQuery}
                      onChange={(e) => setTemplateSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <select
                      value={templateCategoryFilter}
                      onChange={(e) => setTemplateCategoryFilter(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="all">All Categories</option>
                      {templateCategories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={exportTemplates}
                    icon={<Download className="h-4 w-4" />}
                    size="sm"
                  >
                    Export
                  </Button>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".json"
                      onChange={importTemplates}
                      className="hidden"
                    />
                    <div className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500">
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </div>
                  </label>
                  <Button
                    variant="primary"
                    onClick={() => setShowTemplateModal(true)}
                    icon={<Plus />}
                    size="sm"
                  >
                    Create Template
                  </Button>
                </div>
              </div>
            </div>

            {templateSearchQuery && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found for "{templateSearchQuery}"
                  {templateCategoryFilter !== 'all' && ` in ${getCategoryName(templateCategoryFilter)} category`}
                </p>
              </div>
            )}

            {Object.keys(groupedTemplates).length === 0 ? (
              <Card className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {templateSearchQuery ? 'No templates found' : 'No templates yet'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {templateSearchQuery 
                    ? 'Try adjusting your search criteria or category filter' 
                    : 'Create your first message template to get started'
                  }
                </p>
                {!templateSearchQuery && (
                  <Button
                    variant="primary"
                    onClick={() => setShowTemplateModal(true)}
                    icon={<Plus />}
                  >
                    Create Your First Template
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                  <Card key={category}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium capitalize">
                        {getCategoryName(category)} Templates ({categoryTemplates.length})
                      </h3>
                      <span className="text-sm text-gray-500">
                        {categoryTemplates.reduce((sum, template) => 
                          sum + (analytics?.templateUsage?.[template.name] as number || 0), 0
                        )} total uses
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 flex-1 mr-2">{template.name}</h4>
                            <div className="flex space-x-1 flex-shrink-0">
                              <button
                                onClick={() => handleUseTemplate(template)}
                                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                                title="Use Template"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEditTemplate(template)}
                                className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                                title="Edit Template"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                                title="Delete Template"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 font-medium">{template.subject}</p>
                          <p className="text-xs text-gray-500 line-clamp-3 mb-3">{template.content}</p>
                          
                          <div className="flex items-center justify-between">
                            {template.variables.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {template.variables.slice(0, 3).map((variable, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                  >
                                    {`{${variable}}`}
                                  </span>
                                ))}
                                {template.variables.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{template.variables.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-400 ml-auto">
                              {analytics?.templateUsage?.[template.name] as number || 0} uses
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'scheduled' && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Scheduled Messages</h2>
              <div className="flex items-center space-x-2">
                {selectedScheduledMessages.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleBulkCancelScheduled}
                    icon={<X className="h-4 w-4" />}
                    className="text-red-600 hover:text-red-700"
                  >
                    Cancel Selected ({selectedScheduledMessages.length})
                  </Button>
                )}
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {loadingScheduled ? (
              <div className="flex items-center justify-center p-8">
                <Loader className="animate-spin h-8 w-8 text-green-500" />
              </div>
            ) : scheduledMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No scheduled messages
              </div>
            ) : (
              <div className="space-y-4">
                {/* Bulk select header */}
                {scheduledMessages.some(m => m.status === 'pending') && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedScheduledMessages.length === scheduledMessages.filter(m => m.status === 'pending').length}
                        onChange={toggleAllScheduledMessages}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">Select all pending messages</span>
                    </label>
                    <span className="text-sm text-gray-500">
                      {scheduledMessages.filter(m => m.status === 'pending').length} pending messages
                    </span>
                  </div>
                )}

                {scheduledMessages.map((message) => (
                  <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {message.status === 'pending' && (
                          <input
                            type="checkbox"
                            checked={selectedScheduledMessages.includes(message.id)}
                            onChange={() => toggleScheduledMessageSelection(message.id)}
                            className="mt-1"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{message.subject}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            To: {getRecipientTypeName(message.recipient_type)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Scheduled for: {format(new Date(message.scheduled_for), 'MMM d, yyyy h:mm a')}
                          </p>
                          <div className="flex items-center mt-2">
                            {message.status === 'pending' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </span>
                            ) : message.status === 'sent' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Sent
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <X className="h-3 w-3 mr-1" />
                                Cancelled
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {message.status === 'pending' && (
                        <Button
                          variant="text"
                          onClick={() => handleCancelScheduled(message.id)}
                          icon={<X className="h-4 w-4" />}
                          className="text-red-600 hover:text-red-700"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Send className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Sent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loadingAnalytics ? (
                        <Loader className="h-6 w-6 animate-spin inline" />
                      ) : (
                        analytics?.totalSent || 0
                      )}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Scheduled</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loadingAnalytics ? (
                        <Loader className="h-6 w-6 animate-spin inline" />
                      ) : (
                        analytics?.totalScheduled || 0
                      )}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loadingAnalytics ? (
                        <Loader className="h-6 w-6 animate-spin inline" />
                      ) : (
                        analytics?.thisMonth || 0
                      )}
                    </p>
                    {analytics?.growthRate !== undefined && (
                      <p className={`text-xs ${analytics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analytics.growthRate >= 0 ? '+' : ''}{analytics.growthRate.toFixed(1)}% vs last month
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Templates</p>
                    <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
                    <p className="text-xs text-gray-500">
                      {Object.values(analytics?.templateUsage || {}).reduce((a, b) => (a as number) + (b as number), 0) as number} used
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Daily Activity Chart */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Daily Message Activity (Last 7 Days)</h3>
              {loadingAnalytics ? (
                <div className="flex items-center justify-center p-8">
                  <Loader className="animate-spin h-8 w-8 text-green-500" />
                </div>
              ) : analytics?.dailyStats ? (
                <div className="space-y-2">
                  {Object.entries(analytics.dailyStats).map(([date, count]) => (
                    <div key={date} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.max((count as number) / Math.max(...Object.values(analytics.dailyStats).map(v => v as number)) * 100, 5)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-right">{count as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No data available</p>
              )}
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recipient Types Distribution */}
              <Card>
                <h3 className="text-lg font-semibold mb-4">Messages by Recipient Type</h3>
                {loadingAnalytics ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader className="animate-spin h-8 w-8 text-green-500" />
                  </div>
                ) : analytics?.recipientTypeCounts ? (
                  <div className="space-y-3">
                    {Object.entries(analytics.recipientTypeCounts).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {getRecipientTypeName(type)}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.max((count as number) / Math.max(...Object.values(analytics.recipientTypeCounts).map(v => v as number)) * 100, 10)}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500 w-8 text-right">{count as number}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No data available</p>
                )}
              </Card>

              {/* Template Usage */}
              <Card>
                <h3 className="text-lg font-semibold mb-4">Template Usage Statistics</h3>
                {loadingAnalytics ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader className="animate-spin h-8 w-8 text-green-500" />
                  </div>
                ) : analytics?.templateUsage ? (
                  <div className="space-y-3">
                    {Object.entries(analytics.templateUsage)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([name, usage]) => (
                      <div key={name} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-2">
                          {name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.max((usage as number) / Math.max(...Object.values(analytics.templateUsage).map(v => v as number)) * 100, 5)}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500 w-6 text-right">{usage as number}</span>
                        </div>
                      </div>
                    ))}
                    {Object.keys(analytics.templateUsage).length === 0 && (
                      <p className="text-gray-500 text-center py-4">No template usage data</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No data available</p>
                )}
              </Card>
            </div>

            {/* Recent Messages */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Recent Messages</h3>
              {loadingHistory ? (
                <div className="flex items-center justify-center p-8">
                  <Loader className="animate-spin h-8 w-8 text-green-500" />
                </div>
              ) : messageHistory.length > 0 ? (
                <div className="space-y-3">
                  {messageHistory.slice(0, 5).map((message) => (
                    <div key={message.id} className="border-l-4 border-green-400 pl-4 py-2">
                      <h4 className="font-medium text-gray-900">{message.subject}</h4>
                      <p className="text-sm text-gray-600">
                        To: {getRecipientTypeName(message.recipient_type)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Sent: {format(new Date(message.sent_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  ))}
                  {messageHistory.length > 5 && (
                    <div className="text-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {/* Could open a full message history modal */}}
                        icon={<Eye />}
                      >
                        View All Messages ({messageHistory.length})
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No messages sent yet</p>
                  <Button
                    variant="primary"
                    onClick={() => setActiveTab('compose')}
                    className="mt-4"
                    icon={<Plus />}
                  >
                    Send Your First Message
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h3>
                <Button
                  variant="text"
                  onClick={() => {
                    setShowTemplateModal(false);
                    setEditingTemplate(null);
                    setTemplateForm({
                      name: '',
                      category: 'custom',
                      subject: '',
                      content: '',
                      variables: ''
                    });
                  }}
                  icon={<X />}
                />
              </div>

              <form onSubmit={handleSaveTemplate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={handleTemplateFormChange}
                      name="name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={templateForm.category}
                      onChange={handleTemplateFormChange}
                      name="category"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    >
                      {templateCategories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={templateForm.subject}
                    onChange={handleTemplateFormChange}
                    name="subject"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <textarea
                    value={templateForm.content}
                    onChange={handleTemplateFormChange}
                    name="content"
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variables (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={templateForm.variables}
                    onChange={handleTemplateFormChange}
                    name="variables"
                    placeholder="name, company, date, time"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use these variables in your content like: {`{name}, {company}`}
                  </p>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowTemplateModal(false);
                      setEditingTemplate(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={<FileText />}
                  >
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Recipient Preview Modal */}
        {showPreviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Recipients Preview - {getRecipientTypeName(formData.recipientType)}
                </h3>
                <Button
                  variant="text"
                  onClick={() => setShowPreviewModal(false)}
                  icon={<X />}
                />
              </div>

              {loadingPreview ? (
                <div className="flex items-center justify-center p-8">
                  <Loader className="animate-spin h-8 w-8 text-green-500" />
                </div>
              ) : recipientPreview.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    Showing {recipientPreview.length} recipients
                    {formData.recipientType === 'all' && ' (sample from each category)'}
                  </p>
                  {recipientPreview.map((recipient, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {recipient.name || recipient.email?.split('@')[0] || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">{recipient.email}</p>
                        {recipient.company && (
                          <p className="text-xs text-gray-500">{recipient.company}</p>
                        )}
                      </div>
                      {recipient.type && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {recipient.type}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recipients found for this category</p>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowPreviewModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Preview Modal */}
      {showMessagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Message Preview</h3>
              <Button
                variant="text"
                onClick={() => setShowMessagePreview(false)}
                icon={<X />}
              />
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-green-400 pl-4">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>To:</strong> {getRecipientTypeName(formData.recipientType)}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Delivery:</strong> {formData.scheduleType === 'immediate' ? 'Send Immediately' : 
                    `Scheduled for ${formData.scheduledDate} at ${formData.scheduledTime}`}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Subject:</h4>
                  <p className="text-gray-900 bg-white p-3 rounded border">
                    {processTemplateVariables(formData.subject) || 'No subject'}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Message Content:</h4>
                  <div className="text-gray-900 bg-white p-4 rounded border whitespace-pre-wrap">
                    {processTemplateVariables(formData.content) || 'No content'}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
                <strong>Note:</strong> Template variables like {`{company_name}, {current_date}`} are automatically replaced when the message is sent.
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowMessagePreview(false)}
              >
                Close Preview
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowMessagePreview(false);
                  handleSubmit(new Event('submit') as any);
                }}
                icon={formData.scheduleType === 'immediate' ? <Send /> : <Clock />}
              >
                {formData.scheduleType === 'immediate' ? 'Send Now' : 'Schedule Message'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Login Modal */}
      {showQuickLogin && (
        <QuickLogin
          onLoginSuccess={() => {
            setShowQuickLogin(false);
            // Refresh auth status
            const checkAuth = async () => {
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                const { data: adminUser } = await supabase
                  .from('admin_users')
                  .select('*')
                  .eq('email', session.user.email)
                  .single();
                
                setAuthStatus({
                  isAuthenticated: true,
                  user: session.user,
                  isAdmin: !!adminUser
                });
                setError('');
              }
            };
            checkAuth();
          }}
          onClose={() => setShowQuickLogin(false)}
        />
      )}
    </div>
  );
};

export default MessageManagement;