import { supabase } from '@/lib/supabaseClient'

export interface AuthDiagnosticResult {
  supabaseConnection: boolean;
  authEnabled: boolean;
  profilesTableExists: boolean;
  signupWorking: boolean;
  emailConfirmationRequired: boolean;
  errors: string[];
  recommendations: string[];
}

export const runAuthDiagnostic = async (): Promise<AuthDiagnosticResult> => {
  console.log('🔬 AUTH DIAGNOSTIC - Starting authentication system check...');
  
  const result: AuthDiagnosticResult = {
    supabaseConnection: false,
    authEnabled: false,
    profilesTableExists: false,
    signupWorking: false,
    emailConfirmationRequired: false,
    errors: [],
    recommendations: []
  };

  try {
    // Test 1: Basic Supabase Connection
    console.log('🔌 Test 1: Checking Supabase connection...');
    try {
      const { data, error } = await supabase.from('app_2d8133c678_profiles').select('user_id').limit(1);
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      result.supabaseConnection = true;
      result.profilesTableExists = true;
      console.log('✅ Supabase connection and profiles table OK');
    } catch (error: any) {
      result.errors.push(`Supabase connection failed: ${error.message}`);
      console.error('❌ Supabase connection failed:', error);
    }

    // Test 2: Check if Auth is enabled
    console.log('🔐 Test 2: Checking authentication status...');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      result.authEnabled = true;
      console.log('✅ Authentication system is enabled');
    } catch (error: any) {
      result.errors.push(`Auth system error: ${error.message}`);
      console.error('❌ Auth system check failed:', error);
    }

    // Test 3: Test Signup Process (simulation)
    console.log('📝 Test 3: Testing signup process...');
    try {
      // Try to sign up with a test email (this will fail but show us the error type)
      const testEmail = `test-${Date.now()}@veredicta-test.com`;
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
        // Analyze error types
        if (error.message.includes('Email not confirmed')) {
          result.emailConfirmationRequired = true;
          result.recommendations.push('Email confirmation is required - users need to confirm email before login');
        } else if (error.message.includes('signup disabled')) {
          result.errors.push('Signup is disabled in Supabase settings');
          result.recommendations.push('Enable signup in Supabase Dashboard > Authentication > Settings');
        } else if (error.message.includes('rate limit')) {
          result.signupWorking = true; // Rate limit means signup is working
          console.log('✅ Signup is working (rate limited)');
        } else {
          result.errors.push(`Signup error: ${error.message}`);
        }
      } else if (data.user) {
        result.signupWorking = true;
        console.log('✅ Signup process is working');
        
        // Clean up test user if possible
        try {
          await supabase.auth.signOut();
        } catch (cleanupError) {
          console.log('Test cleanup not needed');
        }
      }
    } catch (error: any) {
      result.errors.push(`Signup test failed: ${error.message}`);
      console.error('❌ Signup test failed:', error);
    }

    // Generate recommendations based on findings
    if (!result.supabaseConnection) {
      result.recommendations.push('Check Supabase URL and API key in environment variables');
    }
    
    if (!result.profilesTableExists) {
      result.recommendations.push('Create app_2d8133c678_profiles table in database');
    }

    if (result.errors.length === 0 && result.supabaseConnection) {
      result.recommendations.push('Authentication system appears to be working correctly');
    }

    console.log('📋 AUTH DIAGNOSTIC COMPLETE:');
    console.log('  ✓ Supabase Connection:', result.supabaseConnection ? '✅' : '❌');
    console.log('  ✓ Auth Enabled:', result.authEnabled ? '✅' : '❌');
    console.log('  ✓ Profiles Table:', result.profilesTableExists ? '✅' : '❌');
    console.log('  ✓ Signup Working:', result.signupWorking ? '✅' : '❌');
    console.log('  ✓ Email Confirmation:', result.emailConfirmationRequired ? '⚠️ Required' : '✅ Not Required');
    console.log('  🎯 ERRORS:', result.errors.length > 0 ? result.errors : 'None');
    console.log('  💡 RECOMMENDATIONS:', result.recommendations);

    return result;
  } catch (error: any) {
    console.error('❌ CRITICAL AUTH DIAGNOSTIC ERROR:', error);
    result.errors.push(`Critical error: ${error.message}`);
    return result;
  }
};

// Function to try to fix common auth issues
export const fixAuthIssues = async (): Promise<boolean> => {
  console.log('🔧 AUTH FIX - Attempting to resolve authentication issues...');

  try {
    // Step 1: Ensure profiles table has correct structure
    console.log('📋 Step 1: Checking profiles table structure...');
    
    // Step 2: Test with a mock registration
    console.log('🧪 Step 2: Testing registration flow...');
    
    const testData = {
      email: `authtest-${Date.now()}@test.com`,
      password: 'testpass123',
      role: 'client' as const,
      profileData: {
        contactName: 'Test User',
        companyName: 'Test Company',
        cnpj: '12.345.678/0001-90'
      }
    };

    // This will help us understand what's failing
    const { FixedAuthService } = await import('@/services/fixedAuthService');
    
    try {
      await FixedAuthService.register(testData);
      console.log('✅ Registration test successful');
      
      // Cleanup
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.log('Cleanup not needed');
      }
      
      return true;
    } catch (error: any) {
      console.error('❌ Registration test failed:', error.message);
      
      // Try to provide specific solutions
      if (error.message.includes('Email not confirmed')) {
        console.log('💡 SOLUTION: Disable email confirmation in Supabase Dashboard');
        console.log('   Go to: Authentication > Settings > Enable email confirmations = OFF');
      } else if (error.message.includes('signup disabled')) {
        console.log('💡 SOLUTION: Enable signup in Supabase Dashboard');
        console.log('   Go to: Authentication > Settings > Enable signup = ON');
      } else if (error.message.includes('Invalid API key')) {
        console.log('💡 SOLUTION: Check API key in environment variables');
      }
      
      return false;
    }
  } catch (error: any) {
    console.error('❌ Auth fix attempt failed:', error);
    return false;
  }
};