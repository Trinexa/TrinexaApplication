import React from 'react';
import { PageSection } from '../../services/api';
import { DynamicHero, DynamicFeatures, DynamicStats, DynamicTestimonials, DynamicTextSection } from './DynamicSections';

interface DynamicPageProps {
  pageId: string;
  sections: PageSection[];
  content: Record<string, any>;
  loading?: boolean;
  error?: string | null;
}

const DynamicPage: React.FC<DynamicPageProps> = ({ 
  pageId, 
  sections, 
  content, 
  loading = false, 
  error = null 
}) => {
  console.log(`🌐 DynamicPage rendering for ${pageId}`, { sections, content });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.warn(`Using fallback content due to error: ${error}`);
  }

  // Render sections based on admin configuration
  const renderSection = (section: PageSection) => {
    const sectionContent = content[section.section_id] || {};
    
    console.log(`🔧 Rendering section: ${section.section_id}`, {
      section_type: section.section_type,
      content: sectionContent
    });

    // Don't render if section is not active or has no content
    if (!section.is_active) {
      console.log(`⚠️ Skipping inactive section: ${section.section_id}`);
      return null;
    }

    switch (section.section_type) {
      case 'hero':
        return (
          <DynamicHero 
            key={section.id}
            content={sectionContent} 
          />
        );

      case 'features':
        return (
          <DynamicFeatures 
            key={section.id}
            content={sectionContent} 
          />
        );

      case 'stats':
        return (
          <DynamicStats 
            key={section.id}
            content={sectionContent} 
          />
        );

      case 'testimonial':
      case 'testimonials':
      case 'case-studies':
        return (
          <DynamicTestimonials 
            key={section.id}
            content={sectionContent} 
          />
        );

      case 'text':
      case 'rich_text':
        return (
          <DynamicTextSection 
            key={section.id}
            content={sectionContent} 
          />
        );

      case 'faq':
        return (
          <section key={section.id} className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {sectionContent.title || 'Frequently Asked Questions'}
                </h2>
                {sectionContent.subtitle && (
                  <p className="text-lg text-gray-600">{sectionContent.subtitle}</p>
                )}
              </div>
              <div className="max-w-4xl mx-auto">
                <div className="space-y-6">
                  {(sectionContent.items || sectionContent.questions || []).map((item: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-3 text-gray-900">
                        {item.question || item.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {item.answer || item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );

      case 'ceo-message':
        return (
          <section key={section.id} className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <div className="mb-8">
                  {sectionContent.image && (
                    <img
                      src={sectionContent.image}
                      alt={sectionContent.author || 'CEO'}
                      className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
                    />
                  )}
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    {sectionContent.title || 'Message from CEO'}
                  </h2>
                </div>
                <div 
                  className="text-lg text-gray-700 leading-relaxed mb-8 prose prose-lg max-w-none mx-auto"
                  dangerouslySetInnerHTML={{ __html: sectionContent.content || '' }}
                />
                {sectionContent.author && (
                  <div className="text-center">
                    <p className="font-semibold text-xl">{sectionContent.author}</p>
                    {sectionContent.position && (
                      <p className="text-gray-600">{sectionContent.position}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        );

      default:
        console.warn(`⚠️ Unknown section type: ${section.section_type} for section: ${section.section_id}`);
        return (
          <DynamicTextSection 
            key={section.id}
            content={sectionContent} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen">
      {sections
        .filter(section => section.is_active)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map(renderSection)}
    </div>
  );
};

export default DynamicPage;
