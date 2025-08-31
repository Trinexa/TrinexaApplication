// TEST SUPABASE CONNECTION
// Add this to your BookDemoPage.tsx temporarily to debug

const testSupabaseConnection = async () => {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Basic connection
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    // Test 2: Simple query (this should work even if demo_bookings doesn't exist)
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);
    
    if (tablesError) {
      console.error('Tables query error:', tablesError);
    } else {
      console.log('Available tables:', tables);
    }
    
    // Test 3: Check if demo_bookings table exists
    const { data: demoTable, error: demoError } = await supabase
      .from('demo_bookings')
      .select('count', { count: 'exact', head: true });
    
    if (demoError) {
      console.error('Demo bookings table error:', demoError);
      if (demoError.code === '42P01') {
        console.log('❌ demo_bookings table does not exist!');
      }
    } else {
      console.log('✅ demo_bookings table exists, count:', demoTable);
    }
    
    // Test 4: Try to insert a test record
    const testRecord = {
      name: 'Test User',
      email: 'test@example.com',
      company: 'Test Company',
      phone: '123-456-7890',
      product_interest: 'CRM Solution',
      message: 'Test message',
      preferred_date: new Date().toISOString().split('T')[0]
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('demo_bookings')
      .insert(testRecord)
      .select()
      .single();
    
    if (insertError) {
      console.error('Insert test error:', insertError);
    } else {
      console.log('✅ Insert test successful:', insertData);
    }
    
  } catch (error) {
    console.error('Connection test failed:', error);
  }
};

// Add this button to your form temporarily
<button 
  type="button" 
  onClick={testSupabaseConnection}
  className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
>
  Test Supabase Connection
</button>
