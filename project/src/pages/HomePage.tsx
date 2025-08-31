import { DynamicHero, DynamicFeatures, DynamicStats, DynamicTestimonials, DynamicCTA } from '../components/common/DynamicSections';
import { useDynamicContent } from '../hooks/useDynamicContent';
import { api, Testimonial } from '../services/api';
import { useEffect, useState } from 'react';
import { useLogging } from '../hooks/useLogging';

const HomePage = () => {
  const { content, loading, error } = useDynamicContent('home');
  const [fallbackTestimonials, setFallbackTestimonials] = useState<Testimonial[]>([]);
  const { logInfo, logError } = useLogging('HomePage');

  // Load fallback testimonials from dedicated table
  useEffect(() => {
    const loadFallbackTestimonials = async () => {
      try {
        const testimonials = await api.testimonials.getAll();
        setFallbackTestimonials(testimonials);
        logInfo('Fallback testimonials loaded', { count: testimonials.length });
      } catch (err) {
        logError('Failed to load fallback testimonials', err);
      }
    };
    loadFallbackTestimonials();
  }, []);

  // Determine testimonials content with robust handling
  const getTestimonialsContent = () => {
    console.log('🏠 🔍 Determining testimonials content...');
    
    // Priority 1: Admin panel testimonials from page_content table
    if (content?.testimonials) {
      console.log('🏠 ✅ Using admin panel testimonials from page_content');
      console.log('🏠 Admin panel testimonials structure:', content.testimonials);
      
      // Ensure the admin panel testimonials have the correct structure
      const adminTestimonials = content.testimonials;
      
      // Check if it has items array (admin panel format)
      if (adminTestimonials.items && Array.isArray(adminTestimonials.items)) {
        console.log('🏠 Admin panel testimonials have items array:', adminTestimonials.items);
        return {
          title: adminTestimonials.title || 'What Our Clients Say',
          subtitle: adminTestimonials.subtitle || 'Discover how our solutions have transformed businesses',
          items: adminTestimonials.items // Keep as items for DynamicTestimonials to handle
        };
      }
      
      // Check if it has testimonials array (already formatted)
      if (adminTestimonials.testimonials && Array.isArray(adminTestimonials.testimonials)) {
        console.log('🏠 Admin panel testimonials have testimonials array:', adminTestimonials.testimonials);
        return adminTestimonials;
      }
      
      // Return as-is if it's already in the correct format
      return adminTestimonials;
    }
    
    // Priority 2: Fallback to dedicated testimonials table
    if (fallbackTestimonials.length > 0) {
      console.log('🏠 ⚠️ Using fallback testimonials from dedicated table');
      return {
        title: 'What Our Clients Say',
        subtitle: 'Discover how our solutions have transformed businesses',
        testimonials: fallbackTestimonials.map(t => ({
          quote: t.quote,
          author: t.author_name,
          name: t.author_name,
          position: t.author_position,
          company: t.author_company,
          image: t.author_image,
          rating: 5
        }))
      };
    }
    
    // Priority 3: No testimonials available
    console.log('🏠 ❌ No testimonials available from any source');
    return null;
  };

  const testimonialsContent = getTestimonialsContent();
  console.log('🏠 📊 Final testimonials content for rendering:', testimonialsContent);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.warn('🏠 ⚠️ Using fallback content due to error:', error);
  }

  return (
    <>
      {/* Hero Section */}
      {content.hero && <DynamicHero content={content.hero} />}

      {/* Features Section */}
      {content.features && <DynamicFeatures content={content.features} />}

      {/* Statistics Section */}
      {content.stats && <DynamicStats content={content.stats} />}

      {/* Testimonials Section */}
      {testimonialsContent && <DynamicTestimonials content={testimonialsContent} />}

      {/* Call to Action Section */}
      {content.cta && <DynamicCTA content={content.cta} />}
    </>
  );
};

export default HomePage;