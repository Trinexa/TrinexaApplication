// ADMIN USER CREATION SCRIPT
// Run this in your browser console or create a temporary component to execute it

import { supabase } from './src/lib/supabase';

export const createAdminUsers = async () => {
  console.log('🔧 Creating admin users in Supabase Auth...');
  
  const adminUsers = [
    {
      email: 'admin@trinexa.com',
      password: 'Admin123!@#',
      role: 'super_admin',
      name: 'Super Admin'
    },
    {
      email: 'content@trinexa.com',
      password: 'Content123!@#',
      role: 'content_admin',
      name: 'Content Manager'
    },
    {
      email: 'hr@trinexa.com',
      password: 'HR123!@#',
      role: 'recruitment_admin',
      name: 'HR Manager'
    }
  ];

  const results = [];

  for (const user of adminUsers) {
    try {
      console.log(`Creating user: ${user.email}`);
      
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: user.name,
          role: user.role
        }
      });

      if (error) {
        console.error(`❌ Failed to create ${user.email}:`, error.message);
        results.push({
          email: user.email,
          status: 'failed',
          error: error.message
        });
      } else {
        console.log(`✅ Successfully created ${user.email}`);
        results.push({
          email: user.email,
          status: 'success',
          userId: data.user.id
        });
      }
    } catch (err) {
      console.error(`💥 Error creating ${user.email}:`, err);
      results.push({
        email: user.email,
        status: 'error',
        error: err.message
      });
    }
  }

  console.log('\n📊 USER CREATION RESULTS:');
  console.log('========================');
  results.forEach(result => {
    const status = result.status === 'success' ? '✅' : '❌';
    console.log(`${status} ${result.email}: ${result.status.toUpperCase()}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    if (result.userId) {
      console.log(`   User ID: ${result.userId}`);
    }
  });

  return results;
};

// Alternative: Create users one by one manually
export const createSingleAdminUser = async (email, password, role, name) => {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role }
    });

    if (error) {
      console.error(`Failed to create user ${email}:`, error);
      return { success: false, error };
    }

    console.log(`Successfully created admin user: ${email}`);
    return { success: true, user: data.user };
  } catch (err) {
    console.error(`Error creating user ${email}:`, err);
    return { success: false, error: err };
  }
};

// Usage examples:
// 1. Create all admin users at once:
// createAdminUsers();

// 2. Create individual users:
// createSingleAdminUser('admin@trinexa.com', 'Admin123!@#', 'super_admin', 'Super Admin');
// createSingleAdminUser('content@trinexa.com', 'Content123!@#', 'content_admin', 'Content Manager');
// createSingleAdminUser('hr@trinexa.com', 'HR123!@#', 'recruitment_admin', 'HR Manager');
