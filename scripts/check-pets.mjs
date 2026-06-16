import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const env = readFileSync('.env.local', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];
const supabase = createClient(supabaseUrl, supabaseKey);

// Sign in with demo account
const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
  email: 'demo@pettycare.com',
  password: 'demo123456'
});
if (signInError) {
  console.log('Sign in failed:', signInError.message);
  // Try signup
  const { error: signUpError } = await supabase.auth.signUp({
    email: 'demo@pettycare.com',
    password: 'demo123456'
  });
  console.log('Sign up result:', signUpError?.message ?? 'Check email');
  process.exit(1);
}
console.log('Signed in as:', user?.email);

const { data: pets } = await supabase.from('pets').select('id, name, species, avatar_url');
console.log('Your pets:', JSON.stringify(pets, null, 2));

const { data: moments, error: mErr } = await supabase.from('pet_moments').select('count', { count: 'exact', head: true });
console.log('pet_moments count:', moments, mErr?.message);
