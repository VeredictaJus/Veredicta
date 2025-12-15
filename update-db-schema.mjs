import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dmsodonmkffyvbuxtxec.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateDatabaseSchema() {
  console.log('🔍 Checking and updating database schema...')
  
  try {
    // Test current table structure
    const { data: testData, error: testError } = await supabase
      .from('app_2d8133c678_profiles')
      .select()
      .limit(0)
    
    console.log('✅ Table exists and is accessible')
    
    // Test inserting a sample profile to see what columns work
    console.log('\n🔍 Testing profile insertion...')
    
    const sampleProfile = {
      user_id: 'test_' + Date.now(),
      email: 'test@example.com',
      company_name: 'Test Company',
      cnpj: '12.345.678/0001-00',
      contact_person: 'Test Person',
      phone: '(11) 99999-9999',
      role: 'client',
      created_at: new Date().toISOString()
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('app_2d8133c678_profiles')
      .insert(sampleProfile)
      .select()
    
    if (insertError) {
      console.log('❌ Insert failed with current schema:', insertError.message)
      console.log('Error details:', JSON.stringify(insertError, null, 2))
      
      // Try with different column names
      console.log('\n🔄 Trying alternative column names...')
      
      const altProfile = {
        user_id: 'test_alt_' + Date.now(),
        email: 'test-alt@example.com',
        nome_empresa: 'Test Company',
        cnpj: '12.345.678/0001-00',
        pessoa_contato: 'Test Person',
        telefone: '(11) 99999-9999',
        role: 'client',
        created_at: new Date().toISOString()
      }
      
      const { data: altData, error: altError } = await supabase
        .from('app_2d8133c678_profiles')
        .insert(altProfile)
        .select()
      
      if (altError) {
        console.log('❌ Alternative insert also failed:', altError.message)
        
        // Try minimal insert to find required columns
        console.log('\n🔄 Trying minimal insert...')
        
        const minProfile = {
          user_id: 'test_min_' + Date.now(),
          email: 'test-min@example.com'
        }
        
        const { data: minData, error: minError } = await supabase
          .from('app_2d8133c678_profiles')
          .insert(minProfile)
          .select()
        
        if (minError) {
          console.log('❌ Even minimal insert failed:', minError.message)
        } else {
          console.log('✅ Minimal insert successful!')
          console.log('Inserted data:', minData)
        }
      } else {
        console.log('✅ Alternative insert successful!')
        console.log('Inserted data:', altData)
      }
    } else {
      console.log('✅ Insert successful with current schema!')
      console.log('Inserted data:', insertData)
    }
    
    // Check existing data structure
    console.log('\n🔍 Checking existing data structure...')
    const { data: existing, error: existingError } = await supabase
      .from('app_2d8133c678_profiles')
      .select()
      .limit(5)
    
    if (!existingError && existing && existing.length > 0) {
      console.log('✅ Found existing data:')
      console.log('Columns in first record:', Object.keys(existing[0]))
      existing.forEach((record, i) => {
        console.log(`Record ${i + 1}:`, JSON.stringify(record, null, 2))
      })
    } else {
      console.log('📝 No existing data found')
    }
    
  } catch (error) {
    console.error('❌ Schema update failed:', error)
  }
}

updateDatabaseSchema()