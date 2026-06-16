import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];

async function main() {
  // Sign in via Supabase API
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: (...args) => fetch(...args) }
  });

  console.log('Signing in...');
  const { data: { session }, error } = await supabase.auth.signInWithPassword({
    email: 'admin@admin.com',
    password: 'admin',
  });

  if (error) {
    console.log('Sign in failed:', error.message);
    // Try puppeteer login via form instead
    await loginViaForm();
    return;
  }
  console.log('Session obtained for:', session?.user?.email);
  await loginViaSession(session);
}

async function loginViaSession(session) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1];
  const storageKey = `sb-${projectRef}-auth-token`;

  // Go to app and inject session before React mounts
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: storageKey, value: session });

  await page.reload({ waitUntil: 'networkidle2', timeout: 20000 });
  await new Promise(r => setTimeout(r, 3000));
  await capture(page, browser);
}

async function loginViaForm() {
  console.log('Trying puppeteer form login...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000));

  // Type credentials
  const emailInput = await page.$('input[placeholder="Email"]');
  if (emailInput) {
    await emailInput.click({ clickCount: 3 });
    await emailInput.type('admin@admin.com', { delay: 20 });
  }
  const passwordInput = await page.$('input[placeholder="Password"]');
  if (passwordInput) {
    await passwordInput.click({ clickCount: 3 });
    await passwordInput.type('admin', { delay: 20 });
  }

  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 5000));
  await capture(page, browser);
}

async function capture(page, browser) {
  const info = await page.evaluate(() => ({
    url: window.location.href,
    headings: Array.from(document.querySelectorAll('h2, h3, [class*="title3"]'))
      .map(el => el.textContent?.trim())
      .filter(Boolean),
    glassCount: document.querySelectorAll('.glass-light, .glass, .glass-heavy').length,
    petElements: document.querySelectorAll('[class*="PetSelector"], [class*="pet"]').length,
    bodyPreview: document.body?.innerText?.substring(0, 400),
  }));
  console.log('Dashboard:', JSON.stringify(info, null, 2));

  await page.screenshot({ path: '/tmp/dashboard-app.png', fullPage: true });
  console.log('Screenshot saved to /tmp/dashboard-app.png');
  await browser.close();
}

main();
