// ADMIN USER CREATION SCRIPT (Alternative Method)
// Use this if you have the service role key

import { createClient } from '@supabase/supabase-js';

// You'll need to get your service role key from Supabase dashboard
const supabaseUrl = 'https://aylbhudsotlywossqbkc.supabase.co';
const serviceRoleKey = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Get this from Supabase Dashboard → Settings → API

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const createAdminUsersWithServiceRole = async () => {
  console.log('🔧 Creating admin users with service role...');
  
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
      
      // Create user with admin client
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
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
        
        // Now add to admin_users table
        const { error: adminError } = await supabaseAdmin
          .from('admin_users')
          .upsert({
            id: data.user.id,
            email: user.email,
            role: user.role
          });

        if (adminError) {
          console.error(`⚠️ Created user but failed to add to admin_users:`, adminError);
        }

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

// For testing existing users
export const testExistingUsers = async () => {
  const { supabase } = await import('./src/lib/supabase');
  
  const testCredentials = [
    { email: 'admin@trinexa.com', password: 'Admin123!@#' },
    { email: 'content@trinexa.com', password: 'Content123!@#' },
    { email: 'hr@trinexa.com', password: 'HR123!@#' }
  ];

  console.log('🧪 Testing existing admin credentials...');

  for (const cred of testCredentials) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      });

      if (error) {
        console.log(`❌ ${cred.email}: ${error.message}`);
      } else {
        console.log(`✅ ${cred.email}: Login successful`);
        // Sign out immediately
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.log(`💥 ${cred.email}: ${err.message}`);
    }
  }
};

// Usage:
// 1. Get your service role key from Supabase dashboard
// 2. Replace 'YOUR_SERVICE_ROLE_KEY_HERE' with the actual key
// 3. Run: createAdminUsersWithServiceRole()
// 4. Test: testExistingUsers()
