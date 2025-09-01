import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Building, Calendar, DollarSign, ArrowLeft, Send, CheckCircle, X, Loader } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { api, JobPosition } from '../services/api';
import { emailApi } from '../services/emailApi';

const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [applicationData, setApplicationData] = useState({
    name: '',
    email: '',
    phone: '',
    resume_url: '',
    cover_letter: '',
    portfolio_url: '',
    linkedin_url: ''
  });

  useEffect(() => {
    if (id) {
      loadJobDetails();
    }
  }, [id]);

  const loadJobDetails = async () => {
    try {
      const jobData = await api.jobPositions.getById(id!);
      setJob(jobData);
    } catch (error) {
      console.error('Error loading job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSubmitting(true);
      const applicationResponse = await api.jobApplications.create({
        job_position_id: id,
        ...applicationData
      });
      
      // Send confirmation email
      try {
        await emailApi.transactional.sendJobApplicationConfirmation({
          recipientEmail: applicationData.email,
          recipientName: applicationData.name,
          jobTitle: job?.title || 'Position',
          jobId: id,
          applicationId: applicationResponse.id || 'N/A'
        });
        console.log('Confirmation email sent successfully');
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the application submission if email fails
      }
      
      // Show success message and close form
      setShowApplicationForm(false);
      setShowSuccessMessage(true);
      
      // Reset form
      setApplicationData({
        name: '',
        email: '',
        phone: '',
        resume_url: '',
        cover_letter: '',
        portfolio_url: '',
        linkedin_url: ''
      });

      // Auto-hide success message after 8 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 8000);
    } catch (error) {
      console.error('Error submitting application:', error);
      // Don't close the form on error - let user try again
      alert('Failed to submit application. Please check your information and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-8">The job position you're looking for doesn't exist or has been removed.</p>
          <Link to="/careers" className="text-green-600 hover:text-green-500">
            ← Back to Careers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-green-800">
                    Application Submitted Successfully!
                  </h3>
                  <p className="mt-1 text-sm text-green-700">
                    Thank you for your interest in the <strong>{job?.title}</strong> position. Our recruitment team will review your application and contact you within 3-5 business days.
                  </p>
                  <p className="mt-2 text-xs text-green-600">
                    You can expect to hear from us soon!
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={() => setShowSuccessMessage(false)}
                    className="bg-green-50 rounded-md inline-flex text-green-400 hover:text-green-500 focus:outline-none"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Back Button */}
          <Link 
            to="/careers" 
            className="inline-flex items-center text-green-600 hover:text-green-500 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Careers
          </Link>

          {/* Job Header */}
          <Card className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
                <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    <span>{job.department}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{job.type}</span>
                  </div>
                  {job.salary_range && (
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      <span>{job.salary_range}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="lg:ml-8">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowApplicationForm(true)}
                  icon={<Send />}
                >
                  Apply Now
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Job Description */}
              <Card>
                <h2 className="text-xl font-bold mb-4">Job Description</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed">{job.description}</p>
                </div>
              </Card>

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <Card>
                  <h2 className="text-xl font-bold mb-4">Key Responsibilities</h2>
                  <ul className="space-y-3">
                    {job.responsibilities.map((responsibility, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                        <span className="text-gray-600">{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <Card>
                  <h2 className="text-xl font-bold mb-4">Requirements</h2>
                  <ul className="space-y-3">
                    {job.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                        <span className="text-gray-600">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <Card>
                  <h3 className="text-lg font-bold mb-4">What We Offer</h3>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2"></span>
                        <span className="text-sm text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Company Info */}
              <Card>
                <h3 className="text-lg font-bold mb-4">About Trinexa</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We're a leading AI company focused on creating innovative solutions that transform businesses. 
                  Join our team of passionate professionals working on cutting-edge technology.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Apply for {job.title}</h3>
            </div>
            <form onSubmit={handleApplicationSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={applicationData.name}
                    onChange={(e) => setApplicationData({ ...applicationData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={applicationData.email}
                    onChange={(e) => setApplicationData({ ...applicationData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={applicationData.phone}
                    onChange={(e) => setApplicationData({ ...applicationData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resume URL *</label>
                  <input
                    type="url"
                    value={applicationData.resume_url}
                    onChange={(e) => setApplicationData({ ...applicationData, resume_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter *</label>
                <textarea
                  value={applicationData.cover_letter}
                  onChange={(e) => setApplicationData({ ...applicationData, cover_letter: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
                  <input
                    type="url"
                    value={applicationData.portfolio_url}
                    onChange={(e) => setApplicationData({ ...applicationData, portfolio_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={applicationData.linkedin_url}
                    onChange={(e) => setApplicationData({ ...applicationData, linkedin_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowApplicationForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={submitting ? <Loader className="animate-spin" /> : <Send />}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailsPage;