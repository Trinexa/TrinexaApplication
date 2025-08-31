import { Link } from 'react-router-dom';
import { Brain, Mail, MapPin, Phone, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import Chatbot from './Chatbot';

const Footer = () => {
  const { getSetting, settings, loading } = useSystemSettings();
  const logoUrl = getSetting('logo_url');
  
  // Debug logging
  console.log('🦶 Footer: Loading state:', loading);
  console.log('🦶 Footer: All settings:', settings);
  console.log('🦶 Footer: Contact email:', getSetting('contact_email'));
  console.log('🦶 Footer: Contact phone:', getSetting('contact_phone'));
  console.log('🦶 Footer: Contact address:', getSetting('contact_address'));

  return (
    <>
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center mb-4">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt="Company Logo" 
                    className="h-7 w-auto object-contain mr-2"
                  />
                ) : (
                  <>
                    <Brain size={28} className="text-green-400 mr-2" />
                    <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                      Trinexa
                    </span>
                  </>
                )}
              </div>
              <p className="text-gray-400 mb-4">
                {getSetting('company_tagline', 'Pioneering AI-powered solutions to transform businesses and enhance human potential.')}
              </p>
              <div className="flex space-x-4">
                {getSetting('social_twitter') && (
                  <a 
                    href={getSetting('social_twitter')} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <Twitter size={20} />
                  </a>
                )}
                {getSetting('social_facebook') && (
                  <a 
                    href={getSetting('social_facebook')} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <Facebook size={20} />
                  </a>
                )}
                {getSetting('social_instagram') && (
                  <a 
                    href={getSetting('social_instagram')} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <Instagram size={20} />
                  </a>
                )}
                {getSetting('social_linkedin') && (
                  <a 
                    href={getSetting('social_linkedin')} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <Linkedin size={20} />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-green-400 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-green-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-gray-400 hover:text-green-400 transition-colors">
                    Our Products
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="text-gray-400 hover:text-green-400 transition-colors">
                    Careers
                  </Link>
                </li>
                {/*<li>
                  <Link to="/register" className="text-gray-400 hover:text-green-400 transition-colors">
                    Register
                  </Link>
                </li>*/}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-3">
                {getSetting('contact_address') && (
                  <li className="flex items-start">
                    <MapPin size={20} className="text-green-400 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-400">
                      {getSetting('contact_address')}
                    </span>
                  </li>
                )}
                {getSetting('contact_phone') && (
                  <li className="flex items-center">
                    <Phone size={20} className="text-green-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-400">{getSetting('contact_phone')}</span>
                  </li>
                )}
                {getSetting('contact_email') && (
                  <li className="flex items-center">
                    <Mail size={20} className="text-green-400 mr-2 flex-shrink-0" />
                    <a 
                      href={`mailto:${getSetting('contact_email')}`}
                      className="text-gray-400 hover:text-green-400 transition-colors"
                    >
                      {getSetting('contact_email')}
                    </a>
                  </li>
                )}
                {getSetting('business_hours') && (
                  <li className="flex items-start">
                    <div className="w-5 h-5 mr-2 mt-1 flex-shrink-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="text-gray-400">
                      <div className="text-sm text-gray-500">Business Hours</div>
                      <div>{getSetting('business_hours')}</div>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
              <p className="text-gray-400 mb-4">
                Subscribe to our newsletter for the latest updates on AI innovations.
              </p>
              <form className="space-y-2" onSubmit={(e) => {
                e.preventDefault();
                const email = (e.target as any).email.value;
                if (email) {
                  // Here you would integrate with your newsletter API
                  alert('Thank you for subscribing!');
                  (e.target as any).reset();
                }
              }}>
                <input
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-md hover:from-green-500 hover:to-green-700 transition-all duration-200"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <hr className="border-gray-800 my-8" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} {getSetting('company_name', 'Trinexa')}. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-green-400 text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-green-400 text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-green-400 text-sm">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
      <Chatbot />
    </>
  );
};

export default Footer;