import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const env = readFileSync('.env.local', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];
const supabase = createClient(supabaseUrl, supabaseKey);

const { data: tables, error: tablesError } = await supabase
  .rpc('get_tables' in supabase ? 'get_tables' : 'version');
console.log('Tables check not available via anon key');

// Try to select from pet_moments
const { data: moments, error: momentsError } = await supabase
  .from('pet_moments')
  .select('count', { count: 'exact', head: true });
console.log('Moments count:', moments, 'Error:', momentsError?.message);

// Try to select actual moments
const { data: sample, error: sampleError } = await supabase
  .from('pet_moments')
  .select('*')
  .limit(3);
console.log('Sample:', JSON.stringify(sample), 'Error:', sampleError?.message);

// Check pets
const { data: pets } = await supabase.from('pets').select('id, name');
console.log('Pets:', JSON.stringify(pets));
