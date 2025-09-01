import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MessageCircle, 
  Book, 
  Video, 
  Download,
  HelpCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Send,
  Paperclip
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { enterpriseApi } from '../../services/enterpriseApi';
import { SupportTicket, Resource } from '../../types/enterprise';

const SupportCenter = () => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);

  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: 'general'
  });

  const [newMessage, setNewMessage] = useState('');

  // Mock customer ID
  const customerId = '550e8400-e29b-41d4-a716-446655440001';

  const categories = [
    'general',
    'billing',
    'technical',
    'api',
    'integration',
    'security'
  ];

  const faqData = [
    {
      question: 'How do I get started with the API?',
      answer: 'To get started with our API, first create an API key in your dashboard, then check our comprehensive API documentation for integration guides.',
      category: 'api'
    },
    {
      question: 'What are the rate limits for API calls?',
      answer: 'Rate limits depend on your subscription plan. Starter plans have 1,000 requests/hour, Professional plans have 10,000 requests/hour, and Enterprise plans have custom limits.',
      category: 'api'
    },
    {
      question: 'How can I upgrade my subscription?',
      answer: 'You can upgrade your subscription anytime from the billing section in your dashboard. Changes take effect immediately.',
      category: 'billing'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use enterprise-grade security with SOC 2 Type II compliance, end-to-end encryption, and regular security audits.',
      category: 'security'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ticketsData, resourcesData] = await Promise.all([
        enterpriseApi.supportTickets.getByCustomer(customerId),
        enterpriseApi.resources.getAll('customer')
      ]);
      
      setTickets(ticketsData);
      setResources(resourcesData);
    } catch (error) {
      console.error('Error loading support data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await enterpriseApi.supportTickets.create({
        customer_id: customerId,
        subject: ticketForm.subject,
        description: ticketForm.description,
        priority: ticketForm.priority,
        category: ticketForm.category,
        status: 'open'
      });
      
      setShowCreateTicket(false);
      setTicketForm({ subject: '', description: '', priority: 'medium', category: 'general' });
      loadData();
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      await enterpriseApi.supportTickets.addMessage(selectedTicket.id, {
        sender_id: customerId,
        sender_type: 'customer',
        message: newMessage
      });
      
      setNewMessage('');
      // Reload ticket data to show new message
      loadData();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'closed':
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <HelpCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFAQs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
            <p className="text-gray-600">Get help and find resources</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateTicket(true)}
            icon={<Plus />}
          >
            Create Ticket
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for help articles, FAQs, or resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </Card>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'tickets', name: 'Support Tickets', icon: MessageCircle },
            { id: 'faq', name: 'FAQ', icon: HelpCircle },
            { id: 'resources', name: 'Resources', icon: Book },
            { id: 'videos', name: 'Video Tutorials', icon: Video }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Support Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6">Your Support Tickets</h3>
                
                {tickets.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No support tickets</h3>
                    <p className="text-gray-600 mb-6">You haven't created any support tickets yet</p>
                    <Button
                      variant="primary"
                      onClick={() => setShowCreateTicket(true)}
                      icon={<Plus />}
                    >
                      Create Your First Ticket
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(ticket.status)}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{ticket.description.substring(0, 100)}...</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>#{ticket.id.substring(0, 8)}</span>
                          <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Ticket Details Sidebar */}
            <div>
              {selectedTicket ? (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Ticket Details</h3>
                    <Button
                      variant="text"
                      onClick={() => setSelectedTicket(null)}
                      icon={<X className="h-4 w-4" />}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">{selectedTicket.subject}</h4>
                      <p className="text-sm text-gray-600 mt-1">{selectedTicket.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <div className="flex items-center">
                        {getStatusIcon(selectedTicket.status)}
                        <span className="ml-1 text-sm capitalize">{selectedTicket.status}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Priority:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority}
                      </span>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h5 className="font-medium mb-2">Messages</h5>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedTicket.messages?.map((message) => (
                          <div
                            key={message.id}
                            className={`p-3 rounded-lg ${
                              message.sender_type === 'customer' 
                                ? 'bg-green-50 ml-4' 
                                : 'bg-gray-50 mr-4'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(message.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          />
                          <Button
                            variant="primary"
                            onClick={handleSendMessage}
                            icon={<Send className="h-4 w-4" />}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-6">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2" />
                    <p>Select a ticket to view details</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <details key={index} className="border border-gray-200 rounded-lg">
                  <summary className="p-4 cursor-pointer hover:bg-gray-50 font-medium">
                    {faq.question}
                  </summary>
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </Card>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {resource.type === 'document' && <Book className="h-6 w-6 text-blue-500 mr-2" />}
                    {resource.type === 'video' && <Video className="h-6 w-6 text-red-500 mr-2" />}
                    {resource.type === 'template' && <Download className="h-6 w-6 text-green-500 mr-2" />}
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {resource.category}
                    </span>
                  </div>
                </div>
                
                <h4 className="font-semibold mb-2">{resource.title}</h4>
                <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {resource.download_count} downloads
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Download className="h-4 w-4" />}
                    onClick={() => enterpriseApi.resources.incrementDownload(resource.id)}
                  >
                    Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Video Tutorials Tab */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Getting Started with API',
                description: 'Learn how to make your first API call',
                duration: '5:30',
                thumbnail: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg'
              },
              {
                title: 'Setting up Webhooks',
                description: 'Configure webhooks for real-time updates',
                duration: '8:15',
                thumbnail: 'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg'
              },
              {
                title: 'Advanced Analytics',
                description: 'Deep dive into analytics features',
                duration: '12:45',
                thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg'
              }
            ].map((video, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="font-semibold mb-2">{video.title}</h4>
                  <p className="text-sm text-gray-600 mb-4">{video.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{video.duration}</span>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Video className="h-4 w-4" />}
                    >
                      Watch
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Ticket Modal */}
        {showCreateTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Create Support Ticket</h3>
              
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Please describe your issue in detail..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateTicket(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    Create Ticket
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportCenter;