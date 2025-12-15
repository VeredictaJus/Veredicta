import { RegisterData } from '../services/fixedAuthService';

// Debug utility for registration testing
export const debugRegistration = async (formData: RegisterData) => {
  console.log('🔍 DEBUG: Starting registration process');
  console.log('📝 Form data:', JSON.stringify(formData, null, 2));
  
  // Check environment variables first
  console.log('🔍 Environment check:', {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '***exists***' : 'missing'
  });
  
  try {
    // Test Supabase connection using our configured client
    const { supabase } = await import('../lib/supabase');
    
    console.log('✅ Supabase client created');
    
    // Test basic connection
    const { data, error } = await supabase.from('app_2d8133c678_profiles').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase connection error:', error);
      return { success: false, error: 'Database connection failed: ' + error.message };
    }
    
    console.log('✅ Database connection successful');
    
    // Test user creation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          role: formData.role,
          user_type: formData.role,
          full_name: formData.profileData?.fullName || formData.profileData?.contactName || '',
        }
      }
    });
    
    if (authError) {
      console.error('❌ Auth signup error:', authError);
      return { success: false, error: authError.message };
    }
    
    console.log('✅ User auth created:', authData.user?.id);
    
    // Test profile creation
    if (authData.user) {
      const profileData = {
        id: authData.user.id,
        user_id: authData.user.id,
        email: authData.user.email!,
        user_type: formData.role,
        full_name: formData.profileData?.fullName || formData.profileData?.contactName || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: createdProfile, error: profileError } = await supabase
        .from('app_2d8133c678_profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        
        return { success: false, error: 'Profile creation failed: ' + profileError.message };
      }
      
      console.log('✅ Profile created:', createdProfile);
    }
    
    return { success: true, message: 'Registration completed successfully' };
    
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return { success: false, error: error.message };
  }
};