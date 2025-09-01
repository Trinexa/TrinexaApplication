import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
  }) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  updateProfile: async () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await checkUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!session) {
        setUser(null);
        return;
      }

      // Get user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        // If user doesn't exist in users table, they might be an admin
        // or need to complete registration
        setUser(null);
        return;
      }

      setUser(userData);
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) throw new Error('User not found');

    setUser(userData);
  };

  const register = async (userData: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
  }) => {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) throw authError;

    // Create user record
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user?.id,
          email: userData.email,
          full_name: userData.full_name,
          phone: userData.phone,
        },
      ])
      .select()
      .single();

    if (userError) throw userError;

    setUser(userRecord);
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    setUser(data);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      register, 
      updateProfile 
    }}>
      {children}
    </UserContext.Provider>
  );
};
