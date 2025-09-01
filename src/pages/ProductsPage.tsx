import { useState, useEffect } from 'react';
import { Brain, BarChart, Shield, Zap, MessageSquare, CheckCircle, ArrowRight, Loader } from 'lucide-react';
import Button from '../components/common/Button';
import { DynamicHero, DynamicFeatures, DynamicStats, DynamicTestimonials } from '../components/common/DynamicSections';
import { useDynamicContent } from '../hooks/useDynamicContent';
import { api, Product } from '../services/api';

// Fallback static data for when API fails or no products exist
const fallbackProducts: Product[] = [
  {
    id: '1',
    name: 'NexusAnalytics',
    description: 'Advanced predictive analytics platform that transforms your data into actionable insights.',
    category: 'Analytics',
    status: 'active',
    features: [
      'Real-time data processing',
      'Customizable dashboards',
      'Anomaly detection',
      'Trend forecasting',
      'Natural language querying'
    ],
    pricing: {
      starter: { price: 99, features: ['Basic analytics', 'Standard support'] },
      professional: { price: 299, features: ['Advanced analytics', 'Priority support', 'Custom dashboards'] },
      enterprise: { price: 'custom', features: ['Full analytics suite', '24/7 support', 'Custom integrations'] }
    },
    technical_specs: {},
    created_at: '',
    updated_at: ''
  },
  {
    id: '2',
    name: 'NexusGuard',
    description: 'AI-powered security solution that identifies and neutralizes threats before they impact your business.',
    category: 'Security',
    status: 'active',
    features: [
      'Threat intelligence',
      'Behavioral analysis',
      'Zero-day vulnerability detection',
      'Automated incident response',
      '24/7 monitoring'
    ],
    pricing: {
      starter: { price: 199, features: ['Basic security monitoring', 'Standard support'] },
      professional: { price: 499, features: ['Advanced threat detection', 'Priority support', 'Custom rules'] },
      enterprise: { price: 'custom', features: ['Full security suite', '24/7 support', 'Dedicated SOC'] }
    },
    technical_specs: {},
    created_at: '',
    updated_at: ''
  },
  {
    id: '3',
    name: 'NexusFlow',
    description: 'Intelligent workflow automation that streamlines your business processes and boosts productivity.',
    category: 'Automation',
    status: 'active',
    features: [
      'Visual workflow builder',
      'AI-powered optimization',
      'Integration with major platforms',
      'Error detection and recovery',
      'Performance analytics'
    ],
    pricing: {
      starter: { price: 149, features: ['Basic automation', 'Standard support'] },
      professional: { price: 399, features: ['Advanced workflows', 'Priority support', 'Custom integrations'] },
      enterprise: { price: 'custom', features: ['Full automation suite', '24/7 support', 'Dedicated CSM'] }
    },
    technical_specs: {},
    created_at: '',
    updated_at: ''
  },
  {
    id: '4',
    name: 'NexusAssist',
    description: 'Conversational AI assistant that enhances customer support and internal operations.',
    category: 'AI Assistant',
    status: 'active',
    features: [
      'Natural language processing',
      'Multi-channel deployment',
      'Knowledge base integration',
      'Sentiment analysis',
      'Conversation analytics'
    ],
    pricing: {
      starter: { price: 79, features: ['Basic chatbot', 'Standard support'] },
      professional: { price: 199, features: ['Advanced NLP', 'Priority support', 'Custom training'] },
      enterprise: { price: 'custom', features: ['Full AI suite', '24/7 support', 'Custom models'] }
    },
    technical_specs: {},
    created_at: '',
    updated_at: ''
  }
];

const getProductIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'analytics':
      return <BarChart className="h-12 w-12 text-green-500" />;
    case 'security':
      return <Shield className="h-12 w-12 text-green-500" />;
    case 'automation':
      return <Zap className="h-12 w-12 text-green-500" />;
    case 'ai assistant':
      return <MessageSquare className="h-12 w-12 text-green-500" />;
    default:
      return <Brain className="h-12 w-12 text-green-500" />;
  }
};

