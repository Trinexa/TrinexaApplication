import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from './contexts/AdminContext';
import { UserProvider } from './contexts/UserContext';
import { SystemSettingsProvider } from './contexts/SystemSettingsContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage'; // The correct file with testimonials
import AboutPage from './pages/AboutPage';
import CareersPage from './pages/CareersPage';
import ProductsPage from './pages/ProductsPageNew';
import RegisterPage from './pages/RegisterPage';
import BookDemoPage from './pages/BookDemoPage';
import GeneralApplicationPage from './pages/GeneralApplicationPage';
import JobDetailsPage from './pages/JobDetailsPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import LoginPage from './pages/LoginPage';
import AdminSetup from './pages/admin/AdminSetup';
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import PageManagement from './pages/admin/PageManagement';
import MessageManagement from './pages/admin/MessageManagement';
import RecruitmentManagement from './pages/admin/RecruitmentManagement';
import ProductManagement from './pages/admin/ProductManagement';
import DemoSessionsManagement from './pages/admin/DemoSessionsManagement';
import ContentManagement from './pages/admin/ContentManagement';
import EmailManagement from './pages/admin/EmailManagement';
import SettingsPage from './pages/admin/SettingsPage';
import BusinessIntelligence from './pages/admin/BusinessIntelligence';
import LogsPage from './pages/admin/LogsPage';
import AcceptInvitationPage from './pages/AcceptInvitationPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import UserDashboard from './pages/customer/UserDashboard';
import ApiKeyManagement from './pages/customer/ApiKeyManagement';
import SupportCenter from './pages/customer/SupportCenter';
import ScrollToTop from './components/common/ScrollToTop';
import { FaviconManager } from './components/common/FaviconManager';

function App() {
  return (
    <SystemSettingsProvider>
      <FaviconManager />
      <AdminProvider>
        <UserProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              {/* Unified Login Route */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Admin Setup Route (for initial setup) */}
              <Route path="/admin/setup" element={<AdminSetup />} />
              
              {/* User Dashboard Route */}
              <Route path="/dashboard" element={
                <ProtectedRoute requireUser>
                  <UserDashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/accept-invitation" element={<AcceptInvitationPage />} />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout>
                      <Routes>
                        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/pages" element={<PageManagement />} />
                        <Route path="/content" element={<ContentManagement />} />
                        <Route path="/email" element={<EmailManagement />} />
                        <Route path="/messages" element={<MessageManagement />} />
                        <Route path="/recruitment" element={<RecruitmentManagement />} />
                        <Route path="/products" element={<ProductManagement />} />
                        <Route path="/demo-sessions" element={<DemoSessionsManagement />} />
                        <Route path="/business-intelligence" element={<BusinessIntelligence />} />
                        <Route path="/logs" element={<LogsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                      </Routes>
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Customer Portal Routes */}
              <Route path="/customer/dashboard" element={
                <ProtectedRoute requireUser>
                  <CustomerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/customer/api-keys" element={
                <ProtectedRoute requireUser>
                  <ApiKeyManagement />
                </ProtectedRoute>
              } />
              <Route path="/customer/support" element={
                <ProtectedRoute requireUser>
                  <SupportCenter />
                </ProtectedRoute>
              } />

              {/* Public Routes */}
              <Route
                path="/*"
                element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-grow">
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/careers" element={<CareersPage />} />
                        <Route path="/careers/:id" element={<JobDetailsPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/book-demo" element={<BookDemoPage />} />
                        <Route path="/careers/apply" element={<GeneralApplicationPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                }
              />
            </Routes>
          </Router>
        </UserProvider>
      </AdminProvider>
    </SystemSettingsProvider>
  );
}

export default App;