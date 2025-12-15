import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dmsodonmkffyvbuxtxec.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ0OTU0NiwiZXhwIjoyMDY5MDI1NTQ2fQ.QErUMIkIdUXXQ1gCg4jYwKm4w7WVdQHCEb8OJ8dCJR4'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUsers() {
  console.log('🔧 Criando usuários de teste...')

  const testUsers = [
    {
      email: 'contato@veredictajus.com',
      password: 'admin123',
      role: 'admin',
      user_metadata: {
        role: 'admin',
        name: 'Administrador Veredicta'
      }
    },
    {
      email: 'cliente@escritorio.com',
      password: '123456',
      role: 'client',
      user_metadata: {
        role: 'client',
        name: 'Cliente Demonstração',
        company: 'Escritório Advocacia Demo'
      }
    },
    {
      email: 'redator@juridico.com',
      password: '123456',
      role: 'writer',
      user_metadata: {
        role: 'writer',
        name: 'Redator Jurídico Demo'
      }
    }
  ]

  for (const userData of testUsers) {
    try {
      console.log(`Criando usuário: ${userData.email}`)
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: userData.user_metadata,
        email_confirm: true
      })

      if (error) {
        console.error(`❌ Erro ao criar ${userData.email}:`, error.message)
      } else {
        console.log(`✅ Usuário ${userData.email} criado com sucesso!`)
        console.log(`   ID: ${data.user.id}`)
      }
    } catch (err) {
      console.error(`❌ Erro inesperado para ${userData.email}:`, err)
    }
  }

  console.log('✅ Processo de criação de usuários finalizado!')
}

createTestUsers()