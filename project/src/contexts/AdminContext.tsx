import { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, api } from '../services/api';
import { supabase } from '../lib/supabase';

interface AdminContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // First check if we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!session) {
        console.log('No active session found');
        setUser(null);
        return;
      }

      // If we have a valid session, get the current user and verify admin status
      console.log('Found session, checking admin user...');
      const user = await api.admin.getCurrentUser();
      
      if (!user) {
        console.log('User not found or not admin, clearing session');
        await supabase.auth.signOut();
        setUser(null);
        return;
      }
      
      console.log('Admin user verified:', user.email, user.role);
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
      // Clear session on any error
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error('Error signing out:', signOutError);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Clear any existing user state
      setUser(null);
      
      // Validate inputs
      if (!email?.trim() || !password?.trim()) {
        throw new Error('Email and password are required');
      }
      
      const user = await api.admin.login(email.trim(), password.trim());
      
      if (!user) {
        throw new Error('Login failed - invalid response');
      }
      
      setUser(user);
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    await api.admin.logout();
    setUser(null);
  };

  return (
    <AdminContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};