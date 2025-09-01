import { supabase } from '../lib/supabase';

// Enhanced user creation with proper Supabase Auth flow
export const createAdminUser = async (email: string, password: string) => {
  try {
    console.log('🔧 Creating admin user:', email);
    
    // Clear any existing session to avoid conflicts
    await supabase.auth.signOut();
    
    // Step 1: Create user in Supabase Auth (this handles password securely)
    console.log('📝 Step 1: Creating auth user in Supabase Auth...');
    let authUserId: string | null = null;
    
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        emailRedirectTo: undefined, // Skip email confirmation for demo
        data: {
          full_name: 'Admin User',
          role: 'admin'
        }
      }
    });

    if (signUpError) {
      if (signUpError.message?.includes('User already registered')) {
        console.log('ℹ️ Auth user already exists, proceeding with profile setup');
        
        // Get existing user by signing in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        });
        
        if (signInError) {
          throw new Error(`Cannot access existing user: ${signInError.message}`);
        }
        
        authUserId = signInData.user?.id || null;
        await supabase.auth.signOut(); // Clean up
      } else {
        throw new Error(`Failed to create auth user: ${signUpError.message}`);
      }
    } else {
      authUserId = authData.user?.id || null;
    }

    if (!authUserId) {
      throw new Error('No user ID returned from auth signup/signin');
    }

    console.log('✅ Auth user created/found:', authUserId);

    // Step 2: Create admin profile record (no password stored here)
    console.log('📝 Step 2: Creating admin profile record...');
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .upsert({
        id: authUserId, // Link to auth user ID
        email: email.trim(),
        role: 'admin',
        account_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (adminError) {
      console.error('❌ Error creating admin profile:', adminError);
      throw new Error(`Failed to create admin profile: ${adminError.message}`);
    }

    console.log('✅ Admin profile created successfully:', adminData.email);
    console.log('🎉 Admin user setup completed successfully!');
    return adminData;

  } catch (error) {
    console.error('💥 Error in createAdminUser:', error);
    throw error;
  }
};

export const createRegularUser = async (email: string, password: string, fullName: string) => {
  try {
    console.log('🔧 Creating regular user:', email);
    
    // Clear any existing session to avoid conflicts
    await supabase.auth.signOut();
    
    // Step 1: Create user in Supabase Auth (this handles password securely)
    console.log('📝 Step 1: Creating auth user in Supabase Auth...');
    let authUserId: string | null = null;
    
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        emailRedirectTo: undefined, // Skip email confirmation for demo
        data: {
          full_name: fullName,
          role: 'user'
        }
      }
    });

    if (signUpError) {
      if (signUpError.message?.includes('User already registered')) {
        console.log('ℹ️ Auth user already exists, proceeding with profile setup');
        
        // Get existing user by signing in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        });
        
        if (signInError) {
          throw new Error(`Cannot access existing user: ${signInError.message}`);
        }
        
        authUserId = signInData.user?.id || null;
        await supabase.auth.signOut(); // Clean up
      } else {
        throw new Error(`Failed to create auth user: ${signUpError.message}`);
      }
    } else {
      authUserId = authData.user?.id || null;
    }

    if (!authUserId) {
      throw new Error('No user ID returned from auth signup/signin');
    }

    console.log('✅ Auth user created/found:', authUserId);

    // Step 2: Create user profile record (no password stored here)
    console.log('📝 Step 2: Creating user profile record...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: authUserId, // Link to auth user ID
        email: email.trim(),
        full_name: fullName,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Error creating user profile:', userError);
      throw new Error(`Failed to create user profile: ${userError.message}`);
    }

    console.log('✅ User profile created successfully:', userData.email);
    console.log('🎉 User setup completed successfully!');
    return userData;

  } catch (error) {
    console.error('💥 Error in createRegularUser:', error);
    throw error;
  }
};

export const setupDefaultAdmin = async () => {
  return createAdminUser('admin@trinexa.com', 'admin123');
};

export const setupDefaultUser = async () => {
  return createRegularUser('demo@user.com', 'demo123', 'Demo User');
};

// Database health check and setup validation
export const validateDatabaseSetup = async () => {
  try {
    console.log('🔍 Validating database setup...');
    
    // Check if admin_users table exists and is accessible
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('email, role, account_status')
      .limit(1);
    
    if (adminError) {
      console.error('❌ Admin users table access error:', adminError);
      return {
        success: false,
        issues: [`Admin users table: ${adminError.message}`],
        recommendations: ['Ensure RLS policies allow read access', 'Check table permissions']
      };
    }
    
    // Check if users table exists and is accessible
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email, full_name')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Users table access error:', usersError);
      return {
        success: false,
        issues: [`Users table: ${usersError.message}`],
        recommendations: ['Ensure RLS policies allow read access', 'Check table permissions']
      };
    }
    
    // Check current auth session
    const { data: { session } } = await supabase.auth.getSession();
    
    console.log('✅ Database validation completed');
    console.log(`📊 Found ${adminUsers?.length || 0} admin users`);
    console.log(`📊 Found ${users?.length || 0} regular users`);
    console.log(`🔑 Auth session: ${session ? 'Active' : 'None'}`);
    
    return {
      success: true,
      adminUsersCount: adminUsers?.length || 0,
      regularUsersCount: users?.length || 0,
      hasActiveSession: !!session,
      issues: [],
      recommendations: []
    };
    
  } catch (error) {
    console.error('💥 Database validation error:', error);
    return {
      success: false,
      issues: [`Validation error: ${error}`],
      recommendations: ['Check database connection', 'Verify Supabase configuration']
    };
  }
};

// Complete setup with validation
export const performCompleteSetup = async () => {
  try {
    console.log('🚀 Starting complete system setup...');
    
    // Step 1: Validate database
    const validation = await validateDatabaseSetup();
    console.log('📋 Database validation result:', validation);
    
    if (!validation.success) {
      throw new Error(`Database validation failed: ${validation.issues.join(', ')}`);
    }
    
    // Step 2: Create default admin if none exists
    if (validation.adminUsersCount === 0) {
      console.log('📝 No admin users found, creating default admin...');
      await setupDefaultAdmin();
    } else {
      console.log('ℹ️ Admin users already exist, skipping admin creation');
    }
    
    // Step 3: Create default demo user if none exists
    if (validation.regularUsersCount === 0) {
      console.log('📝 No regular users found, creating demo user...');
      await setupDefaultUser();
    } else {
      console.log('ℹ️ Regular users already exist, skipping user creation');
    }
    
    // Step 4: Final validation
    const finalValidation = await validateDatabaseSetup();
    
    console.log('🎉 Complete setup finished!');
    return {
      success: true,
      adminUsersCreated: validation.adminUsersCount === 0,
      regularUsersCreated: validation.regularUsersCount === 0,
      finalState: finalValidation
    };
    
  } catch (error) {
    console.error('💥 Complete setup error:', error);
    throw error;
  }
};
