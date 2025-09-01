import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader, BarChart3, Eye, DollarSign, Users, TrendingUp } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { api, Product, ProductAnalytics } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [analytics, setAnalytics] = useState<ProductAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'details'>('list');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    status: 'active' as 'active' | 'inactive' | 'development',
    features: [''],
    pricing: {
      starter: { price: 0, features: [''] },
      professional: { price: 0, features: [''] },
      enterprise: { price: 'custom', features: [''] }
    },
    technical_specs: {
      deployment: '',
      api_rate_limit: '',
      uptime_sla: '',
      security: ''
    },
    documentation_url: '',
    demo_url: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.products.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductAnalytics = async (productId: string) => {
    try {
      const data = await api.products.getAnalytics(productId);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        features: formData.features.filter(f => f.trim() !== ''),
        pricing: formData.pricing,
        technical_specs: formData.technical_specs
      };

      if (editingProduct) {
        await api.products.update(editingProduct.id, productData);
      } else {
        await api.products.create(productData);
      }
      
      loadProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      status: product.status,
      features: product.features.length > 0 ? product.features : [''],
      pricing: (product.pricing as any) || {
        starter: { price: 0, features: [''] },
        professional: { price: 0, features: [''] },
        enterprise: { price: 'custom', features: [''] }
      },
      technical_specs: (product.technical_specs as any) || {
        deployment: '',
        api_rate_limit: '',
        uptime_sla: '',
        security: ''
      },
      documentation_url: product.documentation_url || '',
      demo_url: product.demo_url || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.products.delete(id);
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleViewDetails = async (product: Product) => {
    setSelectedProduct(product);
    setActiveView('details');
    await loadProductAnalytics(product.id);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      status: 'active' as 'active' | 'inactive' | 'development',
      features: [''],
      pricing: {
        starter: { price: 0, features: [''] },
        professional: { price: 0, features: [''] },
        enterprise: { price: 'custom', features: [''] }
      },
      technical_specs: {
        deployment: '',
        api_rate_limit: '',
        uptime_sla: '',
        security: ''
      },
      documentation_url: '',
      demo_url: ''
    });
    setShowForm(false);
  };

  // Analytics data processing
  const getAnalyticsData = () => {
    const groupedData = analytics.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = { date };
      }
      acc[date][item.metric_name] = item.metric_value;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedData).slice(-30); // Last 30 days
  };

  const getMetricSummary = () => {
    const latest = analytics.reduce((acc, item) => {
      if (!acc[item.metric_name] || new Date(item.date) > new Date(acc[item.metric_name].date)) {
        acc[item.metric_name] = item;
      }
      return acc;
    }, {} as Record<string, ProductAnalytics>);

    return [
      { name: 'Active Users', value: latest.active_users?.metric_value || 0, icon: Users, color: '#10B981' },
      { name: 'API Calls', value: latest.api_calls?.metric_value || 0, icon: BarChart3, color: '#3B82F6' },
      { name: 'Revenue', value: latest.revenue?.metric_value || 0, icon: DollarSign, color: '#6366F1' },
      { name: 'Satisfaction', value: latest.customer_satisfaction?.metric_value || 0, icon: TrendingUp, color: '#8B5CF6' }
    ];
  };

  if (activeView === 'details' && selectedProduct) {
    const analyticsData = getAnalyticsData();
    const metricSummary = getMetricSummary();

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setActiveView('list');
                setSelectedProduct(null);
              }}
            >
              ← Back to Products
            </Button>
            <h1 className="text-2xl font-bold">{selectedProduct.name}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedProduct.status === 'active' ? 'bg-green-100 text-green-800' :
              selectedProduct.status === 'development' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {selectedProduct.status}
            </span>
          </div>
          <Button
            variant="primary"
            onClick={() => handleEdit(selectedProduct)}
            icon={<Edit />}
          >
            Edit Product
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {metricSummary.map((metric) => (
            <Card key={metric.name}>
              <div className="flex items-center">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${metric.color}20` }}>
                  <metric.icon className="h-6 w-6" style={{ color: metric.color }} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.name === 'Revenue' ? `$${metric.value.toLocaleString()}` :
                     metric.name === 'Satisfaction' ? `${metric.value}%` :
                     metric.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Usage Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="active_users" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="api_calls" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4">Revenue & Satisfaction</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} />
                  <Line type="monotone" dataKey="customer_satisfaction" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Product Details</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Description</h4>
                <p className="text-gray-600">{selectedProduct.description}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Category</h4>
                <p className="text-gray-600">{selectedProduct.category}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Features</h4>
                <ul className="list-disc list-inside text-gray-600">
                  {selectedProduct.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="flex space-x-4">
                {selectedProduct.documentation_url && (
                  <a
                    href={selectedProduct.documentation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700"
                  >
                    Documentation
                  </a>
                )}
                {selectedProduct.demo_url && (
                  <a
                    href={selectedProduct.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700"
                  >
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4">Pricing Tiers</h3>
            <div className="space-y-4">
              {Object.entries(selectedProduct.pricing).map(([tier, details]: [string, any]) => (
                <div key={tier} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium capitalize">{tier}</h4>
                    <span className="text-lg font-bold">
                      {typeof details.price === 'number' ? `$${details.price}` : details.price}
                    </span>
                  </div>
                  <ul className="text-sm text-gray-600">
                    {details.features?.map((feature: string, index: number) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Button
          variant="primary"
          onClick={() => setShowForm(true)}
          icon={<Plus />}
        >
          Add New Product
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingProduct ? 'Edit Product' : 'Create New Product'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="development">Development</option>
                </select>
              </div>

              <div>
                <label htmlFor="documentation_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Documentation URL
                </label>
                <input
                  type="url"
                  id="documentation_url"
                  name="documentation_url"
                  value={formData.documentation_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features *
              </label>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter feature..."
                    required
                  />
                  {formData.features.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeFeature(index)}
                      icon={<Trash2 />}
                    />
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addFeature}
                icon={<Plus />}
              >
                Add Feature
              </Button>
            </div>

            <div className="flex gap-4">
              <Button type="submit" variant="primary">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader className="animate-spin h-8 w-8 text-green-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.status === 'active' ? 'bg-green-100 text-green-800' :
                    product.status === 'development' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                  <ul className="text-sm text-gray-600">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                    {product.features.length > 3 && (
                      <li className="text-gray-500">+ {product.features.length - 3} more</li>
                    )}
                  </ul>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    variant="text"
                    onClick={() => handleViewDetails(product)}
                    icon={<Eye className="h-4 w-4" />}
                    className="text-green-600 hover:text-green-700"
                  >
                    View Details
                  </Button>
                  <div className="flex space-x-2">
                    <Button
                      variant="text"
                      onClick={() => handleEdit(product)}
                      icon={<Edit className="h-4 w-4" />}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => handleDelete(product.id)}
                      icon={<Trash2 className="h-4 w-4" />}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No products found
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProductManagement;