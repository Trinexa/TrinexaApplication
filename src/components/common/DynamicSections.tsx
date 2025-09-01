import React from 'react';
import { ArrowRight, Brain, BarChart, Shield, Zap, Server, Users, Settings, Mail, Phone, MapPin, MessageSquare, Package, Target } from 'lucide-react';
import Button from './Button';

// Icon mapping
const iconMap = {
  ArrowRight,
  Brain,
  BarChart,
  Shield,
  Zap,
  Server,
  Users,
  Settings,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Package,
  Target,
};

const getIconComponent = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || Settings;
};

// Dynamic Hero Section
interface DynamicHeroProps {
  content: {
    title?: string;
    subtitle?: string;
    cta_primary?: string;
    cta_secondary?: string;
    cta_primary_link?: string;
    cta_secondary_link?: string;
    background_image?: string;
    overlay_opacity?: number;
  };
  className?: string;
}

export const DynamicHero: React.FC<DynamicHeroProps> = ({ content, className = '' }) => {
  const {
    title = 'Welcome',
    subtitle = 'Discover amazing solutions',
    cta_primary = 'Get Started',
    cta_secondary = 'Learn More',
    cta_primary_link = '/products',
    cta_secondary_link = '/about',
    background_image,
    overlay_opacity = 0.7
  } = content;

  return (
    <section className={`relative pt-24 pb-20 md:pt-32 md:pb-28 bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white overflow-hidden ${className}`}>
      {background_image && (
        <div className="absolute inset-0">
          <img 
            src={background_image} 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0 bg-black" 
            style={{ opacity: overlay_opacity }}
          />
        </div>
      )}
      
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-green-400 opacity-5 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-green-500 opacity-5 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="w-full lg:w-1/2 mb-12 lg:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span 
                className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600"
                dangerouslySetInnerHTML={{ __html: title }}
              />
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
              {subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {cta_primary && (
                <Button size="lg" href={cta_primary_link}>
                  {cta_primary}
                </Button>
              )}
              {cta_secondary && (
                <Button variant="outline" size="lg" href={cta_secondary_link}>
                  {cta_secondary}
                </Button>
              )}
            </div>
          </div>
          
          {background_image && (
            <div className="w-full lg:w-1/2 flex justify-center">
              <div className="relative w-full max-w-lg">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-green-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                <div className="relative">
                  <img 
                    src={background_image} 
                    alt="Hero Visual" 
                    className="rounded-lg shadow-2xl"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

interface DynamicFeaturesProps {
  content: {
    title?: string;
    subtitle?: string;
    features?: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
    items?: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  className?: string;
}

export const DynamicFeatures: React.FC<DynamicFeaturesProps> = ({ content, className = '' }) => {
  const { 
    title = 'Features', 
    subtitle = '', 
    features = [], 
    items = [] 
  } = content;

  console.log('🔧 DynamicFeatures received content:', content);

  // Use features if available, otherwise use items (for backward compatibility)
  const featuresData = features.length > 0 ? features : items;
  
  console.log('🔧 DynamicFeatures final data:', featuresData);

  // Don't render if no features data
  if (featuresData.length === 0) {
    return null;
  }

  return (
    <section className={`py-20 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            {title && <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>}
            {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => {
            const IconComponent = getIconComponent(feature.icon || 'Brain');
            
            return (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-t-4 border-green-500">
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <IconComponent className="text-green-600 h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

interface DynamicStatsProps {
  content: {
    title?: string;
    subtitle?: string;
    stats?: Array<{
      label: string;
      value: string;
    }>;
    items?: Array<{
      label: string;
      value: string;
    }>;
  };
  className?: string;
}

export const DynamicStats: React.FC<DynamicStatsProps> = ({ content, className = '' }) => {
  const { 
    title, 
    subtitle, 
    stats = [], 
    items = [] 
  } = content;

  console.log('📊 DynamicStats received content:', content);

  // Use stats if available, otherwise use items (for backward compatibility)
  const statsData = stats.length > 0 ? stats : items;

  console.log('📊 DynamicStats final data:', statsData);

  // Don't render if no stats data
  if (statsData.length === 0) {
    return null;
  }

  return (
    <section className={`py-20 bg-gray-900 text-white ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            {title && <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">{title}</h2>}
            {subtitle && <p className="text-lg text-gray-300">{subtitle}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statsData.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-300 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

interface DynamicTextSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    content?: string;
    alignment?: 'left' | 'center' | 'right';
  };
  className?: string;
}

export const DynamicTextSection: React.FC<DynamicTextSectionProps> = ({ 
  content, 
  className = '' 
}) => {
  const { 
    title = '', 
    subtitle = '', 
    content: textContent = '', 
    alignment = 'center' 
  } = content;

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[alignment];

  return (
    <section className={`py-20 bg-white ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`max-w-4xl mx-auto ${alignmentClass}`}>
          {title && <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>}
          {subtitle && <p className="text-xl text-gray-600 mb-8">{subtitle}</p>}
          {textContent && (
            <div 
              className="text-lg text-gray-700 leading-relaxed prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: textContent }}
            />
          )}
        </div>
      </div>
    </section>
  );
};

interface DynamicTestimonialsProps {
  content: {
    title?: string;
    subtitle?: string;
    testimonials?: Array<{
      quote?: string;
      content?: string;
      author?: string;
      name?: string;
      position?: string;
      company?: string;
      image?: string;
      rating?: number;
    }>;
    items?: Array<{
      quote?: string;
      content?: string;
      author?: string;
      name?: string;
      position?: string;
      company?: string;
      image?: string;
      rating?: number;
    }>;
  } | Array<{
    quote?: string;
    content?: string;
    author?: string;
    name?: string;
    position?: string;
    company?: string;
    image?: string;
    rating?: number;
  }>;
  className?: string;
}

export const DynamicTestimonials: React.FC<DynamicTestimonialsProps> = ({ 
  content, 
  className = '' 
}) => {
  console.log('💬 DynamicTestimonials received content:', content);
  console.log('💬 Content type:', typeof content);
  
  // Early return if no content
  if (!content) {
    console.log('💬 No content provided, not rendering testimonials section');
    return null;
  }

  let testimonialsData: any[] = [];
  let title = '';
  let subtitle = '';
  
  // Handle different content structures
  if (Array.isArray(content)) {
    console.log('💬 Content is an array with length:', content.length);
    if (content.length === 0) {
      console.log('💬 Content array is empty, not rendering testimonials section');
      return null;
    }
    testimonialsData = content;
    title = 'What Our Clients Say';
    subtitle = 'Discover how our solutions have transformed businesses';
  } else {
    // Content is an object - handle admin panel structure
    console.log('💬 Content object keys:', Object.keys(content));
    
    const { 
      title: contentTitle = '', 
      subtitle: contentSubtitle = '', 
      testimonials = [],
      items = [] // Admin panel saves as 'items' array
    } = content;
    
    title = contentTitle || 'What Our Clients Say';
    subtitle = contentSubtitle || 'Discover how our solutions have transformed businesses';
    
    console.log('💬 Content.testimonials (array):', testimonials);
    console.log('💬 Content.items (admin panel):', items);

    // Priority: Admin panel items > testimonials array > empty
    if (Array.isArray(items) && items.length > 0) {
      console.log('💬 Using admin panel items array');
      testimonialsData = items;
    } else if (Array.isArray(testimonials) && testimonials.length > 0) {
      console.log('💬 Using testimonials array');
      testimonialsData = testimonials;
    } else {
      console.log('💬 No valid testimonials data found');
      return null;
    }
  }

  console.log('💬 Final testimonials data:', testimonialsData);
  console.log('💬 Testimonials count:', testimonialsData.length);

  // Validate testimonials data
  if (!testimonialsData || testimonialsData.length === 0) {
    console.log('💬 No testimonials data found or empty array, not rendering section');
    return null;
  }

  // Check if all testimonials have meaningful content
  const hasValidTestimonials = testimonialsData.some(testimonial => {
    const hasContent = (testimonial.quote || testimonial.content || '').trim() !== '';
    const hasAuthor = (testimonial.author || testimonial.name || '').trim() !== '';
    console.log('💬 Checking testimonial validity:', { hasContent, hasAuthor, testimonial });
    return hasContent && hasAuthor;
  });

  if (!hasValidTestimonials) {
    console.log('💬 No valid testimonials found (all empty), not rendering section');
    return null;
  }

  // Helper function to render star rating
  const renderStars = (rating: number = 5) => {
    return (
      <div className="flex items-center mb-2">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Helper function to get dynamic grid classes based on number of items
  const getGridClasses = (itemCount: number) => {
    // Use the shared function
    return getDynamicGridClasses(itemCount);
  };

  return (
    <section className={`py-20 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            {title && <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>}
            {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
          </div>
        )}
        
        <div className={getGridClasses(testimonialsData.length)}>
          {testimonialsData.map((testimonial, index) => {
            // Handle different field name variations from admin panel
            const authorName = testimonial.author || testimonial.name || 'Anonymous';
            const testimonialContent = testimonial.quote || testimonial.content || '';
            const authorPosition = testimonial.position || '';
            const authorCompany = testimonial.company || '';
            const authorImage = testimonial.image || '';
            const rating = testimonial.rating || 5;
            
            // Combine position and company for display
            const fullPosition = authorCompany ? 
              (authorPosition ? `${authorPosition}, ${authorCompany}` : authorCompany) : 
              authorPosition;

            return (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                {/* Rating stars */}
                {rating && renderStars(rating)}
                
                {/* Testimonial content */}
                <blockquote className="text-gray-700 italic mb-4 text-sm leading-relaxed">
                  "{testimonialContent}"
                </blockquote>
                
                {/* Author info */}
                <div className="flex items-center">
                  {authorImage && (
                    <img
                      src={authorImage}
                      alt={authorName}
                      className="w-12 h-12 rounded-full object-cover mr-4 flex-shrink-0"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{authorName}</h4>
                    {fullPosition && (
                      <p className="text-xs text-gray-600">{fullPosition}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Dynamic Mission & Vision Section
interface DynamicMissionVisionProps {
  content: {
    title?: string;
    subtitle?: string;
    mission_text?: string;
    vision_text?: string;
  };
  className?: string;
}

export const DynamicMissionVision: React.FC<DynamicMissionVisionProps> = ({ content, className = '' }) => {
  const {
    title = 'Our Mission & Vision',
    subtitle = 'Driving innovation through intelligent solutions',
    mission_text = 'To democratize AI by making advanced artificial intelligence accessible, practical, and transformative for businesses of all sizes.',
    vision_text = 'To be the global leader in AI innovation, creating a world where intelligent technology enhances human potential and drives sustainable growth.'
  } = content;

  const TargetIcon = getIconComponent('Target');
  const ZapIcon = getIconComponent('Zap');

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">{title}</h2>
          <p className="text-lg text-gray-600">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-2 bg-green-50 rounded-lg w-fit mb-4">
              <TargetIcon className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
            <p className="text-gray-600">{mission_text}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-2 bg-green-50 rounded-lg w-fit mb-4">
              <ZapIcon className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Our Vision</h3>
            <p className="text-gray-600">{vision_text}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Dynamic Leadership Team Section
interface DynamicLeadershipTeamProps {
  content: {
    title?: string;
    subtitle?: string;
    members?: Array<{
      name: string;
      position: string;
      bio: string;
      image?: string;
    }>;
  };
  className?: string;
}

// Helper function to get dynamic grid classes (shared for testimonials and leadership)
const getDynamicGridClasses = (itemCount: number, maxColumns: number = 3) => {
  if (itemCount === 1) {
    return "grid grid-cols-1 gap-8 max-w-md mx-auto";
  } else if (itemCount === 2) {
    return "grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto";
  } else if (itemCount === 3) {
    return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";
  } else if (itemCount === 4 && maxColumns >= 4) {
    return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8";
  } else if (maxColumns >= 4) {
    return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8";
  } else {
    return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";
  }
};

export const DynamicLeadershipTeam: React.FC<DynamicLeadershipTeamProps> = ({ content, className = '' }) => {
  const {
    title = 'Leadership Team',
    subtitle = 'Meet the visionaries behind our success',
    members = []
  } = content;

  // Don't render if no members data
  if (members.length === 0) {
    return null;
  }

  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">{title}</h2>
          <p className="text-lg text-gray-600">{subtitle}</p>
        </div>
        <div className={getDynamicGridClasses(members.length)}>
          {members.map((member, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-center p-6 border-t-4 border-green-500">
              <img
                src={member.image || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'}
                alt={member.name}
                className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
              <p className="text-green-600 font-medium mb-3">{member.position}</p>
              <p className="text-gray-600 text-sm">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Dynamic Values List Section
interface DynamicValuesProps {
  content: {
    title?: string;
    subtitle?: string;
    items?: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  className?: string;
}

export const DynamicValues: React.FC<DynamicValuesProps> = ({ content, className = '' }) => {
  const {
    title = 'Our Values',
    subtitle = 'The principles that guide everything we do',
    items = []
  } = content;

  // Don't render if no items data
  if (items.length === 0) {
    return null;
  }

  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">{title}</h2>
          <p className="text-lg text-gray-600">{subtitle}</p>
        </div>
        <div className={getDynamicGridClasses(items.length, 4)}>
          {items.map((value, index) => {
            const IconComponent = getIconComponent(value.icon);
            return (
              <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-center p-6 border-t-4 border-green-500">
                <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                  <IconComponent className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Dynamic CEO Message Section
interface DynamicCEOMessageProps {
  content: {
    title?: string;
    content?: string;
    author?: string;
    position?: string;
    image?: string;
  };
  className?: string;
}

export const DynamicCEOMessage: React.FC<DynamicCEOMessageProps> = ({ content, className = '' }) => {
  const {
    title = 'Message from our CEO',
    content: messageContent = 'Leading innovation in AI technology with a focus on practical business solutions.',
    author = 'John Smith',
    position = 'Chief Executive Officer',
    image = 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg'
  } = content;

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/4 flex-shrink-0">
                <img
                  src={image}
                  alt={author}
                  className="w-32 h-32 rounded-full object-cover mx-auto"
                />
              </div>
              <div className="md:w-3/4">
                <h3 className="text-2xl font-bold mb-4">{title}</h3>
                <p className="text-gray-600 mb-6 italic text-lg">
                  {messageContent}
                </p>
                <div className="text-center md:text-left">
                  <h4 className="font-semibold text-lg">{author}</h4>
                  <p className="text-gray-500">{position}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Dynamic Call to Action Section
interface DynamicCTAProps {
  content: {
    title?: string;
    subtitle?: string;
    cta_primary?: string;
    cta_secondary?: string;
    cta_primary_link?: string;
    cta_secondary_link?: string;
    background_color?: string;
    text_color?: string;
  };
  className?: string;
}

export const DynamicCTA: React.FC<DynamicCTAProps> = ({ content, className = '' }) => {
  const {
    title = 'Ready to Get Started?',
    subtitle = 'Join hundreds of forward-thinking companies that are already leveraging our AI solutions.',
    cta_primary = 'Get Started',
    cta_secondary = 'Contact Sales',
    cta_primary_link = '/book-demo',
    cta_secondary_link = '/contact',
    background_color = 'bg-gradient-to-r from-green-600 to-green-700',
    text_color = 'text-white'
  } = content;

  return (
    <section className={`py-20 ${background_color} ${text_color} ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {cta_primary && (
            <Button variant="secondary" size="lg" href={cta_primary_link}>
              {cta_primary}
            </Button>
          )}
          {cta_secondary && (
            <Button variant="outline" size="lg" href={cta_secondary_link}>
              {cta_secondary}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

// Dynamic Product Features Section
interface DynamicProductFeaturesProps {
  content: {
    title?: string;
    subtitle?: string;
    products?: Array<{
      name?: string;
      description?: string;
      features?: string[];
      icon?: string;
      image?: string;
      buttonText?: string;
      buttonUrl?: string;
    }>;
  };
  className?: string;
}

export const DynamicProductFeatures: React.FC<DynamicProductFeaturesProps> = ({ 
  content, 
  className = '' 
}) => {
  const {
    title = 'Our Products & Features',
    subtitle = 'Comprehensive AI solutions designed to transform your business operations.',
    products = []
  } = content;

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className={`py-20 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {products.map((product, index) => {
            const IconComponent = getIconComponent(product.icon || 'Settings');
            
            return (
              <div 
                key={index} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                {/* Product Image */}
                {product.image && (
                  <div className="h-48 md:h-56 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="p-8">
                  {/* Product Header */}
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <IconComponent className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {product.name}
                    </h3>
                  </div>
                  
                  {/* Product Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {product.description}
                  </p>
                  
                  {/* Features List */}
                  {product.features && product.features.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        Key Features
                      </h4>
                      <ul className="space-y-2">
                        {product.features.map((feature, featureIndex) => (
                          <li 
                            key={featureIndex} 
                            className="flex items-start"
                          >
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            </div>
                            <span className="text-gray-700 text-sm leading-relaxed">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Action Button */}
                  {product.buttonText && (
                    <div className="pt-4 border-t border-gray-100">
                      <Button
                        href={product.buttonUrl || '#'}
                        className="w-full sm:w-auto"
                        variant="primary"
                      >
                        {product.buttonText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
