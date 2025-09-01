import { ArrowRight, BarChart, Users, Settings } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { DynamicHero, DynamicFeatures, DynamicStats, DynamicTestimonials, DynamicCTA } from '../components/common/DynamicSections';
import { useDynamicContent } from '../hooks/useDynamicContent';

const HomePageNew = () => {
  const { content, loading, error } = useDynamicContent('home');

  console.log('🏠 HomePageNew.tsx is being rendered - NOW WITH TESTIMONIALS!');
  console.log('🏠 HomePage content loaded:', content);
  console.log('🏠 Testimonials section:', content?.testimonials);

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
    console.warn('Using fallback content due to error:', error);
  }

  return (
    <>
      {/* DEBUG: Visual indicator that this file now has testimonials */}
      <div style={{ position: 'fixed', top: '10px', right: '10px', backgroundColor: 'green', color: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', zIndex: 9999 }}>
        ✅ HomePageNew.tsx (Now Fixed with Testimonials)
      </div>
      
      {/* Dynamic Hero Section */}
      <DynamicHero content={content.hero || {}} />

      {/* Dynamic Features Section */}
      <DynamicFeatures content={content.features || {}} />

      {/* Dynamic Stats Section */}
      <DynamicStats content={content.stats || {}} />

      {/* Testimonials Section - Section ID: testimonials */}
      {content.testimonials && <DynamicTestimonials content={content.testimonials} />}

      {/* Products Preview Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our AI Solutions</h2>
            <p className="text-lg text-gray-600">
              Discover our comprehensive suite of AI-powered products designed to transform your business operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* CRM Solution */}
            <Card hover className="group">
              <div className="p-2 bg-green-50 rounded-lg w-fit mb-4 group-hover:bg-green-100 transition-colors">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered CRM</h3>
              <p className="text-gray-600 mb-4">
                Streamline customer relationships with intelligent insights, automated workflows, and predictive analytics.
              </p>
              <Button variant="text" href="/products">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>

            {/* Business Intelligence */}
            <Card hover className="group">
              <div className="p-2 bg-green-50 rounded-lg w-fit mb-4 group-hover:bg-green-100 transition-colors">
                <BarChart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Business Intelligence</h3>
              <p className="text-gray-600 mb-4">
                Transform raw data into actionable insights with advanced analytics and real-time reporting.
              </p>
              <Button variant="text" href="/products">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>

            {/* Process Automation */}
            <Card hover className="group">
              <div className="p-2 bg-green-50 rounded-lg w-fit mb-4 group-hover:bg-green-100 transition-colors">
                <Settings className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Process Automation</h3>
              <p className="text-gray-600 mb-4">
                Automate repetitive tasks and optimize workflows with intelligent process automation solutions.
              </p>
              <Button variant="text" href="/products">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" href="/products">
              View All Solutions
            </Button>
          </div>
        </div>
      </section>

      {/* Dynamic Call to Action Section - Section ID: cta */}
      {content.cta && <DynamicCTA content={content.cta} />}

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of companies that have revolutionized their operations with our AI solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" href="/book-demo">
              Schedule a Demo
            </Button>
            <Button variant="outline" size="lg" href="/contact">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePageNew;
