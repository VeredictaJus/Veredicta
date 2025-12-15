import { supabase } from '@/lib/supabaseClient'

/**
 * Utility to configure Supabase Authentication settings
 * This helps identify and suggest fixes for common auth issues
 */

export interface AuthConfigResult {
  success: boolean;
  issues: string[];
  solutions: string[];
}

export const diagnoseAuthConfig = async (): Promise<AuthConfigResult> => {
  console.log('🔧 SUPABASE AUTH CONFIG - Diagnosing authentication configuration...');
  
  const result: AuthConfigResult = {
    success: false,
    issues: [],
    solutions: []
  };

  try {
    // Test 1: Check basic connectivity
    console.log('🔌 Testing Supabase connectivity...');
    const { data, error } = await supabase.from('app_2d8133c678_profiles').select('count').single();
    
    if (error && !error.message.includes('JSON object requested')) {
      result.issues.push('Cannot connect to database');
      result.solutions.push('Verify SUPABASE_URL and SUPABASE_ANON_KEY in environment variables');
    } else {
      console.log('✅ Database connectivity OK');
    }

    // Test 2: Try authentication flow
    console.log('🔐 Testing authentication flow...');
    try {
      // Test with a dummy signup to see what error we get
      const testEmail = `diagtest-${Date.now()}@test.local`;
      const { error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'test123456'
      });

      if (authError) {
        console.log('Auth error received:', authError.message);
        
        if (authError.message.includes('signup disabled')) {
          result.issues.push('User signup is disabled');
          result.solutions.push('Enable signup in Supabase Dashboard: Authentication > Settings > Enable signup');
        } else if (authError.message.includes('email confirmations')) {
          result.issues.push('Email confirmation required but might be misconfigured');
          result.solutions.push('Configure email templates or disable email confirmation in Authentication > Settings');
        } else if (authError.message.includes('rate limit')) {
          console.log('✅ Auth is working (rate limited)');
          result.success = true;
        } else {
          result.issues.push(`Auth error: ${authError.message}`);
        }
      } else {
        console.log('✅ Auth signup appears to be working');
        result.success = true;
      }
    } catch (authError: any) {
      result.issues.push(`Authentication test failed: ${authError.message}`);
    }

    // Test 3: Check profiles table structure
    console.log('📋 Checking profiles table...');
    try {
      const { data: tableData, error: tableError } = await supabase
        .from('app_2d8133c678_profiles')
        .select('id, user_id, email, user_type')
        .limit(1);

      if (tableError) {
        result.issues.push('Profiles table structure issue');
        result.solutions.push('Ensure profiles table exists with correct columns: id, user_id, email, user_type');
      } else {
        console.log('✅ Profiles table structure OK');
      }
    } catch (error: any) {
      result.issues.push(`Table check failed: ${error.message}`);
    }

    // Generate final status
    if (result.issues.length === 0) {
      result.success = true;
      result.solutions.push('Authentication configuration appears to be correct');
    }

  } catch (error: any) {
    result.issues.push(`Critical configuration error: ${error.message}`);
    result.solutions.push('Check all Supabase credentials and permissions');
  }

  console.log('📊 AUTH CONFIG DIAGNOSIS COMPLETE:');
  console.log('Issues found:', result.issues);
  console.log('Recommended solutions:', result.solutions);

  return result;
};

/**
 * Manual configuration instructions for Supabase Dashboard
 */
export const getManualConfigInstructions = () => {
  return `
🔧 MANUAL SUPABASE CONFIGURATION REQUIRED

To fix account creation issues, please configure these settings in your Supabase Dashboard:

1. **Enable User Signup**
   → Go to: Authentication > Settings
   → Set "Enable signup" to ON

2. **Configure Email Settings**
   → Go to: Authentication > Settings
   → Either:
     a) Disable "Enable email confirmations" (for development), OR
     b) Configure proper email templates and SMTP settings

3. **Check Database Policies**
   → Go to: Database > Tables > app_2d8133c678_profiles
   → Ensure RLS policies allow INSERT for authenticated users

4. **Verify API Keys**
   → Go to: Settings > API
   → Copy the "anon public" key to your .env file

5. **Test User Creation**
   → Go to: Authentication > Users
   → Try manually creating a test user

After making these changes, restart your application and test account creation.
  `;
};

// Function to create a test registration from the browser console
export const createTestRegistration = () => {
  return `
// Run this in browser console to test registration:
const testRegistration = async () => {
  try {
    const { runAuthDiagnostic } = await import('./src/utils/authDiagnostic');
    const diagnostic = await runAuthDiagnostic();
    console.log('🔬 Diagnostic result:', diagnostic);
    
    if (diagnostic.errors.length > 0) {
      console.log('❌ Issues found:', diagnostic.errors);
      console.log('💡 Solutions:', diagnostic.recommendations);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testRegistration();
  `;
};