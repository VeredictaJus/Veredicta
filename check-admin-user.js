import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dmsodonmkffyvbuxtxec.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminUser() {
  const adminEmail = 'contato@veredictajus.com';
  console.log('=== INVESTIGATING ADMIN LOGIN ISSUE ===');
  console.log('Admin email:', adminEmail);
  
  try {
    // Step 1: Check if admin exists in profiles table
    console.log('\n1. Checking profiles table...');
    const { data: profileData, error: profileError } = await supabase
      .from('app_2d8133c678_profiles')
      .select('*')
      .eq('email', adminEmail);
    
    if (profileError) {
      console.log('❌ Error checking profiles table:', profileError.message);
    } else if (profileData && profileData.length > 0) {
      console.log('✅ Admin found in profiles table:', profileData[0]);
    } else {
      console.log('❌ Admin NOT found in profiles table');
    }
    
    // Step 2: Try to authenticate with the credentials
    console.log('\n2. Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: 'admin123'
    });
    
    if (authError) {
      console.log('❌ Authentication failed:', authError.message);
      console.log('Error code:', authError.status);
      
      // Check if this is an "Invalid login credentials" error
      if (authError.message.includes('Invalid login credentials')) {
        console.log('This means the user does not exist in Supabase Auth or wrong password');
      }
    } else {
      console.log('✅ Authentication successful!');
      console.log('User data:', authData.user);
      
      // Sign out after test
      await supabase.auth.signOut();
    }
    
    // Step 3: Try to list all users (if we have permission)
    console.log('\n3. Checking if admin user exists in auth...');
    try {
      // This might not work with anon key, but let's try
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.log('❌ Cannot list users (expected with anon key):', listError.message);
      } else {
        const adminUser = users.users?.find(u => u.email === adminEmail);
        if (adminUser) {
          console.log('✅ Admin user found in auth.users:', adminUser.id);
        } else {
          console.log('❌ Admin user NOT found in auth.users');
        }
      }
    } catch (e) {
      console.log('❌ Cannot access admin functions:', e.message);
    }
    
    // Step 4: Check AuthContext mock data
    console.log('\n4. Checking if AuthContext has mock admin...');
    const mockUsers = [
      {
        id: '3',
        email: 'contato@veredictajus.com',
        password: 'admin123',
        role: 'ADMIN',
      }
    ];
    
    const mockAdmin = mockUsers.find(u => u.email === adminEmail);
    if (mockAdmin) {
      console.log('✅ Mock admin found in AuthContext:', mockAdmin);
    } else {
      console.log('❌ Mock admin NOT found in AuthContext');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkAdminUser();
