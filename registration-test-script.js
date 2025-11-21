
// MANUAL REGISTRATION TEST SCRIPT
// Run this in browser console on /auth/register page

console.log('🧪 Testing Registration System...');

// Test 1: Check environment variables
console.log('1. Environment Check:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

// Test 2: Check Supabase connection
import { supabase } from '@/lib/supabase';
console.log('2. Supabase Client:', supabase);

// Test 3: Try simple auth check
try {
  const { data, error } = await supabase.auth.getUser();
  console.log('3. Auth Check - Data:', data, 'Error:', error);
} catch (e) {
  console.error('3. Auth Check Failed:', e);
}

// Test 4: Check table access
try {
  const { data, error } = await supabase.from('app_2d8133c678_profiles').select('*').limit(1);
  console.log('4. Table Access - Data:', data, 'Error:', error);
} catch (e) {
  console.error('4. Table Access Failed:', e);
}

console.log('🧪 Registration test completed. Check results above.');
