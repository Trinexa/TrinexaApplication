import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
// LogIn icon temporarily commented out with login buttons
// import { Menu, X, LogIn } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { useLogging } from '../../hooks/useLogging';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAdmin();
  const { getSetting, settings, loading } = useSystemSettings();
  const { logInfo, logWarn, logError } = useLogging('Navbar');
  const logoUrl = getSetting('logo_url');
  
  // Replace console.log with proper logging
  logInfo('Navbar rendered', { 
    loading, 
    settingsCount: settings ? Object.keys(settings).length : 0,
    logoUrl: logoUrl || 'not set'
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Products', path: '/products' },
    { name: 'Careers', path: '/careers' },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            {loading ? (
              <span className="text-xl font-bold text-gray-400">Loading...</span>
            ) : logoUrl && logoUrl.trim() !== '' ? (
              <img 
                src={logoUrl} 
                alt="Company Logo" 
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  logError('Logo failed to load', { logoUrl });
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  logInfo('Logo loaded successfully', { logoUrl });
                }}
              />
            ) : (
              <>
                <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                  Trinexa
                </span>
                <span className="text-xs text-gray-400">(No logo configured)</span>
              </>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-green-500'
                    : scrolled ? 'text-gray-800 hover:text-green-500' : 'text-gray-800 hover:text-green-500'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <Link
                to="/admin"
                className="bg-gradient-to-r from-green-400 to-green-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:from-green-500 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Admin Dashboard
              </Link>
            ) : (
              <>
                {/* Register button temporarily commented out */}
                {/* <Link
                  to="/register"
                  className="text-sm font-medium text-gray-800 hover:text-green-500 transition-colors"
                >
                  Register
                </Link> */}
                {/* Login button temporarily commented out */}
                {/* <Link
                  to="/admin/login"
                  className="bg-gradient-to-r from-green-400 to-green-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:from-green-500 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link> */}
              </>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`${
                scrolled ? 'text-gray-800' : 'text-gray-800'
              } focus:outline-none`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-full left-0 right-0 z-20">
          <div className="px-4 py-3 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`block text-sm font-medium ${
                  location.pathname === link.path
                    ? 'text-green-500'
                    : 'text-gray-800 hover:text-green-500'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <Link
                to="/admin"
                className="block bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-md text-sm font-medium text-center"
              >
                Admin Dashboard
              </Link>
            ) : (
              <>
                {/* Mobile register button temporarily commented out */}
                {/* <Link
                  to="/register"
                  className="block text-sm font-medium text-gray-800 hover:text-green-500"
                >
                  Register
                </Link> */}
                {/* Mobile login button temporarily commented out */}
                {/* <Link
                  to="/admin/login"
                  className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-md text-sm font-medium text-center flex items-center justify-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link> */}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;