import { supabase } from '../lib/supabase';

// User authentication functions (separate from admin)
export const userAuthApi = {
  // Regular user login
  login: async (email: string, password: string) => {
    try {
      console.log('🔐 User login attempt for:', email.trim());

      // Clear any existing session first
      await supabase.auth.signOut();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (authError) {
        console.error('User auth error:', authError);
        
        if (authError.message?.includes('Invalid login credentials') || authError.status === 400) {
          throw new Error('Invalid email or password. Please check your credentials.');
        } else if (authError.message?.includes('Email not confirmed')) {
          throw new Error('Please confirm your email address before logging in.');
        } else {
          throw new Error(`Authentication failed: ${authError.message}`);
        }
      }

      const { user, session } = authData;
      if (!user || !session) {
        throw new Error('Login failed - no user session created.');
      }

      console.log('✅ User authenticated with Supabase Auth:', user.id);

      // Get user profile from database
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !userProfile) {
        console.warn('User profile not found, creating basic profile...');
        
        // Create basic user profile if not exists
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email || email.trim(),
            full_name: user.user_metadata?.full_name || 'User',
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Failed to create user profile:', createError);
          throw new Error('Failed to create user profile');
        }

        return newProfile;
      }

      console.log('✅ User login successful:', userProfile.email);
      return userProfile;

    } catch (error) {
      console.error('User login error:', error);
      // Clean up on error
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.warn('Cleanup signout error:', signOutError);
      }
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) return null;

      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.warn('User profile not found for authenticated user');
        return null;
      }

      return userProfile;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Logout
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};

// Test authentication function
export const testUserAuth = async (email: string, password: string) => {
  try {
    console.log('🧪 Testing user authentication...');
    
    const user = await userAuthApi.login(email, password);
    console.log('✅ Authentication test successful:', user);
    
    const currentUser = await userAuthApi.getCurrentUser();
    console.log('✅ Current user check:', currentUser);
    
    await userAuthApi.logout();
    console.log('✅ Logout successful');
    
    return {
      success: true,
      user,
      message: 'Authentication test completed successfully'
    };
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Authentication test failed'
    };
  }
};