const getProductImage = (category: string) => {
  switch (category.toLowerCase()) {
    case 'analytics':
      return 'https://images.pexels.com/photos/95916/pexels-photo-95916.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
    case 'security':
      return 'https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
    case 'automation':
      return 'https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
    case 'ai assistant':
      return 'https://images.pexels.com/photos/4457322/pexels-photo-4457322.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
    default:
      return 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
  }
};

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { content, loading: contentLoading, error: contentError, refreshContent } = useDynamicContent('products');

  // Enhanced debug logging
  console.log('🔍 Products page content:', content);
  console.log('🔍 Content loading:', contentLoading);
  console.log('🔍 Content error:', contentError);
  console.log('🔍 Case studies section:', content?.['case-studies']);
  console.log('🔍 Product features section:', content?.['product-features']);
  console.log('🔍 Available sections:', Object.keys(content || {}));
  console.log('🔍 Using page management products:', content?.['product-features']?.products?.length > 0);
  console.log('🔍 Page management products:', content?.['product-features']?.products);
  console.log('🔍 Products from API:', products);

  useEffect(() => {
    loadProducts();
    // Test direct API call
    testPageContentAPI();
  }, []);

  const testPageContentAPI = async () => {
    try {
      console.log('🧪 Testing direct API call...');
      const pageContent = await api.admin.pageContent.get('products');
      console.log('🧪 Direct API result:', pageContent);
      
      // Also test direct Supabase query  
      const { supabase } = await import('../lib/supabase');
      const { data: directData, error: directError } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_id', 'products');
      
      console.log('🧪 Direct Supabase query result:', directData);
      console.log('🧪 Direct Supabase query error:', directError);
    } catch (error) {
      console.error('🧪 Direct API error:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.products.getAll();
      // Filter only active products for public display
      const activeProducts = data.filter(product => product.status === 'active');
      setProducts(activeProducts);
    } catch (err) {
      console.error('Error loading products:', err);
      // Use fallback products when API fails
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  };

  // Get products from dynamic content (page management) or fallback
  const displayProducts = content?.['product-features']?.products?.length > 0 
    ? content['product-features'].products 
    : (products.length > 0 ? products : fallbackProducts);

  console.log('🎯 Final displayProducts:', displayProducts);
  console.log('🎯 Display products source:', 
    content?.['product-features']?.products?.length > 0 ? 'PAGE_MANAGEMENT' :
    products.length > 0 ? 'API_PRODUCTS' : 'FALLBACK'
  );

  // Type-safe product access since we might have different product structures
  const getProductName = (product: any) => product.name || product.title;
  const getProductDescription = (product: any) => product.description;
  const getProductFeatures = (product: any) => product.features || [];
  const getProductImageUrl = (product: any) => product.image || product.image_url;
  const getProductId = (product: any) => product.id || product.name;

  if (loading || contentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">
            Loading {loading ? 'products' : ''}
            {loading && contentLoading ? ' and ' : ''}
            {contentLoading ? 'page content' : ''}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Dynamic Hero Section (if configured) */}
      {content?.hero ? (
        <DynamicHero content={content.hero} />
      ) : (
        <section className="pt-28 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">AI Products</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Cutting-edge AI solutions designed to solve your most complex business challenges.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Features Section (if configured) */}
      {content?.features && (
        <DynamicFeatures content={content.features} />
      )}

      {/* Products Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Transformative AI Solutions</h2>
            <p className="text-gray-600">
              Our suite of AI products is designed to address specific business needs while being flexible enough to adapt to your unique challenges.
            </p>
            
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-gray-100 rounded text-sm text-left">
                <p><strong>Debug Info:</strong></p>
                <p>Content Loading: {contentLoading ? 'Yes' : 'No'}</p>
                <p>Content Error: {contentError || 'None'}</p>
                <p>Product Features Available: {content?.['product-features']?.products?.length || 0}</p>
                <p>Using: {
                  content?.['product-features']?.products?.length > 0 ? 'PAGE_MANAGEMENT' :
                  products.length > 0 ? 'API_PRODUCTS' : 'FALLBACK'
                }</p>
                <button 
                  onClick={refreshContent}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs"
                >
                  Refresh Content
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-16">
            {displayProducts.map((product: any, index: number) => (
              <div 
                key={getProductId(product)} 
                className={`flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}
              >
                <div className="lg:w-1/2">
                  <img 
                    src={getProductImageUrl(product) || getProductImage(product.category)} 
                    alt={getProductName(product)} 
                    className="rounded-lg shadow-xl w-full object-cover h-96"
                  />
                </div>
                <div className="lg:w-1/2">
                  <div className="flex items-center mb-4">
                    {getProductIcon(product.category)}
                    <h3 className="text-3xl font-bold ml-4">{getProductName(product)}</h3>
                  </div>
                  <p className="text-gray-600 text-lg mb-6">
                    {getProductDescription(product)}
                  </p>
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold mb-4">Key Features:</h4>
                    <ul className="space-y-2">
                      {getProductFeatures(product).map((feature: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex space-x-4">
                    <Button size="lg" href={product.buttonUrl || `/products/${getProductId(product)}`}>
                      {product.buttonText || 'Learn More'}
                    </Button>
                    <Button variant="outline" size="lg" href={`/book-demo?product=${getProductName(product)}`}>
                      Request Demo
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Stats Section (if configured) */}
      {content?.stats && (
        <DynamicStats content={content.stats} />
      )}

      {/* Success Stories / Case Studies Section */}
      {(content?.['case-studies'] || content?.testimonials) && (
        <DynamicTestimonials content={content['case-studies'] || content.testimonials} />
      )}

      {/* Frequently Asked Questions Section */}
      {content?.faq && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {content.faq.title || 'Frequently Asked Questions'}
              </h2>
              {content.faq.subtitle && (
                <p className="text-lg text-gray-600">{content.faq.subtitle}</p>
              )}
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {(content.faq.items || content.faq.questions || []).map((item: any, index: number) => (
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
      )}

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Business?</h2>
            <p className="text-xl mb-8 text-green-100">
              Join thousands of companies already using our AI solutions to drive growth and innovation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="outline" 
                href="/book-demo"
                className="bg-white text-green-600 hover:bg-gray-100 border-white"
              >
                Book a Demo
              </Button>
              <Button 
                size="lg" 
                href="/register"
                className="bg-green-700 hover:bg-green-800 text-white"
                icon={<ArrowRight className="h-5 w-5" />}
              >
                Get Started Today
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductsPage;