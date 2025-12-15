// Script to create admin user using Supabase
import { supabase } from './src/lib/supabase.js';

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // 1. Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'contato@veredictajus.com',
      password: 'admin123',
      email_confirm: true
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }

    console.log('Auth user created:', authData.user.id);

    // 2. Create profile in profiles table
    const { error: profileError } = await supabase
      .from('app_2d8133c678_profiles')
      .insert({
        user_id: authData.user.id,
        email: 'contato@veredictajus.com',
        role: 'admin'
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return;
    }

    console.log('Admin user created successfully!');
    console.log('Email: contato@veredictajus.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

createAdminUser();