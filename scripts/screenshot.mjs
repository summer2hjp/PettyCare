import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read env
const env = readFileSync('.env.local', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];

async function main() {
  // First, sign in via Supabase API to get a session
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: { session }, error } = await supabase.auth.signInWithPassword({
    email: 'admin@admin.com',
    password: 'admin',
  });

  if (error) {
    console.log('Supabase sign in failed:', error.message);
    // If account doesn't exist, try creating it
    console.log('Attempting to create account...');
    const { error: signUpError } = await supabase.auth.signUp({
      email: 'admin@admin.com',
      password: 'admin',
    });
    if (signUpError) {
      console.log('Sign up also failed:', signUpError.message);
      // Try with different credentials: maybe 'admin' has another email form
      console.log('Trying alternative login methods...');
    }
    console.log('Session:', null);
  } else {
    console.log('Got session for:', session?.user?.email);
  }

  // Now launch browser with the session cookie
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Set Supabase auth in localStorage (Supabase JS client reads from here)
  if (session?.access_token) {
    const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1];
    const storageKey = `sb-${projectRef}-auth-token`;

    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Set auth session in localStorage before React initializes
    await page.evaluate(({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value));
    }, { key: storageKey, value: session });

    // Reload so React picks up the session
    await page.reload({ waitUntil: 'networkidle2', timeout: 20000 });
    await new Promise(r => setTimeout(r, 3000));

    console.log('Auth set in localStorage with key:', storageKey);
  } else {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 20000 });
    await new Promise(r => setTimeout(r, 5000));
  }

  // Check what page we're on
  const pageInfo = await page.evaluate(() => ({
    url: window.location.href,
    body: document.body?.innerText?.substring(0, 400),
    headings: Array.from(document.querySelectorAll('h2, h3, [class*="title3"]'))
      .map(el => el.textContent?.trim())
      .filter(Boolean),
    glassCount: document.querySelectorAll('.glass-light, .glass, .glass-heavy').length,
    petElements: document.querySelectorAll('[class*="PetSelector"], [class*="pet"]').length,
  }));
  console.log('Dashboard info:', JSON.stringify(pageInfo, null, 2));

  await page.screenshot({ path: '/tmp/dashboard-app.png', fullPage: true });
  console.log('Screenshot saved');

  await browser.close();
}
main();
