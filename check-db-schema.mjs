import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dmsodonmkffyvbuxtxec.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabaseSchema() {
  console.log('🔍 Checking database schema and tables...')
  
  try {
    // Check if we can access the profiles table with correct columns
    console.log('\n1. Testing profiles table access...')
    
    // First, let's try to select from the table to see what columns exist
    const { data, error } = await supabase
      .from('app_2d8133c678_profiles')
      .select()
      .limit(0)
    
    if (error) {
      console.log('❌ Profiles table error:', error.message)
      console.log('Error details:', JSON.stringify(error, null, 2))
    } else {
      console.log('✅ Profiles table accessible')
    }
    
    // Check all tables available
    console.log('\n2. Checking available tables...')
    
    // Try common table names
    const possibleTables = [
      'profiles',
      'user_profiles', 
      'clients',
      'writers',
      'app_2d8133c678_profiles',
      'users'
    ]
    
    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select()
          .limit(0)
        
        if (!error) {
          console.log(`✅ Table "${tableName}" exists and is accessible`)
        }
      } catch (err) {
        // Silently ignore - table doesn't exist
      }
    }
    
    // Test simple signup without profile creation
    console.log('\n3. Testing minimal user signup...')
    const testEmail = `minimal-test-${Date.now()}@example.com`
    
    const { data: minimalSignup, error: minimalError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123'
    })
    
    if (minimalError) {
      console.log('❌ Even minimal signup failed:', minimalError.message)
      console.log('This indicates a fundamental Supabase auth issue')
      
      // Check if email confirmations are required
      if (minimalError.message.includes('email')) {
        console.log('💡 Email confirmation might be required in Supabase settings')
      }
    } else {
      console.log('✅ Minimal signup successful - auth works')
      console.log('User created:', minimalSignup.user?.id)
      console.log('Email confirmed:', minimalSignup.user?.email_confirmed_at ? 'Yes' : 'No')
    }
    
    // Check Supabase auth settings
    console.log('\n4. Checking auth configuration...')
    const { data: session } = await supabase.auth.getSession()
    console.log('Current session:', session ? 'Active' : 'None')
    
  } catch (error) {
    console.error('❌ Schema check failed:', error)
  }
}

checkDatabaseSchema()