import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { useUser } from '../../contexts/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireUser?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  requireUser = false 
}: ProtectedRouteProps) => {
  const { user: adminUser, loading: adminLoading } = useAdmin();
  const { user: regularUser, loading: userLoading } = useUser();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (adminLoading || userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="text-gray-600">Verifying authentication...</span>
        </div>
      </div>
    );
  }

  // Check admin authentication
  if (requireAdmin) {
    if (!adminUser) {
      console.log('Admin access required but no admin user found, redirecting to login');
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <>{children}</>;
  }

  // Check regular user authentication
  if (requireUser) {
    if (!regularUser) {
      console.log('User access required but no user found, redirecting to login');
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <>{children}</>;
  }

  // Default: allow access if any user is authenticated
  if (!adminUser && !regularUser) {
    console.log('No authenticated user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
