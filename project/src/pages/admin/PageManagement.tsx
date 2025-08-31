import { useState, useEffect } from 'react';
import { Save, Loader, Edit, Eye, FileText, Image, List, Users, BarChart3, MessageSquare, X, ExternalLink, Upload, Settings, Plus, Trash2, Star, BarChart, Target, DollarSign } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import RefreshButton from '../../components/common/RefreshButton';
import { api, PageSection, PageContent } from '../../services/api';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';

const pages = [
  { id: 'home', name: 'Home Page', icon: 'Home' },
  { id: 'about', name: 'About Page', icon: 'Info' },
  { id: 'products', name: 'Products Page', icon: 'Package' },
  { id: 'careers', name: 'Careers Page', icon: 'Briefcase' }
];

const sectionTypeIcons = {
  text: FileText,
  rich_text: FileText,
  image: Image,
  card: MessageSquare,
  list: List,
  hero: BarChart3,
  stats: BarChart3,
  testimonial: MessageSquare,
  testimonials: MessageSquare,
  team_member: Users,
  leadership: Users,
  'mission-vision': Target,
  pricing: DollarSign,
  cta: ExternalLink,
  call_to_action: ExternalLink,
  'product-features': Target,
  products: Target
};

const PageManagement = () => {
  const { getSetting, updateSetting, uploadLogo, uploadFavicon } = useSystemSettings();
  const [selectedPage, setSelectedPage] = useState(pages[0]);
  const [pageSections, setPageSections] = useState<PageSection[]>([]);
  const [pageContent, setPageContent] = useState<Record<string, PageContent>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('pages');
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  
  // Contact details state
  const [contactDetails, setContactDetails] = useState({
    company_name: getSetting('company_name', 'Trinexa'),
    company_tagline: getSetting('company_tagline', 'Innovative Solutions for Tomorrow'),
    business_registration: getSetting('business_registration', ''),
    contact_email: getSetting('contact_email', 'contact@trinexa.com'),
    support_email: getSetting('support_email', 'support@trinexa.com'),
    contact_phone: getSetting('contact_phone', '+1 (555) 123-4567'),
    contact_fax: getSetting('contact_fax', ''),
    contact_address: getSetting('contact_address', '123 Innovation Drive, Tech City, California 12345, United States'),
    street_address: getSetting('street_address', '123 Innovation Drive'),
    city: getSetting('city', 'Tech City'),
    state: getSetting('state', 'California'),
    zip_code: getSetting('zip_code', '12345'),
    country: getSetting('country', 'United States'),
    website_url: getSetting('website_url', 'https://www.trinexa.com'),
    social_linkedin: getSetting('social_linkedin', ''),
    social_twitter: getSetting('social_twitter', ''),
    social_facebook: getSetting('social_facebook', ''),
    social_instagram: getSetting('social_instagram', ''),
    business_hours_weekday: getSetting('business_hours_weekday', '9:00 AM - 6:00 PM'),
    business_hours_saturday: getSetting('business_hours_saturday', '10:00 AM - 4:00 PM'),
    business_hours_sunday: getSetting('business_hours_sunday', 'Closed'),
    business_timezone: getSetting('business_timezone', 'PST (UTC-8)'),
  });

  useEffect(() => {
    loadPageData(selectedPage.id);
  }, [selectedPage]);

  // Update contact details when settings change
  useEffect(() => {
    setContactDetails({
      company_name: getSetting('company_name', 'Trinexa'),
      company_tagline: getSetting('company_tagline', 'Innovative Solutions for Tomorrow'),
      business_registration: getSetting('business_registration', ''),
      contact_email: getSetting('contact_email', 'contact@trinexa.com'),
      support_email: getSetting('support_email', 'support@trinexa.com'),
      contact_phone: getSetting('contact_phone', '+1 (555) 123-4567'),
      contact_fax: getSetting('contact_fax', ''),
      contact_address: getSetting('contact_address', '123 Innovation Drive, Tech City, California 12345, United States'),
      street_address: getSetting('street_address', '123 Innovation Drive'),
      city: getSetting('city', 'Tech City'),
      state: getSetting('state', 'California'),
      zip_code: getSetting('zip_code', '12345'),
      country: getSetting('country', 'United States'),
      website_url: getSetting('website_url', 'https://www.trinexa.com'),
      social_linkedin: getSetting('social_linkedin', ''),
      social_twitter: getSetting('social_twitter', ''),
      social_facebook: getSetting('social_facebook', ''),
      social_instagram: getSetting('social_instagram', ''),
      business_hours_weekday: getSetting('business_hours_weekday', '9:00 AM - 6:00 PM'),
      business_hours_saturday: getSetting('business_hours_saturday', '10:00 AM - 4:00 PM'),
      business_hours_sunday: getSetting('business_hours_sunday', 'Closed'),
      business_timezone: getSetting('business_timezone', 'PST (UTC-8)'),
    });
  }, [getSetting]);

  const loadPageData = async (pageId: string) => {
    setLoading(true);
    try {
      // Load page sections
      const sections = await api.admin.pageSections.getByPage(pageId);
      
      // Filter out duplicate sections for About page
      const filteredSections = pageId === 'about' 
        ? sections.filter(section => {
            // Remove duplicate Leadership Team (keep 'leadership', remove 'team')
            if (section.section_id === 'team') return false;
            // Remove duplicate Mission & Vision (keep 'mission-vision', remove 'mission')
            if (section.section_id === 'mission') return false;
            return true;
          })
        : sections;
      
      setPageSections(filteredSections);

      // Load page content
      const content = await api.admin.pageContent.get(pageId);
      const contentMap: Record<string, PageContent> = {};
      content.forEach((item) => {
        contentMap[item.section_id] = item;
      });
      setPageContent(contentMap);
    } catch (error) {
      console.error('Error loading page data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setLogoUploading(true);
    try {
      console.log('🎨 LogoUpload: Starting upload for file:', file.name, 'Size:', file.size);
      
      // Use the new asset API upload function
      await uploadLogo(file);
      
      console.log('✅ LogoUpload: Logo uploaded and saved successfully!');
      setSuccessMessage('Logo updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('❌ LogoUpload: Error uploading logo:', error);
      setSuccessMessage(`Error: ${error instanceof Error ? error.message : 'Upload failed'}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleFaviconUpload = async (file: File) => {
    setFaviconUploading(true);
    try {
      console.log('🎯 FaviconUpload: Starting upload for file:', file.name, 'Size:', file.size);
      
      // Use the new asset API upload function
      await uploadFavicon(file);
      
      console.log('✅ FaviconUpload: Favicon uploaded and saved successfully!');
      setSuccessMessage('Favicon updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('❌ FaviconUpload: Error uploading favicon:', error);
      setSuccessMessage(`Error: ${error instanceof Error ? error.message : 'Upload failed'}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } finally {
      setFaviconUploading(false);
    }
  };

  const handleContentChange = (sectionId: string, field: string, value: any) => {
    setPageContent(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        content: {
          ...prev[sectionId]?.content,
          [field]: value
        }
      }
    }));
  };

  const handleSaveContactDetails = async () => {
    setSaving(true);
    try {
      // Save all contact details to system settings
      for (const [key, value] of Object.entries(contactDetails)) {
        await updateSetting(key, value);
      }
      
      // Also update the combined contact_address for footer
      const fullAddress = `${contactDetails.street_address}, ${contactDetails.city}, ${contactDetails.state} ${contactDetails.zip_code}, ${contactDetails.country}`;
      await updateSetting('contact_address', fullAddress);
      
      // Construct business hours string
      const businessHours = `Mon-Fri: ${contactDetails.business_hours_weekday}, Sat: ${contactDetails.business_hours_saturday}, Sun: ${contactDetails.business_hours_sunday} (${contactDetails.business_timezone})`;
      await updateSetting('business_hours', businessHours);
      
      setSuccessMessage('Contact details saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving contact details:', error);
      setSuccessMessage('Error saving contact details. Please try again.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleContactDetailChange = (field: string, value: string) => {
    setContactDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const section of pageSections) {
        const content = pageContent[section.section_id];
        if (content) {
          await api.admin.pageContent.update(
            selectedPage.id,
            section.section_id,
            content.content,
            content.metadata
          );
        }
      }
      setSuccessMessage('Changes saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving page content:', error);
    } finally {
      setSaving(false);
    }
  };

  // Visual Features Editor Component
  const renderFeaturesEditor = (sectionId: string, content: any) => {
    const features = content.items || [];

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Features</label>
          <button
            type="button"
            onClick={() => {
              const newFeature = {
                icon: 'Star',
                title: 'New Feature',
                description: 'Description of the new feature'
              };
              const updatedFeatures = [...features, newFeature];
              handleContentChange(sectionId, 'items', updatedFeatures);
            }}
            className="flex items-center px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Feature
          </button>
        </div>
        
        <div className="space-y-4">
          {features.map((feature: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Feature #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => {
                    const updatedFeatures = features.filter((_: any, i: number) => i !== index);
                    handleContentChange(sectionId, 'items', updatedFeatures);
                  }}
                  className="flex items-center px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
                  <input
                    type="text"
                    value={feature.icon || ''}
                    onChange={(e) => {
                      const updatedFeatures = [...features];
                      updatedFeatures[index] = { ...feature, icon: e.target.value };
                      handleContentChange(sectionId, 'items', updatedFeatures);
                    }}
                    placeholder="e.g., Brain, BarChart, Shield"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={feature.title || ''}
                    onChange={(e) => {
                      const updatedFeatures = [...features];
                      updatedFeatures[index] = { ...feature, title: e.target.value };
                      handleContentChange(sectionId, 'items', updatedFeatures);
                    }}
                    placeholder="Feature title"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <textarea
                    value={feature.description || ''}
                    onChange={(e) => {
                      const updatedFeatures = [...features];
                      updatedFeatures[index] = { ...feature, description: e.target.value };
                      handleContentChange(sectionId, 'items', updatedFeatures);
                    }}
                    placeholder="Feature description"
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {features.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <Star className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No features added yet</p>
              <p className="text-sm">Click "Add Feature" to get started</p>
            </div>
          )}
        </div>
        
        {/* Show JSON for advanced users */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            Advanced: View/Edit JSON
          </summary>
          <div className="mt-2">
            <textarea
              value={JSON.stringify(features, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleContentChange(sectionId, 'items', parsed);
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
        </details>
      </div>
    );
  };

  // Visual Product Features Editor Component
  const renderProductFeaturesEditor = (sectionId: string, content: any) => {
    const products = content.products || [];

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Products & Features</label>
          <button
            type="button"
            onClick={() => {
              const newProduct = {
                name: 'New Product',
                description: 'Product description',
                features: ['Feature 1', 'Feature 2', 'Feature 3'],
                icon: 'Package',
                image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
                buttonText: 'Learn More',
                buttonUrl: '#'
              };
              const updatedProducts = [...products, newProduct];
              handleContentChange(sectionId, 'products', updatedProducts);
            }}
            className="flex items-center px-3 py-1 text-sm bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Product
          </button>
        </div>
        
        <div className="space-y-6">
          {products.map((product: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-700">Product #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => {
                    const updatedProducts = products.filter((_: any, i: number) => i !== index);
                    handleContentChange(sectionId, 'products', updatedProducts);
                  }}
                  className="flex items-center px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={product.name || ''}
                    onChange={(e) => {
                      const updatedProducts = [...products];
                      updatedProducts[index] = { ...product, name: e.target.value };
                      handleContentChange(sectionId, 'products', updatedProducts);
                    }}
                    placeholder="e.g., NexusAnalytics"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
                  <input
                    type="text"
                    value={product.icon || ''}
                    onChange={(e) => {
                      const updatedProducts = [...products];
                      updatedProducts[index] = { ...product, icon: e.target.value };
                      handleContentChange(sectionId, 'products', updatedProducts);
                    }}
                    placeholder="e.g., BarChart, Brain, Shield"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={product.description || ''}
                  onChange={(e) => {
                    const updatedProducts = [...products];
                    updatedProducts[index] = { ...product, description: e.target.value };
                    handleContentChange(sectionId, 'products', updatedProducts);
                  }}
                  placeholder="Brief description of the product"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">Product Image URL</label>
                <input
                  type="url"
                  value={product.image || ''}
                  onChange={(e) => {
                    const updatedProducts = [...products];
                    updatedProducts[index] = { ...product, image: e.target.value };
                    handleContentChange(sectionId, 'products', updatedProducts);
                  }}
                  placeholder="https://example.com/product-image.jpg"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-600">Key Features</label>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedProducts = [...products];
                      const updatedFeatures = [...(product.features || []), 'New feature'];
                      updatedProducts[index] = { ...product, features: updatedFeatures };
                      handleContentChange(sectionId, 'products', updatedProducts);
                    }}
                    className="flex items-center px-2 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Feature
                  </button>
                </div>
                <div className="space-y-2">
                  {(product.features || []).map((feature: string, featureIndex: number) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const updatedProducts = [...products];
                          const updatedFeatures = [...product.features];
                          updatedFeatures[featureIndex] = e.target.value;
                          updatedProducts[index] = { ...product, features: updatedFeatures };
                          handleContentChange(sectionId, 'products', updatedProducts);
                        }}
                        placeholder="Feature description"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updatedProducts = [...products];
                          const updatedFeatures = product.features.filter((_: any, i: number) => i !== featureIndex);
                          updatedProducts[index] = { ...product, features: updatedFeatures };
                          handleContentChange(sectionId, 'products', updatedProducts);
                        }}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(!product.features || product.features.length === 0) && (
                    <div className="text-center py-4 text-gray-400 border border-dashed border-gray-300 rounded-md">
                      <p className="text-sm">No features added yet</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={product.buttonText || ''}
                    onChange={(e) => {
                      const updatedProducts = [...products];
                      updatedProducts[index] = { ...product, buttonText: e.target.value };
                      handleContentChange(sectionId, 'products', updatedProducts);
                    }}
                    placeholder="e.g., Learn More, Try Now"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Button URL</label>
                  <input
                    type="url"
                    value={product.buttonUrl || ''}
                    onChange={(e) => {
                      const updatedProducts = [...products];
                      updatedProducts[index] = { ...product, buttonUrl: e.target.value };
                      handleContentChange(sectionId, 'products', updatedProducts);
                    }}
                    placeholder="e.g., /products/nexus-analytics"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {products.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No products added yet</p>
              <p className="text-sm">Click "Add Product" to get started</p>
            </div>
          )}
        </div>
        
        {/* Show JSON for advanced users */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            Advanced: View/Edit JSON
          </summary>
          <div className="mt-2">
            <textarea
              value={JSON.stringify(products, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleContentChange(sectionId, 'products', parsed);
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
            />
          </div>
        </details>
      </div>
    );
  };

  // Visual Testimonials Editor Component
  const renderTestimonialsEditor = (sectionId: string, content: any) => {
    const testimonials = content.items || [];

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Testimonials</label>
          <button
            type="button"
            onClick={() => {
              const newTestimonial = {
                name: 'New Client',
                position: 'Position',
                company: 'Company Name',
                content: 'Great testimonial about our services...',
                rating: 5,
                image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
              };
              const updatedTestimonials = [...testimonials, newTestimonial];
              handleContentChange(sectionId, 'items', updatedTestimonials);
            }}
            className="flex items-center px-3 py-1 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Testimonial
          </button>
        </div>
        
        <div className="space-y-4">
          {testimonials.map((testimonial: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Testimonial #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => {
                    const updatedTestimonials = testimonials.filter((_: any, i: number) => i !== index);
                    handleContentChange(sectionId, 'items', updatedTestimonials);
                  }}
                  className="flex items-center px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Client Name</label>
                  <input
                    type="text"
                    value={testimonial.name || ''}
                    onChange={(e) => {
                      const updatedTestimonials = [...testimonials];
                      updatedTestimonials[index] = { ...testimonial, name: e.target.value };
                      handleContentChange(sectionId, 'items', updatedTestimonials);
                    }}
                    placeholder="e.g., John Smith"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
                  <input
                    type="text"
                    value={testimonial.position || ''}
                    onChange={(e) => {
                      const updatedTestimonials = [...testimonials];
                      updatedTestimonials[index] = { ...testimonial, position: e.target.value };
                      handleContentChange(sectionId, 'items', updatedTestimonials);
                    }}
                    placeholder="e.g., CEO"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
                  <input
                    type="text"
                    value={testimonial.company || ''}
                    onChange={(e) => {
                      const updatedTestimonials = [...testimonials];
                      updatedTestimonials[index] = { ...testimonial, company: e.target.value };
                      handleContentChange(sectionId, 'items', updatedTestimonials);
                    }}
                    placeholder="e.g., Acme Corp"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={testimonial.rating || 5}
                    onChange={(e) => {
                      const updatedTestimonials = [...testimonials];
                      updatedTestimonials[index] = { ...testimonial, rating: parseInt(e.target.value) };
                      handleContentChange(sectionId, 'items', updatedTestimonials);
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Testimonial Content</label>
                  <textarea
                    value={testimonial.content || ''}
                    onChange={(e) => {
                      const updatedTestimonials = [...testimonials];
                      updatedTestimonials[index] = { ...testimonial, content: e.target.value };
                      handleContentChange(sectionId, 'items', updatedTestimonials);
                    }}
                    placeholder="What did they say about your service?"
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Client Image URL</label>
                  <input
                    type="url"
                    value={testimonial.image || ''}
                    onChange={(e) => {
                      const updatedTestimonials = [...testimonials];
                      updatedTestimonials[index] = { ...testimonial, image: e.target.value };
                      handleContentChange(sectionId, 'items', updatedTestimonials);
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {testimonials.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No testimonials added yet</p>
              <p className="text-sm">Click "Add Testimonial" to get started</p>
            </div>
          )}
        </div>
        
        {/* Show JSON for advanced users */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            Advanced: View/Edit JSON
          </summary>
          <div className="mt-2">
            <textarea
              value={JSON.stringify(testimonials, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleContentChange(sectionId, 'items', parsed);
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
            />
          </div>
        </details>
      </div>
    );
  };

  // Visual Call-to-Action Editor Component
  const renderCallToActionEditor = (sectionId: string, content: any) => {
    const ctas = content.items || [];

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Call-to-Action Buttons</label>
          <button
            type="button"
            onClick={() => {
              const newCTA = {
                text: 'Get Started',
                url: '#',
                style: 'primary',
                icon: 'ArrowRight'
              };
              const updatedCTAs = [...ctas, newCTA];
              handleContentChange(sectionId, 'items', updatedCTAs);
            }}
            className="flex items-center px-3 py-1 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add CTA Button
          </button>
        </div>
        
        <div className="space-y-4">
          {ctas.map((cta: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">CTA Button #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => {
                    const updatedCTAs = ctas.filter((_: any, i: number) => i !== index);
                    handleContentChange(sectionId, 'items', updatedCTAs);
                  }}
                  className="flex items-center px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={cta.text || ''}
                    onChange={(e) => {
                      const updatedCTAs = [...ctas];
                      updatedCTAs[index] = { ...cta, text: e.target.value };
                      handleContentChange(sectionId, 'items', updatedCTAs);
                    }}
                    placeholder="e.g., Get Started, Learn More"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">URL/Link</label>
                  <input
                    type="text"
                    value={cta.url || ''}
                    onChange={(e) => {
                      const updatedCTAs = [...ctas];
                      updatedCTAs[index] = { ...cta, url: e.target.value };
                      handleContentChange(sectionId, 'items', updatedCTAs);
                    }}
                    placeholder="e.g., /contact, https://example.com"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Button Style</label>
                  <select
                    value={cta.style || 'primary'}
                    onChange={(e) => {
                      const updatedCTAs = [...ctas];
                      updatedCTAs[index] = { ...cta, style: e.target.value };
                      handleContentChange(sectionId, 'items', updatedCTAs);
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="primary">Primary (Filled)</option>
                    <option value="secondary">Secondary (Outline)</option>
                    <option value="ghost">Ghost (Text only)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
                  <input
                    type="text"
                    value={cta.icon || ''}
                    onChange={(e) => {
                      const updatedCTAs = [...ctas];
                      updatedCTAs[index] = { ...cta, icon: e.target.value };
                      handleContentChange(sectionId, 'items', updatedCTAs);
                    }}
                    placeholder="e.g., ArrowRight, Download, Mail"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {ctas.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <ExternalLink className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No CTA buttons added yet</p>
              <p className="text-sm">Click "Add CTA Button" to get started</p>
            </div>
          )}
        </div>
        
        {/* Show JSON for advanced users */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            Advanced: View/Edit JSON
          </summary>
          <div className="mt-2">
            <textarea
              value={JSON.stringify(ctas, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleContentChange(sectionId, 'items', parsed);
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
            />
          </div>
        </details>
      </div>
    );
  };

  // Visual Statistics Editor Component
  const renderStatisticsEditor = (sectionId: string, content: any) => {
    const statistics = content.items || [];

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Statistics</label>
          <button
            type="button"
            onClick={() => {
              const newStat = {
                label: 'New Statistic',
                value: '100%'
              };
              const updatedStats = [...statistics, newStat];
              handleContentChange(sectionId, 'items', updatedStats);
            }}
            className="flex items-center px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Statistic
          </button>
        </div>
        
        <div className="space-y-4">
          {statistics.map((stat: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Statistic #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => {
                    const updatedStats = statistics.filter((_: any, i: number) => i !== index);
                    handleContentChange(sectionId, 'items', updatedStats);
                  }}
                  className="flex items-center px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                  <input
                    type="text"
                    value={stat.label || ''}
                    onChange={(e) => {
                      const updatedStats = [...statistics];
                      updatedStats[index] = { ...stat, label: e.target.value };
                      handleContentChange(sectionId, 'items', updatedStats);
                    }}
                    placeholder="e.g., Client Satisfaction"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Value</label>
                  <input
                    type="text"
                    value={stat.value || ''}
                    onChange={(e) => {
                      const updatedStats = [...statistics];
                      updatedStats[index] = { ...stat, value: e.target.value };
                      handleContentChange(sectionId, 'items', updatedStats);
                    }}
                    placeholder="e.g., 98%, 250+, 24/7"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {statistics.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <BarChart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No statistics added yet</p>
              <p className="text-sm">Click "Add Statistic" to get started</p>
            </div>
          )}
        </div>
        
        {/* Show JSON for advanced users */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            Advanced: View/Edit JSON
          </summary>
          <div className="mt-2">
            <textarea
              value={JSON.stringify(statistics, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleContentChange(sectionId, 'items', parsed);
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
            />
          </div>
        </details>
      </div>
    );
  };

  // Visual Leadership Team Editor Component
  const renderLeadershipEditor = (sectionId: string, content: any) => {
    const leaders = content.leaders || content.team || [];

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Leadership Team Members</label>
          <button
            type="button"
            onClick={() => {
              const newLeader = {
                name: 'New Leader',
                position: 'Position',
                bio: 'Bio description here...',
                image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
                linkedin: '',
                email: ''
              };
              const updatedLeaders = [...leaders, newLeader];
              // Handle both 'leaders' and 'team' field names
              const fieldName = content.leaders !== undefined ? 'leaders' : 'team';
              handleContentChange(sectionId, fieldName, updatedLeaders);
            }}
            className="flex items-center px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Leader
          </button>
        </div>
        
        <div className="space-y-4">
          {leaders.map((leader: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">Leader #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => {
                    const updatedLeaders = leaders.filter((_: any, i: number) => i !== index);
                    const fieldName = content.leaders !== undefined ? 'leaders' : 'team';
                    handleContentChange(sectionId, fieldName, updatedLeaders);
                  }}
                  className="flex items-center px-2 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={leader.name || ''}
                    onChange={(e) => {
                      const updatedLeaders = [...leaders];
                      updatedLeaders[index] = { ...leader, name: e.target.value };
                      const fieldName = content.leaders !== undefined ? 'leaders' : 'team';
                      handleContentChange(sectionId, fieldName, updatedLeaders);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
                  <input
                    type="text"
                    value={leader.position || ''}
                    onChange={(e) => {
                      const updatedLeaders = [...leaders];
                      updatedLeaders[index] = { ...leader, position: e.target.value };
                      const fieldName = content.leaders !== undefined ? 'leaders' : 'team';
                      handleContentChange(sectionId, fieldName, updatedLeaders);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
                  <textarea
                    value={leader.bio || ''}
                    onChange={(e) => {
                      const updatedLeaders = [...leaders];
                      updatedLeaders[index] = { ...leader, bio: e.target.value };
                      const fieldName = content.leaders !== undefined ? 'leaders' : 'team';
                      handleContentChange(sectionId, fieldName, updatedLeaders);
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={leader.image || ''}
                    onChange={(e) => {
                      const updatedLeaders = [...leaders];
                      updatedLeaders[index] = { ...leader, image: e.target.value };
                      const fieldName = content.leaders !== undefined ? 'leaders' : 'team';
                      handleContentChange(sectionId, fieldName, updatedLeaders);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={leader.email || ''}
                    onChange={(e) => {
                      const updatedLeaders = [...leaders];
                      updatedLeaders[index] = { ...leader, email: e.target.value };
                      const fieldName = content.leaders !== undefined ? 'leaders' : 'team';
                      handleContentChange(sectionId, fieldName, updatedLeaders);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={leader.linkedin || ''}
                    onChange={(e) => {
                      const updatedLeaders = [...leaders];
                      updatedLeaders[index] = { ...leader, linkedin: e.target.value };
                      const fieldName = content.leaders !== undefined ? 'leaders' : 'team';
                      handleContentChange(sectionId, fieldName, updatedLeaders);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {leaders.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No leadership team members added yet.</p>
              <p className="text-xs text-gray-400">Click "Add Leader" to get started.</p>
            </div>
          )}
        </div>
        
        {/* Show JSON for advanced users */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            Advanced: View/Edit JSON
          </summary>
          <div className="mt-2">
            <textarea
              value={JSON.stringify(leaders, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  const fieldName = content.leaders !== undefined ? 'leaders' : 'team';
                  handleContentChange(sectionId, fieldName, parsed);
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
        </details>
      </div>
    );
  };

  // Visual Mission & Vision Editor Component
  const renderMissionVisionEditor = (sectionId: string, content: any) => {
    const cards = content.cards || [];
    
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Mission & Vision Cards</label>
          <button
            type="button"
            onClick={() => {
              const newCard = {
                icon: 'Target',
                title: 'New Item',
                content: 'Description here...'
              };
              const updatedCards = [...cards, newCard];
              handleContentChange(sectionId, 'cards', updatedCards);
            }}
            className="flex items-center px-3 py-1 text-sm bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Card
          </button>
        </div>
        
        <div className="space-y-4">
          {cards.map((card: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Card #{index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const updatedCards = cards.filter((_: any, i: number) => i !== index);
                    handleContentChange(sectionId, 'cards', updatedCards);
                  }}
                  className="flex items-center px-2 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Icon Name</label>
                  <select
                    value={card.icon || 'Target'}
                    onChange={(e) => {
                      const updatedCards = [...cards];
                      updatedCards[index] = { ...card, icon: e.target.value };
                      handleContentChange(sectionId, 'cards', updatedCards);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Target">Target (Mission)</option>
                    <option value="Zap">Zap (Vision)</option>
                    <option value="Star">Star (Values)</option>
                    <option value="Heart">Heart (Purpose)</option>
                    <option value="Eye">Eye (Vision)</option>
                    <option value="Award">Award (Excellence)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={card.title || ''}
                    onChange={(e) => {
                      const updatedCards = [...cards];
                      updatedCards[index] = { ...card, title: e.target.value };
                      handleContentChange(sectionId, 'cards', updatedCards);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Content</label>
                  <textarea
                    value={card.content || ''}
                    onChange={(e) => {
                      const updatedCards = [...cards];
                      updatedCards[index] = { ...card, content: e.target.value };
                      handleContentChange(sectionId, 'cards', updatedCards);
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {cards.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No mission & vision cards added yet.</p>
              <p className="text-xs text-gray-400">Click "Add Card" to get started.</p>
            </div>
          )}
        </div>
        
        {/* Show JSON for advanced users */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            Advanced: View/Edit JSON
          </summary>
          <div className="mt-2">
            <textarea
              value={JSON.stringify(content, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setPageContent(prev => ({
                    ...prev,
                    [sectionId]: {
                      ...prev[sectionId],
                      content: parsed
                    }
                  }));
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
            />
          </div>
        </details>
      </div>
    );
  };

  // Visual Pricing Plans Editor Component
  const renderPricingEditor = (sectionId: string, content: any) => {
    const plans = content.plans || [];
    
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Pricing Plans</label>
          <button
            type="button"
            onClick={() => {
              const newPlan = {
                name: 'New Plan',
                price: '$99',
                period: '/month',
                description: 'Plan description here...',
                features: ['Feature 1', 'Feature 2', 'Feature 3'],
                cta: 'Get Started',
                popular: false
              };
              const updatedPlans = [...plans, newPlan];
              handleContentChange(sectionId, 'plans', updatedPlans);
            }}
            className="flex items-center px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Plan
          </button>
        </div>
        
        <div className="space-y-4">
          {plans.map((plan: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Plan #{index + 1}
                  {plan.popular && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Popular
                    </span>
                  )}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const updatedPlans = plans.filter((_: any, i: number) => i !== index);
                    handleContentChange(sectionId, 'plans', updatedPlans);
                  }}
                  className="flex items-center px-2 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Plan Name</label>
                  <input
                    type="text"
                    value={plan.name || ''}
                    onChange={(e) => {
                      const updatedPlans = [...plans];
                      updatedPlans[index] = { ...plan, name: e.target.value };
                      handleContentChange(sectionId, 'plans', updatedPlans);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Price</label>
                  <input
                    type="text"
                    value={plan.price || ''}
                    onChange={(e) => {
                      const updatedPlans = [...plans];
                      updatedPlans[index] = { ...plan, price: e.target.value };
                      handleContentChange(sectionId, 'plans', updatedPlans);
                    }}
                    placeholder="$99"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Period</label>
                  <input
                    type="text"
                    value={plan.period || ''}
                    onChange={(e) => {
                      const updatedPlans = [...plans];
                      updatedPlans[index] = { ...plan, period: e.target.value };
                      handleContentChange(sectionId, 'plans', updatedPlans);
                    }}
                    placeholder="/month"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">CTA Button</label>
                  <input
                    type="text"
                    value={plan.cta || ''}
                    onChange={(e) => {
                      const updatedPlans = [...plans];
                      updatedPlans[index] = { ...plan, cta: e.target.value };
                      handleContentChange(sectionId, 'plans', updatedPlans);
                    }}
                    placeholder="Get Started"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={plan.description || ''}
                  onChange={(e) => {
                    const updatedPlans = [...plans];
                    updatedPlans[index] = { ...plan, description: e.target.value };
                    handleContentChange(sectionId, 'plans', updatedPlans);
                  }}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-600">Features</label>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedPlans = [...plans];
                      const updatedFeatures = [...(plan.features || []), 'New feature'];
                      updatedPlans[index] = { ...plan, features: updatedFeatures };
                      handleContentChange(sectionId, 'plans', updatedPlans);
                    }}
                    className="flex items-center px-2 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Feature
                  </button>
                </div>
                <div className="space-y-2">
                  {(plan.features || []).map((feature: string, featureIndex: number) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const updatedPlans = [...plans];
                          const updatedFeatures = [...plan.features];
                          updatedFeatures[featureIndex] = e.target.value;
                          updatedPlans[index] = { ...plan, features: updatedFeatures };
                          handleContentChange(sectionId, 'plans', updatedPlans);
                        }}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updatedPlans = [...plans];
                          const updatedFeatures = plan.features.filter((_: any, i: number) => i !== featureIndex);
                          updatedPlans[index] = { ...plan, features: updatedFeatures };
                          handleContentChange(sectionId, 'plans', updatedPlans);
                        }}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`popular-${index}`}
                  checked={plan.popular || false}
                  onChange={(e) => {
                    const updatedPlans = [...plans];
                    updatedPlans[index] = { ...plan, popular: e.target.checked };
                    handleContentChange(sectionId, 'plans', updatedPlans);
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`popular-${index}`} className="ml-2 text-xs font-medium text-gray-600">
                  Mark as Popular Plan
                </label>
              </div>
            </div>
          ))}
          
          {plans.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No pricing plans added yet.</p>
              <p className="text-xs text-gray-400">Click "Add Plan" to get started.</p>
            </div>
          )}
        </div>
        
        {/* Show JSON for advanced users */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            Advanced: View/Edit JSON
          </summary>
          <div className="mt-2">
            <textarea
              value={JSON.stringify(content, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setPageContent(prev => ({
                    ...prev,
                    [sectionId]: {
                      ...prev[sectionId],
                      content: parsed
                    }
                  }));
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
            />
          </div>
        </details>
      </div>
    );
  };

  const renderContentEditor = (section: PageSection) => {
    const content = pageContent[section.section_id]?.content || section.default_content;

    switch (section.section_type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleContentChange(section.section_id, 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <textarea
                value={content.subtitle || ''}
                onChange={(e) => handleContentChange(section.section_id, 'subtitle', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            {content.cta_primary !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary CTA</label>
                <input
                  type="text"
                  value={content.cta_primary || ''}
                  onChange={(e) => handleContentChange(section.section_id, 'cta_primary', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}
            {content.cta_secondary !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary CTA</label>
                <input
                  type="text"
                  value={content.cta_secondary || ''}
                  onChange={(e) => handleContentChange(section.section_id, 'cta_secondary', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}
            {content.background_image !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background Image URL</label>
                <input
                  type="url"
                  value={content.background_image || ''}
                  onChange={(e) => handleContentChange(section.section_id, 'background_image', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}
            
            {/* Visual Call-to-Action Editor for hero sections */}
            {renderCallToActionEditor(section.section_id, content)}
          </div>
        );

      case 'rich_text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleContentChange(section.section_id, 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={content.content || ''}
                onChange={(e) => handleContentChange(section.section_id, 'content', e.target.value)}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            {content.image !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={content.image || ''}
                  onChange={(e) => handleContentChange(section.section_id, 'image', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}
          </div>
        );

      case 'card':
        if (section.section_id === 'ceo-message') {
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={content.title || ''}
                  onChange={(e) => handleContentChange(section.section_id, 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                <textarea
                  value={content.content || ''}
                  onChange={(e) => handleContentChange(section.section_id, 'content', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={content.author || ''}
                    onChange={(e) => handleContentChange(section.section_id, 'author', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    value={content.position || ''}
                    onChange={(e) => handleContentChange(section.section_id, 'position', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author Image URL</label>
                <input
                  type="url"
                  value={content.image || ''}
                  onChange={(e) => handleContentChange(section.section_id, 'image', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          );
        }
        
        if (section.section_id === 'mission-vision') {
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                <input
                  type="text"
                  value={content.title || ''}
                  onChange={(e) => handleContentChange(section.section_id, 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              {/* Visual Mission & Vision Editor */}
              {renderMissionVisionEditor(section.section_id, content)}
            </div>
          );
        }
        
        if (section.section_id === 'pricing') {
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={content.title || ''}
                  onChange={(e) => handleContentChange(section.section_id, 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={content.subtitle || ''}
                  onChange={(e) => handleContentChange(section.section_id, 'subtitle', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              {/* Visual Pricing Plans Editor */}
              {renderPricingEditor(section.section_id, content)}
            </div>
          );
        }
        
        // Default card editor
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleContentChange(section.section_id, 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={content.subtitle || ''}
                onChange={(e) => handleContentChange(section.section_id, 'subtitle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content (JSON)</label>
              <textarea
                value={JSON.stringify(content, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setPageContent(prev => ({
                      ...prev,
                      [section.section_id]: {
                        ...prev[section.section_id],
                        content: parsed
                      }
                    }));
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
              />
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleContentChange(section.section_id, 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <textarea
                value={content.subtitle || ''}
                onChange={(e) => handleContentChange(section.section_id, 'subtitle', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            {/* Visual Features Editor for list sections */}
            {renderFeaturesEditor(section.section_id, content)}
          </div>
        );

      case 'stats':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleContentChange(section.section_id, 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            {/* Visual Statistics Editor for stats sections */}
            {renderStatisticsEditor(section.section_id, content)}
          </div>
        );

      case 'team_member':
        if (section.section_id === 'leadership') {
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={content.title || ''}
                  onChange={(e) => handleContentChange(section.section_id, 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={content.subtitle || ''}
                  onChange={(e) => handleContentChange(section.section_id, 'subtitle', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              {/* Visual Leadership Team Editor */}
              {renderLeadershipEditor(section.section_id, content)}
            </div>
          );
        }
        
        // Default team_member editor
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleContentChange(section.section_id, 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={content.subtitle || ''}
                onChange={(e) => handleContentChange(section.section_id, 'subtitle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        );

      case 'leadership':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleContentChange(section.section_id, 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={content.subtitle || ''}
                onChange={(e) => handleContentChange(section.section_id, 'subtitle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            {/* Visual Leadership Team Editor */}
            {renderLeadershipEditor(section.section_id, content)}
          </div>
        );

      case 'mission-vision':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleContentChange(section.section_id, 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            {/* Visual Mission & Vision Editor */}
            {renderMissionVisionEditor(section.section_id, content)}
          </div>
        );

      case 'testimonial':
      case 'testimonials':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleContentChange(section.section_id, 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={content.subtitle || ''}
                onChange={(e) => handleContentChange(section.section_id, 'subtitle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            {/* Visual Testimonials Editor */}
            {renderTestimonialsEditor(section.section_id, content)}
          </div>
        );

      case 'cta':
      case 'call_to_action':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleContentChange(section.section_id, 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={content.description || ''}
                onChange={(e) => handleContentChange(section.section_id, 'description', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            {/* Visual Call-to-Action Editor */}
            {renderCallToActionEditor(section.section_id, content)}
          </div>
        );

      case 'product-features':
      case 'products':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleContentChange(section.section_id, 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={content.subtitle || ''}
                onChange={(e) => handleContentChange(section.section_id, 'subtitle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            {/* Visual Product Features Editor */}
            {renderProductFeaturesEditor(section.section_id, content)}
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content (JSON)</label>
              <textarea
                value={JSON.stringify(content, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setPageContent(prev => ({
                      ...prev,
                      [section.section_id]: {
                        ...prev[section.section_id],
                        content: parsed
                      }
                    }));
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Page Management</h1>
        <div className="flex gap-4">
          <RefreshButton 
            onRefresh={async () => await loadPageData(selectedPage.id)}
          />
          <Button
            variant="outline"
            onClick={() => {
              const pageUrls: Record<string, string> = {
                'home': '/',
                'about': '/about',
                'products': '/products',
                'careers': '/careers'
              };
              window.open(pageUrls[selectedPage.id] || '/', '_blank');
            }}
            icon={<ExternalLink />}
          >
            View Live Page
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            icon={<Eye />}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            icon={saving ? <Loader className="animate-spin" /> : <Save />}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('pages')}
            className={`mr-8 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pages'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Page Content
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`mr-8 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contact'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Contact Details
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`mr-8 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'branding'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-1" />
            Branding Settings
          </button>
        </nav>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {activeTab === 'pages' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Page Navigation */}
          <Card className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Pages</h2>
            <nav className="space-y-2">
              {pages.map(page => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page)}
                  className={`w-full text-left px-4 py-3 rounded-md transition-colors flex items-center ${
                    selectedPage.id === page.id
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {page.name}
                </button>
              ))}
            </nav>
          </Card>

          {/* Content Editor */}
          <div className="lg:col-span-3">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">{selectedPage.name} Content</h2>
                <span className="text-sm text-gray-500">
                  {pageSections.length} sections
                </span>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader className="animate-spin h-8 w-8 text-green-500" />
                </div>
              ) : (
                <div className="space-y-6">
                  {pageSections.map(section => {
                    const SectionIcon = sectionTypeIcons[section.section_type as keyof typeof sectionTypeIcons] || FileText;
                    const isEditing = editingSection === section.section_id;
                    
                    return (
                      <div key={section.section_id} className="border border-gray-200 rounded-lg">
                        <div 
                          className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
                          onClick={() => setEditingSection(isEditing ? null : section.section_id)}
                        >
                          <div className="flex items-center">
                            <SectionIcon className="h-5 w-5 text-gray-500 mr-3" />
                            <div>
                              <h3 className="font-medium">{section.section_name}</h3>
                              <p className="text-sm text-gray-500 capitalize">
                                {section.section_type.replace('_', ' ')} • Section ID: {section.section_id}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              section.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {section.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <Edit className={`h-4 w-4 transition-transform ${
                              isEditing ? 'rotate-180' : ''
                            }`} />
                          </div>
                        </div>
                        
                        {isEditing && (
                          <div className="p-4 border-t border-gray-200">
                            {renderContentEditor(section)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {pageSections.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No sections found for this page
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="max-w-6xl">
          <Card>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Contact Details Management</h2>
              <Button
                onClick={handleSaveContactDetails}
                disabled={saving}
                icon={saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save />}
              >
                {saving ? 'Saving...' : 'Save Contact Details'}
              </Button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Company Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={contactDetails.company_name}
                      onChange={(e) => handleContactDetailChange('company_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                    <input
                      type="text"
                      value={contactDetails.company_tagline}
                      onChange={(e) => handleContactDetailChange('company_tagline', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Registration Number</label>
                    <input
                      type="text"
                      value={contactDetails.business_registration}
                      onChange={(e) => handleContactDetailChange('business_registration', e.target.value)}
                      placeholder="Enter registration number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Contact Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Email</label>
                    <input
                      type="email"
                      value={contactDetails.contact_email}
                      onChange={(e) => handleContactDetailChange('contact_email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                    <input
                      type="email"
                      value={contactDetails.support_email}
                      onChange={(e) => handleContactDetailChange('support_email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={contactDetails.contact_phone}
                      onChange={(e) => handleContactDetailChange('contact_phone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fax Number</label>
                    <input
                      type="tel"
                      value={contactDetails.contact_fax}
                      onChange={(e) => handleContactDetailChange('contact_fax', e.target.value)}
                      placeholder="+1 (555) 123-4568"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Address Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={contactDetails.street_address}
                      onChange={(e) => handleContactDetailChange('street_address', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={contactDetails.city}
                        onChange={(e) => handleContactDetailChange('city', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                      <input
                        type="text"
                        value={contactDetails.state}
                        onChange={(e) => handleContactDetailChange('state', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP/Postal Code</label>
                      <input
                        type="text"
                        value={contactDetails.zip_code}
                        onChange={(e) => handleContactDetailChange('zip_code', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={contactDetails.country}
                        onChange={(e) => handleContactDetailChange('country', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media & Online Presence */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Social Media & Online</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                    <input
                      type="url"
                      value={contactDetails.website_url}
                      onChange={(e) => handleContactDetailChange('website_url', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    <input
                      type="url"
                      value={contactDetails.social_linkedin}
                      onChange={(e) => handleContactDetailChange('social_linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/trinexa"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Twitter/X</label>
                    <input
                      type="url"
                      value={contactDetails.social_twitter}
                      onChange={(e) => handleContactDetailChange('social_twitter', e.target.value)}
                      placeholder="https://twitter.com/trinexa"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                    <input
                      type="url"
                      value={contactDetails.social_facebook}
                      onChange={(e) => handleContactDetailChange('social_facebook', e.target.value)}
                      placeholder="https://facebook.com/trinexa"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                    <input
                      type="url"
                      value={contactDetails.social_instagram}
                      onChange={(e) => handleContactDetailChange('social_instagram', e.target.value)}
                      placeholder="https://instagram.com/trinexa"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Business Hours */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Business Hours</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monday - Friday</label>
                      <input
                        type="text"
                        value={contactDetails.business_hours_weekday}
                        onChange={(e) => handleContactDetailChange('business_hours_weekday', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Saturday</label>
                      <input
                        type="text"
                        value={contactDetails.business_hours_saturday}
                        onChange={(e) => handleContactDetailChange('business_hours_saturday', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sunday</label>
                      <input
                        type="text"
                        value={contactDetails.business_hours_sunday}
                        onChange={(e) => handleContactDetailChange('business_hours_sunday', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                      <input
                        type="text"
                        value={contactDetails.business_timezone}
                        onChange={(e) => handleContactDetailChange('business_timezone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Contact Details Usage</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Contact information appears in website footer and contact pages</li>
                  <li>• Business hours are displayed on contact forms and support pages</li>
                  <li>• Social media links are used in website footer and about page</li>
                  <li>• All changes take effect immediately across the website</li>
                  <li>• Ensure all information is accurate for customer communication</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="max-w-4xl">
          <Card>
            <h2 className="text-lg font-semibold mb-6">Branding Settings</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-4">Company Logo</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Logo
                  </label>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {getSetting('logo_url') ? (
                      <div className="flex items-center space-x-4">
                        <img 
                          src={getSetting('logo_url')} 
                          alt="Current Logo" 
                          className="h-12 w-auto object-contain border border-gray-200 rounded bg-white p-2"
                        />
                        <div>
                          <p className="text-sm text-gray-600">Logo is currently active</p>
                          <p className="text-xs text-gray-500">Displayed in navigation and footer</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500">No logo uploaded</p>
                        <p className="text-sm text-gray-400">Using default text branding</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload New Logo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Choose a logo file
                        </span>
                        <span className="block text-xs text-gray-500 mt-1">
                          PNG, JPG, SVG up to 2MB. Recommended: 200x60px
                        </span>
                      </label>
                      <input
                        id="logo-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleLogoUpload(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  {logoUploading && (
                    <div className="mt-4 flex items-center justify-center">
                      <Loader className="animate-spin h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">Uploading logo...</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Logo Guidelines</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use a transparent background (PNG) for best results</li>
                    <li>• Recommended dimensions: 200x60 pixels or similar ratio</li>
                    <li>• Maximum file size: 2MB</li>
                    <li>• Logo will automatically appear in the navigation bar and footer</li>
                    <li>• Changes take effect immediately across all pages</li>
                  </ul>
                </div>
              </div>

              {/* Favicon Upload Section */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-4">Website Favicon (Tab Icon)</h3>
                
                {/* Current Favicon Display */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Favicon
                  </label>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {getSetting('favicon_url') ? (
                      <div className="flex items-center space-x-4">
                        <img 
                          src={getSetting('favicon_url')} 
                          alt="Current Favicon" 
                          className="h-8 w-8 object-contain border border-gray-200 rounded bg-white p-1"
                        />
                        <div>
                          <p className="text-sm text-gray-600">Favicon is currently active</p>
                          <p className="text-xs text-gray-500">Displayed in browser tabs</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500">No favicon uploaded</p>
                        <p className="text-sm text-gray-400">Using default favicon or main logo</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Favicon Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload New Favicon
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="favicon-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Choose a favicon file
                        </span>
                        <span className="block text-xs text-gray-500 mt-1">
                          ICO, PNG, SVG up to 1MB. Recommended: 32x32px or 64x64px
                        </span>
                      </label>
                      <input
                        id="favicon-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*,.ico"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFaviconUpload(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  {faviconUploading && (
                    <div className="mt-4 flex items-center justify-center">
                      <Loader className="animate-spin h-5 w-5 text-purple-500 mr-2" />
                      <span className="text-sm text-gray-600">Uploading favicon...</span>
                    </div>
                  )}
                </div>

                {/* Favicon Guidelines */}
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-900 mb-2">Favicon Guidelines</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Use a square image (32x32px or 64x64px) for best results</li>
                    <li>• ICO format is recommended for maximum browser compatibility</li>
                    <li>• PNG and SVG formats are also supported</li>
                    <li>• Maximum file size: 1MB</li>
                    <li>• Favicon appears in browser tabs and bookmarks</li>
                    <li>• If no favicon is uploaded, your main logo will be used</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Preview: {selectedPage.name}</h3>
              <Button
                variant="text"
                onClick={() => setShowPreview(false)}
                icon={<X />}
              />
            </div>
            <div className="p-6">
              <div className="space-y-8">
                {pageSections.map(section => {
                  const content = pageContent[section.section_id]?.content || section.default_content;
                  return (
                    <div key={section.section_id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{section.section_name}</h4>
                      <div className="bg-gray-50 p-4 rounded">
                        <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(content, null, 2)}
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageManagement;
