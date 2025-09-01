import { useState, useEffect } from 'react';
import { MapPin, Building, Calendar, ChevronRight, Users, GraduationCap, Coffee, Heart, Briefcase, Zap, DollarSign, Loader } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useDynamicContent } from '../hooks/useDynamicContent';
import { api } from '../services/api';

interface JobPosition {
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

// Dynamic Hero Component
const DynamicHero = ({ content }: { content: any }) => {
  console.log('Hero content structure:', JSON.stringify(content, null, 2));
  
  const backgroundStyle = (content.background_image_url || content.background_image || content.backgroundImageUrl || content.backgroundImage) ? {
    backgroundImage: `url(${content.background_image_url || content.background_image || content.backgroundImageUrl || content.backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {};

  return (
    <section 
      className="pt-28 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white relative"
      style={backgroundStyle}
    >
      {/* Overlay for better text readability if background image exists */}
      {(content.background_image_url || content.background_image || content.backgroundImageUrl || content.backgroundImage) && (
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      )}
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {content.title || (
              <>Join Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">Team</span></>
            )}
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            {content.subtitle || 'Help us shape the future of AI and build innovative solutions that transform businesses.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Primary CTA */}
            {(content.primary_cta || content.primaryCta || content.cta_primary) && (
              <Button size="lg" href={content.primary_cta_link || content.primaryCtaLink || content.cta_primary_link || "#openings"}>
                {content.primary_cta || content.primaryCta || content.cta_primary}
              </Button>
            )}
            
            {/* Secondary CTA */}
            {(content.cta_secondary || content.ctaSecondary || content.secondary_cta) && (
              <Button size="lg" variant="outline" href={content.cta_secondary_link || content.ctaSecondaryLink || content.secondary_cta_link || "/careers/apply"}>
                {content.cta_secondary || content.ctaSecondary || content.secondary_cta}
              </Button>
            )}
            
            {/* Additional CTAs from call_to_action_buttons array */}
            {(content.call_to_action_buttons || content.callToActionButtons || content.cta_buttons || content.ctaButtons) && 
             (content.call_to_action_buttons || content.callToActionButtons || content.cta_buttons || content.ctaButtons).map((cta: any, index: number) => (
              <Button 
                key={index}
                size="lg" 
                variant={index === 0 ? "primary" : "outline"}
                href={cta.link || cta.href || cta.url || "#"}
              >
                {cta.text || cta.label || cta.title || cta.name}
              </Button>
            ))}
            
            {/* Additional CTAs from items array (fallback) */}
            {content.items && content.items.map((cta: any, index: number) => (
              <Button 
                key={index}
                size="lg" 
                variant={index === 0 ? "primary" : "outline"}
                href={cta.link || cta.href || cta.url || "#"}
              >
                {cta.text || cta.label || cta.title || cta.name}
              </Button>
            ))}
            
            {/* Fallback CTA if no CTAs are provided */}
            {!(content.primary_cta || content.primaryCta || content.cta_primary) && 
             !(content.cta_secondary || content.ctaSecondary || content.secondary_cta) && 
             !(content.call_to_action_buttons || content.callToActionButtons || content.cta_buttons || content.ctaButtons) && 
             !content.items && (
              <Button size="lg" href="#openings">
                View Open Positions
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const CareersPage = () => {
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const { content, loading: contentLoading } = useDynamicContent('careers');

  // Helper function to get dynamic grid classes based on item count
  const getDynamicGridClasses = (itemCount: number, maxCols: number = 3): string => {
    if (itemCount === 1) return 'grid-cols-1 max-w-md mx-auto';
    if (itemCount === 2) return 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto';
    if (itemCount === 3) {
      if (maxCols >= 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      return 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto';
    }
    if (itemCount === 4) {
      if (maxCols >= 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
    if (itemCount === 5 && maxCols >= 5) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
    
    // Default layout based on maxCols
    if (maxCols === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  useEffect(() => {
    loadJobPositions();
  }, []);

  const loadJobPositions = async () => {
    try {
      setLoading(true);
      const data = await api.jobPositions.getAll(); // Only gets active positions
      setJobPositions(data);
    } catch (error) {
      console.error('Error loading job positions:', error);
      // Fallback to empty array if API fails
      setJobPositions([]);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while content is loading
  if (contentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-green-500 mr-3" />
        <span className="text-gray-600">Loading careers page...</span>
      </div>
    );
  }

  // Debug: Log the content to see what's available
  console.log('Careers page content:', content);
  console.log('Available section keys:', Object.keys(content || {}));
  console.log('Hero section:', content?.hero);
  console.log('Careers-hero section:', content?.['careers-hero']);
  console.log('Career-hero section:', content?.['career-hero']);
  console.log('Hero-section section:', content?.['hero-section']);
  console.log('Careers-hero-section section:', content?.['careers-hero-section']);
  console.log('Why Join section:', content?.['why-join']);
  console.log('Why Join Us section:', content?.['why-join-us']);
  console.log('Values section:', content?.values);
  console.log('Our Values section:', content?.['our-values']);
  console.log('Benefits section:', content?.benefits);
  console.log('Benefits-perks section:', content?.['benefits-perks']);
  console.log('Process section:', content?.process);
  console.log('Hiring-process section:', content?.['hiring-process']);

  // Static fallback data for when no positions are available
  const staticJobOpenings: JobPosition[] = [
    {
      id: '1',
      title: 'AI Engineer',
      department: 'Operations',
      location: 'Sri Lanka(Hybrid)',
      type: 'full-time',
      description: 'Lead the development of cutting-edge AI models and algorithms that power our product suite.',
      requirements: [],
      responsibilities: [],
      benefits: [],
      salary_range: '',
      is_active: true,
      created_at: '',
      updated_at: ''
    }
  ];

  // Use dynamic data if available, otherwise fallback to static data
  const displayJobOpenings = jobPositions.length > 0 ? jobPositions : staticJobOpenings;

  const benefits = [
    {
      title: 'Competitive Compensation',
      description: 'Attractive salary packages and equity options.',
      icon: <DollarSign className="h-8 w-8 text-green-500" />
    },
    {
      title: 'Health & Wellness',
      description: 'Comprehensive health insurance and wellness programs.',
      icon: <Heart className="h-8 w-8 text-green-500" />
    },
    {
      title: 'Remote Flexibility',
      description: 'Flexible work arrangements to suit your lifestyle.',
      icon: <Briefcase className="h-8 w-8 text-green-500" />
    },
    {
      title: 'Learning & Development',
      description: 'Generous budget for courses, conferences, and education.',
      icon: <GraduationCap className="h-8 w-8 text-green-500" />
    },
    {
      title: 'Team Events',
      description: 'Regular team retreats and social activities.',
      icon: <Users className="h-8 w-8 text-green-500" />
    },
    {
      title: 'Work-Life Balance',
      description: 'Unlimited PTO policy and flexible schedules.',
      icon: <Coffee className="h-8 w-8 text-green-500" />
    }
  ];

  return (
    <>
      {/* Dynamic Hero Section - Check multiple possible section IDs */}
      {content?.hero || content?.['careers-hero'] || content?.['career-hero'] || content?.['hero-section'] || content?.['careers-hero-section'] ? (
        <DynamicHero content={content.hero || content['careers-hero'] || content['career-hero'] || content['hero-section'] || content['careers-hero-section']} />
      ) : (
        <section className="pt-28 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white"
                 style={(content?.hero?.background_image_url || content?.hero?.background_image || content?.hero?.backgroundImageUrl ||
                        content?.['careers-hero']?.background_image_url || content?.['career-hero']?.background_image_url) ? {
                   backgroundImage: `url(${content?.hero?.background_image_url || content?.hero?.background_image || content?.hero?.backgroundImageUrl ||
                                            content?.['careers-hero']?.background_image_url || content?.['career-hero']?.background_image_url})`,
                   backgroundSize: 'cover',
                   backgroundPosition: 'center'
                 } : {}}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                {content?.hero?.title || content?.['careers-hero']?.title || content?.['career-hero']?.title || 
                 content?.['hero-section']?.title || content?.['careers-hero-section']?.title || (
                  <>Join Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">Team</span></>
                )}
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                {content?.hero?.subtitle || content?.['careers-hero']?.subtitle || content?.['career-hero']?.subtitle || 
                 content?.['hero-section']?.subtitle || content?.['careers-hero-section']?.subtitle || 
                 'Help us shape the future of AI and build innovative solutions that transform businesses.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* Primary CTA */}
                <Button size="lg" href="#openings">
                  {content?.hero?.primary_cta || content?.hero?.primaryCta || content?.hero?.cta_primary ||
                   content?.['careers-hero']?.primary_cta || content?.['career-hero']?.primary_cta || 
                   content?.['hero-section']?.primary_cta || content?.['careers-hero-section']?.primary_cta || 'View Open Positions'}
                </Button>
                {/* Secondary CTA if available */}
                {(content?.hero?.cta_secondary || content?.hero?.ctaSecondary || content?.hero?.secondary_cta ||
                  content?.['careers-hero']?.cta_secondary || content?.['career-hero']?.cta_secondary ||
                  content?.['hero-section']?.cta_secondary || content?.['careers-hero-section']?.cta_secondary) && (
                  <Button size="lg" variant="outline" href="/careers/apply">
                    {content?.hero?.cta_secondary || content?.hero?.ctaSecondary || content?.hero?.secondary_cta ||
                     content?.['careers-hero']?.cta_secondary || content?.['career-hero']?.cta_secondary ||
                     content?.['hero-section']?.cta_secondary || content?.['careers-hero-section']?.cta_secondary}
                  </Button>
                )}
                {/* Additional CTA buttons from call_to_action_buttons array */}
                {(content?.hero?.call_to_action_buttons || content?.hero?.callToActionButtons || 
                  content?.['careers-hero']?.call_to_action_buttons || content?.['career-hero']?.call_to_action_buttons || 
                  content?.['hero-section']?.call_to_action_buttons || content?.['careers-hero-section']?.call_to_action_buttons)?.map((cta: any, index: number) => (
                  <Button 
                    key={index} 
                    size="lg" 
                    variant={index === 0 ? "primary" : "outline"}
                    href={cta.link || cta.href || cta.url || "#"}
                  >
                    {cta.text || cta.label || cta.title || cta.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why Join Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">
              {content?.['why-join']?.title || content?.['why-join-us']?.title || 'Why Join NexusAI?'}
            </h2>
            <p className="text-gray-600">
              {content?.['why-join']?.content || content?.['why-join']?.subtitle || content?.['why-join-us']?.subtitle || 'Work on challenging problems, collaborate with brilliant minds, and make a real impact.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={content?.['why-join']?.image_url || content?.['why-join']?.image || content?.['why-join-us']?.image || "https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"} 
                alt="Team collaboration" 
                className="rounded-lg shadow-xl w-full"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6">
                {content?.['why-join']?.title || content?.['why-join-us']?.content || "We're on a mission to transform businesses through AI"}
              </h3>
              <div className="space-y-6">
                {(content?.['why-join']?.items || content?.['why-join-us']?.items) ? 
                  (content?.['why-join']?.items || content?.['why-join-us']?.items).map((item: any, index: number) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-500">
                          <Zap className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-semibold">{item.title}</h4>
                        <p className="mt-2 text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  )) : (
                    // Display content as text if no items array
                    <div className="prose prose-lg text-gray-600">
                      <div dangerouslySetInnerHTML={{ 
                        __html: content?.['why-join']?.content || content?.['why-join-us']?.content || 
                        "Work on challenging problems, collaborate with brilliant minds, and make a real impact." 
                      }} />
                    </div>
                  )}
                {/* Fallback static content only if no admin content */}
                {!content?.['why-join'] && !content?.['why-join-us'] && (
                    <>
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-500">
                            <Zap className="h-6 w-6" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-semibold">Cutting-Edge Technology</h4>
                          <p className="mt-2 text-gray-600">
                            Work with the latest AI technologies and contribute to innovative projects that push the boundaries of what's possible.
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-500">
                            <Users className="h-6 w-6" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-semibold">Collaborative Culture</h4>
                          <p className="mt-2 text-gray-600">
                            Join a diverse team of experts who value collaboration, knowledge sharing, and mutual growth.
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-500">
                            <GraduationCap className="h-6 w-6" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-semibold">Growth Opportunities</h4>
                          <p className="mt-2 text-gray-600">
                            Continuous learning and career development are core to our culture, with clear paths for advancement.
                          </p>
                        </div>
                      </div>
                    </>
                  )
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">
              {content?.values?.title || content?.['our-values']?.title || 'Our Values'}
            </h2>
            <p className="text-gray-600">
              {content?.values?.subtitle || content?.['our-values']?.subtitle || 'These principles guide our work and define our culture.'}
            </p>
          </div>

          <div className={`grid gap-8 ${
            (content?.values?.features || content?.values?.items || content?.['our-values']?.items) ? 
              getDynamicGridClasses((content?.values?.features || content?.values?.items || content?.['our-values']?.items).length, 3)
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {(content?.values?.features || content?.values?.items || content?.['our-values']?.items) ? 
              (content?.values?.features || content?.values?.items || content?.['our-values']?.items).map((value: any, index: number) => (
                <Card key={index} className="text-center h-full">
                  <div className="bg-green-100 p-4 rounded-full inline-flex mb-6">
                    <Zap className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </Card>
              )) : (
                // Fallback static content
                <>
                  <Card className="text-center h-full">
                    <div className="bg-green-100 p-4 rounded-full inline-flex mb-6">
                      <Zap className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Innovation</h3>
                    <p className="text-gray-600">
                      We embrace creativity and experimentation, constantly pushing the boundaries of what's possible with AI.
                    </p>
                  </Card>
                  
                  <Card className="text-center h-full">
                    <div className="bg-green-100 p-4 rounded-full inline-flex mb-6">
                      <Users className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Collaboration</h3>
                    <p className="text-gray-600">
                      We believe in the power of diverse perspectives and collaborative problem-solving to create innovative solutions.
                    </p>
                  </Card>
                  
                  <Card className="text-center h-full">
                    <div className="bg-green-100 p-4 rounded-full inline-flex mb-6">
                      <Heart className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Integrity</h3>
                    <p className="text-gray-600">
                      We act with honesty and integrity in all interactions, building trust with transparent practices and ethical AI development.
                    </p>
                  </Card>
                </>
              )
            }
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">
              {content?.benefits?.title || content?.['benefits-perks']?.title || 'Benefits & Perks'}
            </h2>
            <p className="text-gray-600">
              {content?.benefits?.subtitle || content?.['benefits-perks']?.subtitle || 'We offer comprehensive benefits to support your well-being and professional growth.'}
            </p>
          </div>

          <div className={`grid gap-8 ${
            (content?.benefits?.features || content?.benefits?.items || content?.['benefits-perks']?.items) ? 
              getDynamicGridClasses((content?.benefits?.features || content?.benefits?.items || content?.['benefits-perks']?.items).length, 3)
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {(content?.benefits?.features || content?.benefits?.items || content?.['benefits-perks']?.items) ? 
              (content?.benefits?.features || content?.benefits?.items || content?.['benefits-perks']?.items).map((benefit: any, index: number) => (
                <Card key={index} className="h-full">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                </Card>
              )) : (
                // Fallback to static benefits data
                benefits.map((benefit, index) => (
                  <Card key={index} className="h-full">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {benefit.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                        <p className="text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  </Card>
                ))
              )
            }
          </div>
        </div>
      </section>

      {/* Hiring Process */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">
              {content?.process?.title || content?.['hiring-process']?.title || 'Our Hiring Process'}
            </h2>
            <p className="text-gray-600">
              {content?.process?.subtitle || content?.['hiring-process']?.subtitle || 'We\'ve designed a comprehensive hiring process to ensure the best fit for both you and our team.'}
            </p>
          </div>

          <div className={`grid gap-8 ${
            (content?.process?.features || content?.process?.items || content?.['hiring-process']?.items) ? 
              getDynamicGridClasses((content?.process?.features || content?.process?.items || content?.['hiring-process']?.items).length, 4)
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}>
            {(content?.process?.features || content?.process?.items || content?.['hiring-process']?.items) ? 
              (content?.process?.features || content?.process?.items || content?.['hiring-process']?.items).map((step: any, index: number) => (
                <div key={index} className="relative group">
                  {/* Connection Line (only show between steps on larger screens) */}
                  {index < (content?.process?.features || content?.process?.items || content?.['hiring-process']?.items).length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-8 h-0.5 bg-gradient-to-r from-green-300 to-green-400 z-0 transform -translate-x-4"></div>
                  )}
                  
                  <Card className="text-center h-full relative z-10 group-hover:shadow-xl transition-all duration-300 border-0 bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-white">
                    {/* Step Number with enhanced styling */}
                    <div className="relative mb-6">
                      <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {index + 1}
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-br from-green-400 to-green-600 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                    </div>
                    
                    {/* Step Title */}
                    <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-green-700 transition-colors duration-300">
                      {step.title}
                    </h3>
                    
                    {/* Step Description */}
                    <p className="text-gray-600 text-sm leading-relaxed px-2">
                      {step.description}
                    </p>
                    
                    {/* Decorative bottom accent */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Card>
                </div>
              )) : (
                // Enhanced fallback static hiring process steps
                <>
                  <div className="relative group">
                    <div className="hidden lg:block absolute top-16 left-full w-8 h-0.5 bg-gradient-to-r from-green-300 to-green-400 z-0 transform -translate-x-4"></div>
                    <Card className="text-center h-full relative z-10 group-hover:shadow-xl transition-all duration-300 border-0 bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-white">
                      <div className="relative mb-6">
                        <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                          1
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-br from-green-400 to-green-600 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                      </div>
                      <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-green-700 transition-colors duration-300">Application</h3>
                      <p className="text-gray-600 text-sm leading-relaxed px-2">Submit your application with resume and cover letter</p>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Card>
                  </div>
                  
                  <div className="relative group">
                    <div className="hidden lg:block absolute top-16 left-full w-8 h-0.5 bg-gradient-to-r from-green-300 to-green-400 z-0 transform -translate-x-4"></div>
                    <Card className="text-center h-full relative z-10 group-hover:shadow-xl transition-all duration-300 border-0 bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-white">
                      <div className="relative mb-6">
                        <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                          2
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-br from-green-400 to-green-600 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                      </div>
                      <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-green-700 transition-colors duration-300">Screening</h3>
                      <p className="text-gray-600 text-sm leading-relaxed px-2">Initial phone/video screening with our HR team</p>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Card>
                  </div>
                  
                  <div className="relative group">
                    <div className="hidden lg:block absolute top-16 left-full w-8 h-0.5 bg-gradient-to-r from-green-300 to-green-400 z-0 transform -translate-x-4"></div>
                    <Card className="text-center h-full relative z-10 group-hover:shadow-xl transition-all duration-300 border-0 bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-white">
                      <div className="relative mb-6">
                        <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                          3
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-br from-green-400 to-green-600 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                      </div>
                      <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-green-700 transition-colors duration-300">Technical Interview</h3>
                      <p className="text-gray-600 text-sm leading-relaxed px-2">Technical assessment and team interviews</p>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Card>
                  </div>
                  
                  <div className="relative group">
                    <Card className="text-center h-full relative z-10 group-hover:shadow-xl transition-all duration-300 border-0 bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-white">
                      <div className="relative mb-6">
                        <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                          4
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-br from-green-400 to-green-600 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                      </div>
                      <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-green-700 transition-colors duration-300">Final Round</h3>
                      <p className="text-gray-600 text-sm leading-relaxed px-2">Final interview and offer discussion</p>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Card>
                  </div>
                </>
              )
            }
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 bg-gray-50" id="openings">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Open Positions</h2>
            <p className="text-gray-600">
              Explore our current job openings and find your next opportunity.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader className="animate-spin h-8 w-8 text-green-500 mr-3" />
              <span className="text-gray-600">Loading positions...</span>
            </div>
          ) : displayJobOpenings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayJobOpenings.map((job) => (
                  <Card key={job.id} hover className="h-full flex flex-col">
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                      <div className="mb-4">
                        <div className="flex items-center text-gray-600 mb-1">
                          <Building className="h-4 w-4 mr-2" />
                          <span>{job.department}</span>
                        </div>
                        <div className="flex items-center text-gray-600 mb-1">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center text-gray-600 mb-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="capitalize">{job.type.replace('-', ' ')}</span>
                        </div>
                        {job.salary_range && (
                          <div className="flex items-center text-gray-600">
                            <DollarSign className="h-4 w-4 mr-2" />
                            <span>{job.salary_range}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 mb-6">{job.description}</p>
                    </div>
                    <Button variant="text" className="!p-0" href={`/careers/${job.id}`}>
                      View Details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-gray-600 mb-6">Don't see a position that matches your skills?</p>
                <Button variant="outline" href="/careers/apply">
                  Submit General Application
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Open Positions</h3>
              <p className="text-gray-500 mb-6">
                We're not actively hiring at the moment, but we're always interested in meeting talented individuals.
              </p>
              <Button variant="outline" href="/careers/apply">
                Submit General Application
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Us in Shaping the Future</h2>
            <p className="text-xl mb-8">
              Explore our open positions and become part of a team that's transforming businesses through AI innovation.
            </p>
            <Button variant="secondary" size="lg" href="#openings">
              View Open Positions
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default CareersPage;