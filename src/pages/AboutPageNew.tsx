import { Target, Eye, Users, Award } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { DynamicHero, DynamicTextSection } from '../components/common/DynamicSections';
import { useDynamicContent } from '../hooks/useDynamicContent';

const AboutPage = () => {
  const { content, loading, error } = useDynamicContent('about');

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
      {/* Dynamic Hero Section */}
      <DynamicHero content={content.hero || {
        title: 'About NexusAI',
        subtitle: 'We are passionate about creating AI solutions that make a real difference in the world.',
        background_image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg'
      }} />

      {/* Dynamic Mission Section */}
      <DynamicTextSection content={content.mission || {
        title: 'Our Mission',
        content: 'To democratize artificial intelligence and make it accessible to businesses of all sizes, enabling them to harness the power of AI to solve complex problems and drive innovation.',
        alignment: 'center'
      }} />

      {/* Dynamic Vision Section */}
      <section className="py-20 bg-gray-50">
        <DynamicTextSection content={content.vision || {
          title: 'Our Vision',
          content: 'To be the leading provider of AI solutions that transform industries and improve lives worldwide.',
          alignment: 'center'
        }} className="bg-gray-50" />
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card hover className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-gray-600">
                We push the boundaries of what's possible with AI technology.
              </p>
            </Card>

            <Card hover className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Eye className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Transparency</h3>
              <p className="text-gray-600">
                We believe in open, honest communication with our clients and partners.
              </p>
            </Card>

            <Card hover className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Collaboration</h3>
              <p className="text-gray-600">
                We work closely with our clients to understand their unique challenges.
              </p>
            </Card>

            <Card hover className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Excellence</h3>
              <p className="text-gray-600">
                We strive for the highest quality in everything we deliver.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-green-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Work With Us?</h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Let's discuss how our AI solutions can transform your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" href="/book-demo">
              Schedule a Consultation
            </Button>
            <Button variant="outline" size="lg" href="/contact">
              Get in Touch
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
