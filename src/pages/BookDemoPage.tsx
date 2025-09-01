import { useState } from 'react';
import { Check } from 'lucide-react';
import Button from '../components/common/Button';
import { api } from '../services/api';

const BookDemoPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    product_interest: '',
    message: '',
    preferred_date: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.product_interest) newErrors.product_interest = 'Please select a product';
    if (!formData.preferred_date) newErrors.preferred_date = 'Please select a preferred date';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await api.demoBookings.create(formData);
        setSubmitted(true);
      } catch (error) {
        console.error('Error booking demo:', error);
        setErrors({
          submit: 'Failed to book demo. Please try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Demo Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in NexusAI. We'll be in touch shortly to confirm your demo session.
            </p>
            <Button variant="primary" fullWidth href="/">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Book a Demo</h1>
                <p className="text-gray-600">
                  Experience the power of our AI solutions firsthand
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Company */}
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.company ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.company && (
                      <p className="mt-1 text-sm text-red-600">{errors.company}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  {/* Product Interest */}
                  <div>
                    <label htmlFor="product_interest" className="block text-sm font-medium text-gray-700 mb-1">
                      Product of Interest *
                    </label>
                    <select
                      id="product_interest"
                      name="product_interest"
                      value={formData.product_interest}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.product_interest ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a product</option>
                      <option value="NexusAnalytics">NexusAnalytics</option>
                      <option value="NexusGuard">NexusGuard</option>
                      <option value="NexusFlow">NexusFlow</option>
                      <option value="NexusAssist">NexusAssist</option>
                    </select>
                    {errors.product_interest && (
                      <p className="mt-1 text-sm text-red-600">{errors.product_interest}</p>
                    )}
                  </div>

                  {/* Preferred Date */}
                  <div>
                    <label htmlFor="preferred_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Demo Date *
                    </label>
                    <input
                      type="date"
                      id="preferred_date"
                      name="preferred_date"
                      value={formData.preferred_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.preferred_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.preferred_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.preferred_date}</p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Information
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Tell us about your specific needs or questions..."
                  />
                </div>

                {errors.submit && (
                  <div className="text-red-600 text-center">{errors.submit}</div>
                )}

                <div>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    fullWidth 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Booking Demo...' : 'Book Demo'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              Our team will review your request and get back to you within 24 hours to confirm your demo session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDemoPage;