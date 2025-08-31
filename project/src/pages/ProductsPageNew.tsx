import { useState, useEffect } from 'react';
import { Brain, BarChart, Shield, Zap, MessageSquare, CheckCircle, ArrowRight, Loader, Star, Check, Info, HelpCircle, Settings, Users, Globe, Lock } from 'lucide-react';
import Button from '../components/common/Button';
import { api, Product } from '../services/api';
import { useDynamicContent } from '../hooks/useDynamicContent';
import { DynamicHero, DynamicTestimonials } from '../components/common/DynamicSections';

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

const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    'star': Star,
    'check': Check,
    'checkcircle': CheckCircle,
    'info': Info,
    'help': HelpCircle,
    'question': HelpCircle,
    'settings': Settings,
    'users': Users,
    'globe': Globe,
    'world': Globe,
    'lock': Lock,
    'security': Shield,
    'shield': Shield,
    'analytics': BarChart,
    'chart': BarChart,
    'message': MessageSquare,
    'chat': MessageSquare,
    'brain': Brain,
    'ai': Brain,
    'zap': Zap,
    'lightning': Zap,
    'arrow': ArrowRight,
    'loader': Loader
  };

  const IconComponent = iconMap[iconName?.toLowerCase()] || HelpCircle;
  return <IconComponent className="h-6 w-6" />;
};

// Using function declaration instead of const assignment for better compatibility
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { content, loading: contentLoading } = useDynamicContent('products');

  // Debug logging for admin content
  console.log('🔍 Products page content:', content);
  console.log('🔍 Hero section:', content?.hero);
  console.log('🔍 Product features section:', content?.['product-features']);
  console.log('🔍 Case studies section:', content?.['case-studies']);
  console.log('🔍 FAQ section:', content?.faq);
  console.log('🔍 FAQ features:', content?.faq?.features);
  console.log('🔍 FAQ title:', content?.faq?.title);
  console.log('🔍 FAQ subtitle:', content?.faq?.subtitle);
  console.log('🔍 Available sections:', Object.keys(content || {}));
  console.log('🔍 Using page management products:', content?.['product-features']?.products?.length > 0);
  console.log('🔍 Page management products:', content?.['product-features']?.products);

  useEffect(() => {
    loadProducts();
    // Test direct API call to check for product-features data
    testPageContentAPI();
  }, []);

  const testPageContentAPI = async () => {
    try {
      console.log('🧪 Testing direct API call for product-features...');
      const pageContent = await api.admin.pageContent.get('products');
      console.log('🧪 Direct API result:', pageContent);
      
      // Check specifically for product-features section
      const productFeaturesSection = pageContent.find((item: any) => item.section_id === 'product-features');
      console.log('🧪 Product features section found:', productFeaturesSection);
      
      if (productFeaturesSection) {
        const parsedContent = typeof productFeaturesSection.content === 'string' 
          ? JSON.parse(productFeaturesSection.content) 
          : productFeaturesSection.content;
        console.log('🧪 Parsed product features content:', parsedContent);
        console.log('🧪 Products in content:', parsedContent?.products);
      }
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

  const displayProducts = content?.['product-features']?.products?.length > 0 
    ? content['product-features'].products 
    : (products.length > 0 ? products : fallbackProducts);

  // Debug info about product source
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
  const getProductCategory = (product: any) => product.category || 'default';

  if (loading || contentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Dynamic Hero Section */}
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

      {/* Products Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">
              {content?.['product-features']?.title || content?.overview?.title || 'Transformative AI Solutions'}
            </h2>
            <p className="text-gray-600">
              {content?.['product-features']?.subtitle || content?.overview?.content || content?.overview?.subtitle || 'Our suite of AI products is designed to address specific business needs while being flexible enough to adapt to your unique challenges.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-16">
            {displayProducts.map((product: any, index: number) => (
              <div 
                key={getProductId(product)} 
                className={`flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}
              >
                <div className="lg:w-1/2">
                  <img 
                    src={getProductImageUrl(product) || getProductImage(getProductCategory(product))} 
                    alt={getProductName(product)} 
                    className="rounded-lg shadow-xl w-full object-cover h-96"
                  />
                </div>
                <div className="lg:w-1/2">
                  <div className="flex items-center mb-4">
                    {getProductIcon(getProductCategory(product))}
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

      {/* Dynamic Case Studies Section */}
      {content?.['case-studies'] && (
        <DynamicTestimonials content={content['case-studies']} />
      )}

      {/* Dynamic FAQ Section */}
      {content?.faq && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {content.faq.title || 'Frequently Asked Questions'}
              </h2>
              {(content.faq.subtitle || content.faq.description) && (
                <p className="text-lg text-gray-600">
                  {content.faq.subtitle || content.faq.description}
                </p>
              )}
            </div>
            <div className="max-w-4xl mx-auto">
              {(() => {
                const faqItems = content.faq.features || content.faq.items || content.faq.questions || [];
                const itemCount = faqItems.length;
                
                // For 1 item: center it
                if (itemCount === 1) {
                  return (
                    <div className="flex justify-center">
                      <div className="w-full max-w-2xl">
                        {faqItems.map((item: any, index: number) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200 border border-gray-200">
                            {/* Display icon if available */}
                            {item.icon && (
                              <div className="mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                  <div className="text-green-600">
                                    {getIconComponent(item.icon)}
                                  </div>
                                </div>
                              </div>
                            )}
                            <h3 className="text-lg font-semibold mb-3 text-gray-900">
                              {item.title || item.question || item.name}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                              {item.description || item.answer || item.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                
                // For 3 items: use a responsive grid that stacks nicely
                if (itemCount === 3) {
                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
                      {faqItems.map((item: any, index: number) => (
                        <div key={index} className={`bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200 border border-gray-200 ${index === 2 && itemCount === 3 ? 'md:col-span-2 lg:col-span-1 md:mx-auto md:max-w-md lg:max-w-none' : ''}`}>
                          {/* Display icon if available */}
                          {item.icon && (
                            <div className="mb-4">
                              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <div className="text-green-600">
                                  {getIconComponent(item.icon)}
                                </div>
                              </div>
                            </div>
                          )}
                          <h3 className="text-lg font-semibold mb-3 text-gray-900">
                            {item.title || item.question || item.name}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {item.description || item.answer || item.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                }
                
                // For 5 items: use a mixed layout (2+2+1 centered)
                if (itemCount === 5) {
                  return (
                    <div className="space-y-6">
                      {/* First 4 items in 2x2 grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {faqItems.slice(0, 4).map((item: any, index: number) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200 border border-gray-200">
                            {/* Display icon if available */}
                            {item.icon && (
                              <div className="mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                  <div className="text-green-600">
                                    {getIconComponent(item.icon)}
                                  </div>
                                </div>
                              </div>
                            )}
                            <h3 className="text-lg font-semibold mb-3 text-gray-900">
                              {item.title || item.question || item.name}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                              {item.description || item.answer || item.content}
                            </p>
                          </div>
                        ))}
                      </div>
                      {/* Last item centered */}
                      <div className="flex justify-center">
                        <div className="w-full max-w-2xl">
                          {faqItems.slice(4).map((item: any, index: number) => (
                            <div key={index + 4} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200 border border-gray-200">
                              {/* Display icon if available */}
                              {item.icon && (
                                <div className="mb-4">
                                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <div className="text-green-600">
                                      {getIconComponent(item.icon)}
                                    </div>
                                  </div>
                                </div>
                              )}
                              <h3 className="text-lg font-semibold mb-3 text-gray-900">
                                {item.title || item.question || item.name}
                              </h3>
                              <p className="text-gray-600 leading-relaxed">
                                {item.description || item.answer || item.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                
                // For any other odd number (7, 9, 11, etc.): use adaptive grid with last item centered if odd
                if (itemCount % 2 === 1 && itemCount > 5) {
                  return (
                    <div className="space-y-6">
                      {/* All items except last in 2-column grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {faqItems.slice(0, -1).map((item: any, index: number) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200 border border-gray-200">
                            {/* Display icon if available */}
                            {item.icon && (
                              <div className="mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                  <div className="text-green-600">
                                    {getIconComponent(item.icon)}
                                  </div>
                                </div>
                              </div>
                            )}
                            <h3 className="text-lg font-semibold mb-3 text-gray-900">
                              {item.title || item.question || item.name}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                              {item.description || item.answer || item.content}
                            </p>
                          </div>
                        ))}
                      </div>
                      {/* Last item centered */}
                      <div className="flex justify-center">
                        <div className="w-full max-w-2xl">
                          <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200 border border-gray-200">
                            {/* Display icon if available */}
                            {faqItems[itemCount - 1].icon && (
                              <div className="mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                  <div className="text-green-600">
                                    {getIconComponent(faqItems[itemCount - 1].icon)}
                                  </div>
                                </div>
                              </div>
                            )}
                            <h3 className="text-lg font-semibold mb-3 text-gray-900">
                              {faqItems[itemCount - 1].title || faqItems[itemCount - 1].question || faqItems[itemCount - 1].name}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                              {faqItems[itemCount - 1].description || faqItems[itemCount - 1].answer || faqItems[itemCount - 1].content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                // Default: regular 2-column grid for even numbers
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {faqItems.map((item: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200 border border-gray-200">
                        {/* Display icon if available */}
                        {item.icon && (
                          <div className="mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                              <div className="text-green-600">
                                {getIconComponent(item.icon)}
                              </div>
                            </div>
                          </div>
                        )}
                        <h3 className="text-lg font-semibold mb-3 text-gray-900">
                          {item.title || item.question || item.name}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {item.description || item.answer || item.content}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })()}
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
}
