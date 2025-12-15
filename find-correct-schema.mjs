import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dmsodonmkffyvbuxtxec.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function findCorrectSchema() {
  console.log('🔍 Finding correct table schema...')
  
  try {
    // Try inserting with just basic fields that should exist in any table
    const basicFields = ['id', 'created_at', 'updated_at', 'email']
    
    for (const field of basicFields) {
      try {
        const testData = { [field]: field === 'email' ? 'test@example.com' : 'test_value' }
        
        const { data, error } = await supabase
          .from('app_2d8133c678_profiles')
          .insert(testData)
          .select()
        
        if (!error) {
          console.log(`✅ Field '${field}' works!`)
        } else {
          console.log(`❌ Field '${field}' failed: ${error.message}`)
        }
      } catch (err) {
        console.log(`❌ Field '${field}' error:`, err.message)
      }
    }
    
    // Try to understand the table by examining the error messages
    console.log('\n🔍 Testing different field combinations...')
    
    // Common profile field names to test
    const commonFields = [
      'name', 'full_name', 'nome', 'nome_completo',
      'company', 'company_name', 'empresa', 'nome_empresa',
      'document', 'cpf', 'cnpj', 'documento',
      'phone', 'telefone', 'celular',
      'address', 'endereco', 'endereço',
      'user_id', 'usuario_id', 'auth_id'
    ]
    
    for (const field of commonFields) {
      try {
        const testData = { [field]: 'test_value' }
        
        const { error } = await supabase
          .from('app_2d8133c678_profiles')
          .insert(testData)
        
        if (error && !error.message.includes(`Could not find the '${field}' column`)) {
          console.log(`✅ Field '${field}' exists (got different error: ${error.message.substring(0, 50)}...)`)
        }
      } catch (err) {
        // Silent - we're just testing
      }
    }
    
    // Try the users table instead
    console.log('\n🔍 Testing users table...')
    try {
      const { data, error } = await supabase
        .from('users')
        .select()
        .limit(1)
      
      if (!error) {
        console.log('✅ Users table accessible')
        if (data && data.length > 0) {
          console.log('Users table structure:', Object.keys(data[0]))
        }
      } else {
        console.log('❌ Users table error:', error.message)
      }
    } catch (err) {
      console.log('❌ Users table failed:', err.message)
    }
    
    // Try the profiles table
    console.log('\n🔍 Testing profiles table...')
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select()
        .limit(1)
      
      if (!error) {
        console.log('✅ Profiles table accessible')
        if (data && data.length > 0) {
          console.log('Profiles table structure:', Object.keys(data[0]))
        }
      } else {
        console.log('❌ Profiles table error:', error.message)
      }
    } catch (err) {
      console.log('❌ Profiles table failed:', err.message)
    }
    
  } catch (error) {
    console.error('❌ Schema discovery failed:', error)
  }
}

findCorrectSchema()