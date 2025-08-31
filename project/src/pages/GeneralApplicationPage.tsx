import { useState } from 'react';
import { Check, Upload } from 'lucide-react';
import Button from '../components/common/Button';
import { api } from '../services/api';
import { emailApi } from '../services/emailApi';

const GeneralApplicationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resume_url: '',
    cover_letter: '',
    portfolio_url: '',
    linkedin_url: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.resume_url.trim()) newErrors.resume_url = 'Resume URL is required';
    if (!formData.cover_letter.trim()) newErrors.cover_letter = 'Cover letter is required';
    
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
        const applicationResponse = await api.generalApplications.create(formData);
        
        // Send confirmation email
        try {
          await emailApi.transactional.sendGeneralApplicationConfirmation({
            recipientEmail: formData.email,
            recipientName: formData.name,
            applicationId: applicationResponse.id || 'N/A'
          });
          console.log('General application confirmation email sent successfully');
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the application submission if email fails
        }
        
        setSubmitted(true);
      } catch (error) {
        console.error('Error submitting application:', error);
        setErrors({
          submit: 'Failed to submit application. Please try again.'
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
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in joining NexusAI. We'll review your application and get back to you soon.
            </p>
            <Button variant="primary" fullWidth href="/careers">
              Back to Careers
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
                <h1 className="text-3xl font-bold mb-2">General Application</h1>
                <p className="text-gray-600">
                  Don't see a specific role that matches your skills? Submit a general application and we'll keep you in mind for future opportunities.
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

                  {/* Resume URL */}
                  <div>
                    <label htmlFor="resume_url" className="block text-sm font-medium text-gray-700 mb-1">
                      Resume URL *
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        id="resume_url"
                        name="resume_url"
                        value={formData.resume_url}
                        onChange={handleChange}
                        placeholder="https://drive.google.com/..."
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.resume_url ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                    {errors.resume_url && (
                      <p className="mt-1 text-sm text-red-600">{errors.resume_url}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      Please provide a link to your resume (Google Drive, Dropbox, etc.)
                    </p>
                  </div>

                  {/* Portfolio URL */}
                  <div>
                    <label htmlFor="portfolio_url" className="block text-sm font-medium text-gray-700 mb-1">
                      Portfolio URL (Optional)
                    </label>
                    <input
                      type="url"
                      id="portfolio_url"
                      name="portfolio_url"
                      value={formData.portfolio_url}
                      onChange={handleChange}
                      placeholder="https://your-portfolio.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* LinkedIn URL */}
                  <div>
                    <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn Profile (Optional)
                    </label>
                    <input
                      type="url"
                      id="linkedin_url"
                      name="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <label htmlFor="cover_letter" className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Letter *
                  </label>
                  <textarea
                    id="cover_letter"
                    name="cover_letter"
                    rows={6}
                    value={formData.cover_letter}
                    onChange={handleChange}
                    placeholder="Tell us about yourself, your experience, and why you'd like to join NexusAI..."
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.cover_letter ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.cover_letter && (
                    <p className="mt-1 text-sm text-red-600">{errors.cover_letter}</p>
                  )}
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
                    {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              We'll review your application and reach out if there's a potential match with our current or future opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralApplicationPage;