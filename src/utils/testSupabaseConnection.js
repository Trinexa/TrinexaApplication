// SUPABASE CONNECTION TEST - FRONTEND VERSION
// You can run this in your browser console or create a test component

import { supabase } from '../lib/supabase';

export const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase Connection...');
  
  const results = {
    connectionStatus: '❌ Not Tested',
    authStatus: '❌ Not Tested',
    databaseAccess: '❌ Not Tested',
    apiAccess: '❌ Not Tested',
    userSession: '❌ Not Tested'
  };

  try {
    // Test 1: Basic connection test
    console.log('1️⃣ Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1);
    
    if (!connectionError) {
      results.connectionStatus = '✅ Connected';
      console.log('✅ Basic connection: SUCCESS');
    } else {
      results.connectionStatus = `❌ Failed: ${connectionError.message}`;
      console.error('❌ Basic connection failed:', connectionError);
    }

    // Test 2: Authentication status
    console.log('2️⃣ Testing authentication...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (!authError) {
      if (session) {
        results.authStatus = `✅ Authenticated as ${session.user.email}`;
        results.userSession = `✅ Active session (expires: ${new Date(session.expires_at * 1000).toLocaleString()})`;
        console.log('✅ Authentication: User logged in', session.user.email);
      } else {
        results.authStatus = '⚠️ No active session (not logged in)';
        results.userSession = '⚠️ No active session';
        console.log('⚠️ Authentication: No active session');
      }
    } else {
      results.authStatus = `❌ Auth error: ${authError.message}`;
      console.error('❌ Authentication error:', authError);
    }

    // Test 3: Database table access
    console.log('3️⃣ Testing database access...');
    const { data: tablesTest, error: tablesError } = await supabase
      .from('message_templates')
      .select('id')
      .limit(1);
    
    if (!tablesError) {
      results.databaseAccess = '✅ Can access message_templates';
      console.log('✅ Database access: SUCCESS');
    } else {
      results.databaseAccess = `❌ Database error: ${tablesError.message}`;
      console.error('❌ Database access failed:', tablesError);
    }

    // Test 4: API functionality
    console.log('4️⃣ Testing API functions...');
    try {
      // Test if our API functions work
      const testData = await fetch('/api/test-connection', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (testData.ok) {
        results.apiAccess = '✅ API endpoints accessible';
        console.log('✅ API access: SUCCESS');
      } else {
        results.apiAccess = `⚠️ API responded with status: ${testData.status}`;
        console.log('⚠️ API access: Non-200 response');
      }
    } catch (apiError) {
      results.apiAccess = `❌ API error: ${apiError.message}`;
      console.error('❌ API access failed:', apiError);
    }

  } catch (globalError) {
    console.error('💥 Global connection test error:', globalError);
    results.connectionStatus = `❌ Global error: ${globalError.message}`;
  }

  // Display results
  console.log('\n📊 SUPABASE CONNECTION TEST RESULTS:');
  console.log('=====================================');
  Object.entries(results).forEach(([key, value]) => {
    console.log(`${key.padEnd(20)}: ${value}`);
  });
  
  return results;
};

// Test your environment variables
export const testEnvironmentConfig = () => {
  console.log('\n🔧 ENVIRONMENT CONFIGURATION:');
  console.log('==============================');
  
  const config = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'NOT SET',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET (hidden)' : 'NOT SET',
    nodeEnv: import.meta.env.NODE_ENV || 'NOT SET',
    mode: import.meta.env.MODE || 'NOT SET'
  };
  
  Object.entries(config).forEach(([key, value]) => {
    const status = value === 'NOT SET' ? '❌' : '✅';
    console.log(`${status} ${key.padEnd(20)}: ${value}`);
  });
  
  return config;
};

// Quick connection health check
export const quickHealthCheck = async () => {
  try {
    const start = Date.now();
    const { error } = await supabase.from('admin_users').select('count').limit(1);
    const responseTime = Date.now() - start;
    
    if (!error) {
      console.log(`✅ Supabase Health: OK (${responseTime}ms)`);
      return { status: 'healthy', responseTime };
    } else {
      console.log(`❌ Supabase Health: ERROR - ${error.message}`);
      return { status: 'error', error: error.message };
    }
  } catch (err) {
    console.log(`💥 Supabase Health: FAILED - ${err.message}`);
    return { status: 'failed', error: err.message };
  }
};

// Usage example:
// testSupabaseConnection();
// testEnvironmentConfig();
// quickHealthCheck();
