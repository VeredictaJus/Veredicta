import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dmsodonmkffyvbuxtxec.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test basic connection
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('✅ Supabase auth connection successful')
    
    // Test database connection by checking if profiles table exists
    const { data: profiles, error: profilesError } = await supabase
      .from('app_2d8133c678_profiles')
      .select('*')
      .limit(1)
    
    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError.message)
      console.log('Error details:', JSON.stringify(profilesError, null, 2))
    } else {
      console.log('✅ Profiles table accessible, found', profiles?.length || 0, 'records')
    }
    
    // Test user registration
    console.log('🔍 Testing user registration...')
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'testpassword123'
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          role: 'client',
          user_type: 'client'
        }
      }
    })
    
    if (signupError) {
      console.log('❌ Registration test failed:', signupError.message)
      console.log('Error details:', JSON.stringify(signupError, null, 2))
    } else {
      console.log('✅ Test registration successful')
      console.log('User ID:', signupData.user?.id)
      console.log('User email:', signupData.user?.email)
      console.log('User confirmed:', signupData.user?.email_confirmed_at ? 'Yes' : 'No')
    }
    
    // Check existing users (if accessible)
    console.log('🔍 Checking existing profiles...')
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('app_2d8133c678_profiles')
      .select('email, nome_empresa')
      .limit(5)
    
    if (allProfilesError) {
      console.log('❌ Could not fetch profiles:', allProfilesError.message)
    } else {
      console.log('✅ Found', allProfiles?.length || 0, 'existing profiles')
      allProfiles?.forEach((profile, i) => {
        console.log(`  ${i + 1}. ${profile.email} - ${profile.nome_empresa}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error)
  }
}

testSupabaseConnection()