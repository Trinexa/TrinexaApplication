import { useState, useEffect } from 'react';
import { Save, Loader, Edit, Eye, FileText, Image, List, Users, BarChart3, MessageSquare, X, ExternalLink, Upload, Settings } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import RefreshButton from '../../components/common/RefreshButton';
import { FaviconTester } from '../../components/common/FaviconTester';
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
  team_member: Users
};

const PageManagement = () => {
  const { getSetting, updateSetting } = useSystemSettings();
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

  // Debug logging
  useEffect(() => {
    console.log('📄 PageManagement: Loading state:', loading);
    console.log('📄 PageManagement: Contact email:', getSetting('contact_email'));
    console.log('📄 PageManagement: Contact phone:', getSetting('contact_phone'));
    console.log('📄 PageManagement: Social Facebook:', getSetting('social_facebook'));
  }, [loading]);

  useEffect(() => {
    loadPageData(selectedPage.id);
  }, [selectedPage]);

  const loadPageData = async (pageId: string) => {
    setLoading(true);
    try {
      // Load page sections
      const sections = await api.admin.pageSections.getByPage(pageId);
      setPageSections(sections);

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
      
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (PNG, JPG, GIF, SVG)');
      }
      
      // Validate file size (max 2MB for logo)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Logo file size must be less than 2MB');
      }
      
      // Convert file to data URL for permanent storage
      const logoUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          console.log('🎨 LogoUpload: File converted to data URL, length:', result.length);
          resolve(result);
        };
        reader.onerror = (e) => {
          console.error('🎨 LogoUpload: Error reading file:', e);
          reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
      });
      
      console.log('🎨 LogoUpload: Setting logo URL in settings...');
      // Update the system settings with the new logo data URL
      await updateSetting('logo_url', logoUrl);
      
      console.log('✅ LogoUpload: Logo uploaded and saved successfully!');
      setSuccessMessage('Logo updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('❌ LogoUpload: Error uploading logo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error uploading logo. Please try again.';
      setSuccessMessage(errorMessage);
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleFaviconUpload = async (file: File) => {
    setFaviconUploading(true);
    try {
      console.log('🎨 FaviconUpload: Starting upload for file:', file.name, 'Size:', file.size);
      
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (PNG, JPG, GIF, SVG, ICO)');
      }
      
      // Validate file size (max 1MB for favicon)
      if (file.size > 1024 * 1024) {
        throw new Error('Favicon file size must be less than 1MB');
      }
      
      // Convert file to data URL for permanent storage
      const faviconUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          console.log('🎨 FaviconUpload: File converted to data URL, length:', result.length);
          resolve(result);
        };
        reader.onerror = (e) => {
          console.error('🎨 FaviconUpload: Error reading file:', e);
          reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
      });
      
      console.log('🎨 FaviconUpload: Setting favicon URL in settings...');
      // Update the system settings with the new favicon data URL
      await updateSetting('favicon_url', faviconUrl);
      
      console.log('✅ FaviconUpload: Favicon uploaded and saved successfully!');
      setSuccessMessage('Favicon updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('❌ FaviconUpload: Error uploading favicon:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error uploading favicon. Please try again.';
      setSuccessMessage(errorMessage);
      setTimeout(() => setSuccessMessage(''), 3000);
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Items (JSON)</label>
              <textarea
                value={JSON.stringify(content.items || [], null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleContentChange(section.section_id, 'items', parsed);
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statistics (JSON)</label>
              <textarea
                value={JSON.stringify(content.items || [], null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleContentChange(section.section_id, 'items', parsed);
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
              />
            </div>
          </div>
        );

      case 'team_member':
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Members (JSON)</label>
              <textarea
                value={JSON.stringify(content.members || [], null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleContentChange(section.section_id, 'members', parsed);
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
          <button
            onClick={() => setActiveTab('contact')}
            className={`mr-8 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contact'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Contact Details
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

      {activeTab === 'branding' && (
        /* Branding Settings Tab */
        <div className="max-w-4xl">
          <Card>
            <h2 className="text-lg font-semibold mb-6">Branding Settings</h2>
            
            {/* Logo Upload Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-4">Company Logo</h3>
                
                {/* Current Logo Display */}
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

                {/* Logo Upload */}
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

                {/* Logo Guidelines */}
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
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
                      <Loader className="animate-spin h-5 w-5 text-green-500 mr-2" />
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

              {/* Favicon Testing - Temporary for debugging */}
              <div className="border-t pt-6">
                <h3 className="text-base font-medium text-gray-900 mb-4">🧪 Favicon Testing (Debug)</h3>
                <FaviconTester />
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'contact' && (
        /* Contact Details Tab */
        <div className="max-w-4xl">
          <Card>
            <h2 className="text-lg font-semibold mb-6">Contact Details Management</h2>
            
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-4">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Email
                    </label>
                    <input
                      type="email"
                      value={getSetting('contact_email')}
                      onChange={(e) => updateSetting('contact_email', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="contact@company.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={getSetting('contact_phone')}
                      onChange={(e) => updateSetting('contact_phone', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Address
                  </label>
                  <textarea
                    value={getSetting('contact_address')}
                    onChange={(e) => updateSetting('contact_address', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="123 Business Street, City, State 12345"
                  />
                </div>
              </div>

              {/* Social Media Links */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-4">Social Media Links</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={getSetting('social_linkedin')}
                      onChange={(e) => updateSetting('social_linkedin', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter URL
                    </label>
                    <input
                      type="url"
                      value={getSetting('social_twitter')}
                      onChange={(e) => updateSetting('social_twitter', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="https://twitter.com/yourcompany"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      value={getSetting('social_facebook')}
                      onChange={(e) => updateSetting('social_facebook', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="https://facebook.com/yourcompany"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      value={getSetting('social_instagram')}
                      onChange={(e) => updateSetting('social_instagram', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="https://instagram.com/yourcompany"
                    />
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-4">Business Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Hours
                    </label>
                    <input
                      type="text"
                      value={getSetting('business_hours')}
                      onChange={(e) => updateSetting('business_hours', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Mon-Fri: 9:00 AM - 6:00 PM"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={getSetting('support_email')}
                      onChange={(e) => updateSetting('support_email', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="support@company.com"
                    />
                  </div>
                </div>
              </div>

              {/* Preview Current Settings */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Preview Footer Contact Info</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <div><strong>Email:</strong> {getSetting('contact_email') || 'Not set'}</div>
                  <div><strong>Phone:</strong> {getSetting('contact_phone') || 'Not set'}</div>
                  <div><strong>Address:</strong> {getSetting('contact_address') || 'Not set'}</div>
                  <div><strong>Business Hours:</strong> {getSetting('business_hours') || 'Not set'}</div>
                  <div className="flex space-x-4 mt-3">
                    {getSetting('social_linkedin') && (
                      <span className="text-blue-600">LinkedIn ✓</span>
                    )}
                    {getSetting('social_twitter') && (
                      <span className="text-blue-400">Twitter ✓</span>
                    )}
                    {getSetting('social_facebook') && (
                      <span className="text-blue-800">Facebook ✓</span>
                    )}
                    {getSetting('social_instagram') && (
                      <span className="text-pink-600">Instagram ✓</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="text-sm font-medium text-green-900 mb-2">Contact Management Tips</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Contact details are automatically displayed in the footer</li>
                  <li>• Email addresses must be valid format</li>
                  <li>• Social media links should include the full URL</li>
                  <li>• Changes are saved automatically when you edit</li>
                  <li>• All fields are optional but recommended for better user experience</li>
                </ul>
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