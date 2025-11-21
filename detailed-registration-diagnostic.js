
// DETAILED REGISTRATION ERROR DIAGNOSTIC SCRIPT
// Run this in browser console on /auth/register page
console.log('🔍 DETAILED REGISTRATION ERROR DIAGNOSTIC');
console.log('=' * 50);

// Test environment setup
console.log('\n1️⃣ ENVIRONMENT CHECK:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('Environment mode:', import.meta.env.MODE);

// Test Supabase connection
console.log('\n2️⃣ SUPABASE CONNECTION TEST:');
try {
  const { supabase } = await import('/src/lib/supabase.ts');
  console.log('✅ Supabase client loaded:', supabase);
  
  // Test basic auth functionality
  const { data: authData, error: authError } = await supabase.auth.getSession();
  console.log('Session check - Data:', authData, 'Error:', authError);
  
} catch (error) {
  console.error('❌ Supabase connection failed:', error);
}

// Test table access
console.log('\n3️⃣ DATABASE TABLE ACCESS TEST:');
try {
  const { supabase } = await import('/src/lib/supabase.ts');
  
  // Test profiles table read access
  const { data: profileData, error: profileError } = await supabase
    .from('app_2d8133c678_profiles')
    .select('*')
    .limit(1);
  
  console.log('Profiles table access - Data:', profileData, 'Error:', profileError);
  
  if (profileError) {
    console.error('❌ Profiles table access error:', profileError.message);
    console.error('Error details:', profileError);
  }
  
} catch (error) {
  console.error('❌ Database access test failed:', error);
}

// Test actual signup process
console.log('\n4️⃣ SIGNUP PROCESS TEST:');
try {
  const { supabase } = await import('/src/lib/supabase.ts');
  
  // Test with dummy data (don't actually create account)
  console.log('Testing signup process with validation...');
  
  // Just test the signup method availability
  console.log('Signup method available:', typeof supabase.auth.signUp === 'function');
  
  // Test auth settings
  const { data: settingsData, error: settingsError } = await supabase.auth.getUser();
  console.log('Auth settings check - Data:', settingsData, 'Error:', settingsError);
  
} catch (error) {
  console.error('❌ Signup process test failed:', error);
}

// Test specific registration errors
console.log('\n5️⃣ REGISTRATION ERROR SIMULATION:');
try {
  const { supabase } = await import('/src/lib/supabase.ts');
  
  // Try to signup with invalid data to see specific error
  const { data, error } = await supabase.auth.signUp({
    email: 'test@invalid-domain-for-testing.com',
    password: 'test123456'
  });
  
  console.log('Test signup result - Data:', data, 'Error:', error);
  
  if (error) {
    console.log('Error type:', error.status);
    console.log('Error message:', error.message);
    console.log('Full error:', error);
  }
  
} catch (error) {
  console.error('❌ Registration error test failed:', error);
}

console.log('\n🎯 DIAGNOSTIC COMPLETE');
console.log('Check the output above for specific error details');
