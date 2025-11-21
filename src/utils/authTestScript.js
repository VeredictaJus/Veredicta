/**
 * Browser Console Test Script for Authentication Issues
 * Copy and paste this entire script into your browser console when on the Veredicta website
 */

console.log('🔬 VEREDICTA AUTH DIAGNOSTIC SCRIPT');
console.log('===================================');

// Test 1: Environment Variables
console.log('📋 Step 1: Checking environment configuration...');
const supabaseUrl = import.meta?.env?.VITE_SUPABASE_URL || 'Not found';
const hasAnonKey = !!import.meta?.env?.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Has Anon Key:', hasAnonKey);

// Test 2: Try to import Supabase client
console.log('\n📋 Step 2: Testing Supabase client...');
try {
  // This would work if we're on the actual site
  if (window.supabase || window.__supabase) {
    console.log('✅ Supabase client found');
  } else {
    console.log('⚠️ Supabase client not found in global scope');
  }
} catch (error) {
  console.error('❌ Error accessing Supabase:', error);
}

// Test 3: Registration Test Function
console.log('\n📋 Step 3: Registration test function created');

window.testRegistration = async () => {
  console.log('🧪 Testing user registration...');
  
  try {
    // Get supabase instance
    const supabase = window.supabase || window.__supabase;
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // Test signup
    const testEmail = `test-${Date.now()}@test.com`;
    console.log('Testing with email:', testEmail);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'test123456',
      options: {
        data: {
          role: 'client',
          user_type: 'client'
        }
      }
    });

    if (error) {
      console.log('🔍 Registration error details:');
      console.log('Error message:', error.message);
      console.log('Error code:', error.status);
      
      // Provide specific solutions
      if (error.message.includes('signup disabled')) {
        console.log('💡 SOLUTION: Enable signup in Supabase Dashboard');
        console.log('   → Go to Authentication > Settings');
        console.log('   → Set "Enable signup" to ON');
      } else if (error.message.includes('Email not confirmed')) {
        console.log('💡 SOLUTION: Disable email confirmation or configure email');
        console.log('   → Go to Authentication > Settings');
        console.log('   → Set "Enable email confirmations" to OFF (for testing)');
      } else if (error.message.includes('Invalid API key')) {
        console.log('💡 SOLUTION: Check your API key configuration');
        console.log('   → Verify VITE_SUPABASE_ANON_KEY in .env file');
      } else {
        console.log('💡 SOLUTION: Check Supabase dashboard for configuration issues');
      }
    } else {
      console.log('✅ Registration successful!', data);
      
      // Cleanup
      try {
        await supabase.auth.signOut();
        console.log('🧹 Test user cleaned up');
      } catch (cleanupError) {
        console.log('Cleanup not needed');
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Test 4: Database connectivity test
window.testDatabase = async () => {
  console.log('🧪 Testing database connectivity...');
  
  try {
    const supabase = window.supabase || window.__supabase;
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase
      .from('app_2d8133c678_profiles')
      .select('user_id')
      .limit(1);

    if (error) {
      console.log('❌ Database error:', error.message);
      
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('💡 SOLUTION: Create the profiles table in your database');
      } else if (error.message.includes('permission denied')) {
        console.log('💡 SOLUTION: Check RLS policies on profiles table');
      }
    } else {
      console.log('✅ Database connectivity OK');
    }
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
};

console.log('\n🎯 READY! Run these functions in console:');
console.log('  testRegistration() - Test user registration');
console.log('  testDatabase() - Test database connectivity');
console.log('\nOr run both tests:');
console.log('  testRegistration().then(() => testDatabase())');