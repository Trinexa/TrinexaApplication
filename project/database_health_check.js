// Enhanced Database Connection Test
// This verifies your PostgreSQL connection through Supabase

import { supabase } from './src/lib/supabase';

export const testDatabaseConnection = async () => {
  console.log('🔍 Testing Database Connection...');
  console.log('Database: db.aylbhudsotlywossqbkc.supabase.co:5432/postgres');
  
  const results = {
    basicConnection: '❌ Not Tested',
    authSystem: '❌ Not Tested',
    adminTables: '❌ Not Tested',
    messageSystem: '❌ Not Tested',
    realTimeFeatures: '❌ Not Tested'
  };

  try {
    // Test 1: Basic PostgreSQL connection through Supabase
    console.log('1️⃣ Testing basic PostgreSQL connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1);
    
    if (!connectionError) {
      results.basicConnection = '✅ Connected to PostgreSQL via Supabase';
      console.log('✅ PostgreSQL connection: SUCCESS');
    } else {
      results.basicConnection = `❌ Failed: ${connectionError.message}`;
      console.error('❌ PostgreSQL connection failed:', connectionError);
    }

    // Test 2: Authentication system
    console.log('2️⃣ Testing authentication system...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (!authError) {
      if (session) {
        results.authSystem = `✅ User authenticated: ${session.user.email}`;
        console.log('✅ Auth system: User logged in', session.user.email);
      } else {
        results.authSystem = '⚠️ No active session (not logged in)';
        console.log('⚠️ Auth system: No active session');
      }
    } else {
      results.authSystem = `❌ Auth error: ${authError.message}`;
      console.error('❌ Authentication system failed:', authError);
    }

    // Test 3: Admin tables access
    console.log('3️⃣ Testing admin tables...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('id, email, role')
      .limit(3);
    
    if (!adminError && adminUsers) {
      results.adminTables = `✅ Admin tables accessible (${adminUsers.length} users found)`;
      console.log('✅ Admin tables: SUCCESS', adminUsers);
    } else {
      results.adminTables = `❌ Admin tables error: ${adminError?.message}`;
      console.error('❌ Admin tables access failed:', adminError);
    }

    // Test 4: Message system tables
    console.log('4️⃣ Testing message system...');
    const { data: templates, error: templatesError } = await supabase
      .from('message_templates')
      .select('id, name, category')
      .limit(3);
    
    if (!templatesError) {
      results.messageSystem = `✅ Message system operational (${templates?.length || 0} templates)`;
      console.log('✅ Message system: SUCCESS');
    } else {
      results.messageSystem = `❌ Message system error: ${templatesError.message}`;
      console.error('❌ Message system failed:', templatesError);
    }

    // Test 5: Real-time features
    console.log('5️⃣ Testing real-time features...');
    try {
      const channel = supabase.channel('test-channel');
      const subscription = channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          results.realTimeFeatures = '✅ Real-time features available';
          console.log('✅ Real-time: SUCCESS');
        }
      });
      
      // Clean up
      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 1000);
      
    } catch (realtimeError) {
      results.realTimeFeatures = `❌ Real-time error: ${realtimeError}`;
      console.error('❌ Real-time features failed:', realtimeError);
    }

  } catch (globalError) {
    console.error('💥 Global connection test error:', globalError);
    results.basicConnection = `❌ Global error: ${globalError.message}`;
  }

  // Display results
  console.log('\n📊 DATABASE CONNECTION TEST RESULTS:');
  console.log('==========================================');
  Object.entries(results).forEach(([key, value]) => {
    const displayName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${displayName.padEnd(25)}: ${value}`);
  });
  
  return results;
};

// Test database performance
export const testDatabasePerformance = async () => {
  console.log('\n⚡ Testing Database Performance...');
  
  const performanceResults = {
    readSpeed: 0,
    writeSpeed: 0,
    connectionLatency: 0
  };

  try {
    // Test read performance
    const readStart = Date.now();
    await supabase.from('admin_users').select('*').limit(10);
    performanceResults.readSpeed = Date.now() - readStart;

    // Test connection latency
    const latencyStart = Date.now();
    await supabase.from('admin_users').select('count').limit(1);
    performanceResults.connectionLatency = Date.now() - latencyStart;

    console.log(`📖 Read Speed: ${performanceResults.readSpeed}ms`);
    console.log(`🔗 Connection Latency: ${performanceResults.connectionLatency}ms`);
    
    // Performance assessment
    if (performanceResults.connectionLatency < 100) {
      console.log('🚀 Excellent connection speed!');
    } else if (performanceResults.connectionLatency < 300) {
      console.log('✅ Good connection speed');
    } else {
      console.log('⚠️ Connection is slow, check network');
    }

  } catch (error) {
    console.error('❌ Performance test failed:', error);
  }

  return performanceResults;
};

// Complete database health check
export const runCompleteHealthCheck = async () => {
  console.log('🏥 Running Complete Database Health Check...');
  console.log('==============================================\n');
  
  const connectionResults = await testDatabaseConnection();
  const performanceResults = await testDatabasePerformance();
  
  const overallHealth = Object.values(connectionResults).filter(r => r.includes('✅')).length;
  const totalTests = Object.keys(connectionResults).length;
  
  console.log('\n📋 OVERALL HEALTH SUMMARY:');
  console.log('===========================');
  console.log(`Database Health: ${overallHealth}/${totalTests} tests passed`);
  console.log(`Connection Status: ${overallHealth >= 3 ? '🟢 HEALTHY' : '🟡 NEEDS ATTENTION'}`);
  console.log(`Performance: ${performanceResults.connectionLatency < 200 ? '🟢 FAST' : '🟡 SLOW'}`);
  
  return {
    connectionResults,
    performanceResults,
    healthScore: (overallHealth / totalTests) * 100
  };
};

// Usage:
// runCompleteHealthCheck().then(results => console.log('Health check completed:', results));
