import { useState, useEffect } from 'react';
import { api, PageContent, PageSection } from '../services/api';

interface DynamicContentHook {
  content: Record<string, any>;
  sections: PageSection[];
  loading: boolean;
  error: string | null;
  refreshContent: () => void;
}

export const useDynamicContent = (pageId: string): DynamicContentHook => {
  const [content, setContent] = useState<Record<string, any>>({});
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Loading content for page: ${pageId}`);
      
      // Get page content directly (this is the original approach that was working)
      const pageContent = await api.admin.pageContent.get(pageId);
      console.log(`📄 Raw page content:`, pageContent);
      
      // Convert to the flat structure that the original pages expect
      const contentMap: Record<string, any> = {};
      
      pageContent.forEach((item: PageContent) => {
        try {
          // Parse JSON content if it's a string
          const parsedContent = typeof item.content === 'string' 
            ? JSON.parse(item.content) 
            : item.content;
          
          contentMap[item.section_id] = parsedContent;
          console.log(`✅ Loaded section: ${item.section_id}`, parsedContent);
        } catch (parseError) {
          console.warn(`⚠️ Failed to parse content for section ${item.section_id}:`, parseError);
          contentMap[item.section_id] = item.content;
        }
      });
      
      console.log(`📊 Final content map:`, contentMap);
      setContent(contentMap);
      
      // Also try to get page sections for the new DynamicPage architecture (optional)
      try {
        const pageSections = await api.admin.pageSections.getByPage(pageId);
        setSections(pageSections);
      } catch (sectionError) {
        console.warn(`⚠️ Could not load page sections:`, sectionError);
        setSections([]);
      }
      
    } catch (err) {
      console.error(`❌ Error loading content for page ${pageId}:`, err);
      setError('Failed to load page content');
      // Set default content if API fails
      const defaultContent = getDefaultContent(pageId);
      console.log(`🔄 Using fallback content:`, defaultContent);
      setContent(defaultContent);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [pageId]);

  const refreshContent = () => {
    loadContent();
  };

  return { content, sections, loading, error, refreshContent };
};

// Default content fallback for each page
const getDefaultContent = (pageId: string): Record<string, any> => {
  const defaults: Record<string, Record<string, any>> = {
    home: {
      hero: {
        title: 'AI-Powered Solutions for the Future',
        subtitle: 'We create cutting-edge AI solutions that transform businesses and drive innovation. Our intelligent systems help you achieve more with less.',
        cta_primary: 'Explore Solutions',
        cta_secondary: 'Book a Demo',
        background_image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      features: {
        title: 'Transformative AI Solutions',
        subtitle: 'Our cutting-edge AI technologies help businesses automate processes, gain valuable insights, and drive innovation.',
        features: [
          {
            title: 'Cognitive Intelligence',
            description: 'Our AI systems learn and adapt to your business needs, providing intelligent insights and automating complex tasks.',
            icon: 'Brain'
          },
          {
            title: 'Predictive Analytics',
            description: 'Harness the power of data with our advanced analytics to predict trends and make informed decisions.',
            icon: 'BarChart'
          },
          {
            title: 'Secure Infrastructure',
            description: 'Enterprise-grade security ensures your data is protected while our AI solutions work seamlessly.',
            icon: 'Shield'
          }
        ]
      },
      stats: {
        title: 'Trusted by Industry Leaders',
        stats: [
          { label: 'Happy Clients', value: '500+' },
          { label: 'Projects Completed', value: '1000+' },
          { label: 'AI Models Deployed', value: '50+' },
          { label: 'Years of Experience', value: '10+' }
        ]
      }
    },
    about: {
      hero: {
        title: 'About NexusAI',
        subtitle: 'We are passionate about creating AI solutions that make a real difference in the world.',
        background_image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg'
      },
      mission: {
        title: 'Our Mission',
        content: 'To democratize artificial intelligence and make it accessible to businesses of all sizes, enabling them to harness the power of AI to solve complex problems and drive innovation.'
      },
      vision: {
        title: 'Our Vision',
        content: 'To be the leading provider of AI solutions that transform industries and improve lives worldwide.'
      }
    },
    products: {
      hero: {
        title: 'Our AI Solutions',
        subtitle: 'Discover our comprehensive suite of AI-powered products designed to transform your business.',
        background_image: 'https://images.pexels.com/photos/8386422/pexels-photo-8386422.jpeg'
      },
      features: {
        title: 'Product Features',
        subtitle: 'Comprehensive AI capabilities designed for modern businesses',
        features: [
          {
            title: 'Advanced AI Models',
            description: 'State-of-the-art machine learning models trained on vast datasets for superior performance.',
            icon: 'Brain'
          },
          {
            title: 'Real-time Analytics',
            description: 'Get instant insights from your data with our powerful real-time analytics engine.',
            icon: 'BarChart'
          },
          {
            title: 'Enterprise Security',
            description: 'Bank-level security protocols ensure your sensitive data remains protected.',
            icon: 'Shield'
          }
        ]
      },
      stats: {
        title: 'Product Performance',
        stats: [
          { label: 'Active Deployments', value: '2000+' },
          { label: 'Data Points Processed', value: '10M+' },
          { label: 'Accuracy Rate', value: '99.8%' },
          { label: 'Uptime', value: '99.9%' }
        ]
      },
      'case-studies': {
        title: 'Case Studies',
        subtitle: 'See how our AI solutions have transformed businesses across industries',
        testimonials: [] // No fallback testimonials - only show admin-configured ones
      },
      faq: {
        title: 'Frequently Asked Questions',
        subtitle: 'Get answers to common questions about our AI products',
        items: [
          {
            question: 'How long does implementation typically take?',
            answer: 'Most implementations are completed within 2-4 weeks, depending on the complexity and scope of your requirements. Our team works closely with you to ensure a smooth integration process.'
          },
          {
            question: 'Do you provide training and support?',
            answer: 'Yes, we provide comprehensive training for your team and 24/7 technical support. Our customer success team ensures you get maximum value from our AI solutions.'
          },
          {
            question: 'Can your solutions integrate with existing systems?',
            answer: 'Absolutely. Our AI products are designed with flexibility in mind and can integrate with most existing business systems through APIs and custom connectors.'
          },
          {
            question: 'What security measures are in place?',
            answer: 'We implement enterprise-grade security including encryption at rest and in transit, role-based access controls, and compliance with industry standards like SOC 2 and GDPR.'
          },
          {
            question: 'Do you offer custom AI model development?',
            answer: 'Yes, we can develop custom AI models tailored to your specific business needs. Our team of data scientists and ML engineers work with you to create solutions that address your unique challenges.'
          }
        ]
      }
    },
    careers: {
      hero: {
        title: 'Join Our Team',
        subtitle: 'Be part of the AI revolution and help us build the future of intelligent technology.',
        background_image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg'
      }
    }
  };

  return defaults[pageId] || {};
};
