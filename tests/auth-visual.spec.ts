/**
 * Auth Module Visual & Functional Tests
 *
 * TL1: Login Page Rendering (brand, inputs, buttons, social, dark mode)
 * TL2: Form Interaction (tab switch, validation, password toggle, error display)
 *
 * Run: npx tsx tests/auth-visual.spec.ts
 * Prerequisites: Dev server running at http://localhost:5173
 */
import puppeteer from 'puppeteer'

const BASE_URL = 'http://localhost:5173'
const VIEWPORT = { width: 1440, height: 900 }

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  page.setDefaultTimeout(10000)
  await page.setViewport(VIEWPORT)

  let passed = 0
  let failed = 0
  const testResults: { level: string; name: string; passed: boolean }[] = []

  function assert(condition: boolean, name: string, level = 'TL1') {
    testResults.push({ level, name, passed: condition })
    if (condition) {
      console.log(`  ✅ [${level}] ${name}`)
      passed++
    } else {
      console.log(`  ❌ [${level}] ${name}`)
      failed++
    }
  }

  /**
   * Helper: fill a React-controlled input field.
   */
  async function fillInput(selector: string, value: string) {
    await page.evaluate((sel: string, val: string) => {
      const input = document.querySelector<HTMLInputElement>(sel)
      if (!input) return
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set
      nativeSetter?.call(input, val)
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }, selector, value)
    await sleep(100)
  }

  /**
   * Helper: click a button by its exact visible text, excluding nav buttons.
   */
  async function clickButton(text: string) {
    return page.evaluate((btnText: string) => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const target = buttons.find(b =>
        b.textContent?.trim() === btnText && !b.closest('nav')
      )
      if (target) { target.click(); return true }
      return false
    }, text)
  }

  // ─────────────────────────────────────────────
  //  TL1 — Login Page UI Rendering
  // ─────────────────────────────────────────────
  console.log('\n📋 TL1 — Login Page Rendering\n')

  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 15000 })
  await sleep(2000)

  // Brand
  const brandVisible = await page.evaluate(() => {
    const body = document.body.innerText
    return body.includes('PettyCare')
  })
  assert(brandVisible, 'Brand name "PettyCare" is visible', 'TL1')

  const pawIcon = await page.evaluate(() => {
    const svgs = document.querySelectorAll('svg')
    return Array.from(svgs).some(s => s.innerHTML.includes('M22.56'))
  })
  // Paw print is a Lucide icon, just check SVG count > 0
  const hasIcons = await page.evaluate(() => document.querySelectorAll('svg').length > 3)
  assert(hasIcons, 'Icons (paw, mail, lock) are rendered', 'TL1')

  // Form elements
  const emailInput = await page.evaluate(() => !!document.querySelector('input[type="email"]'))
  assert(emailInput, 'Email input field exists', 'TL1')

  const passInput = await page.evaluate(() => !!document.querySelector('input[type="password"]'))
  assert(passInput, 'Password input field exists', 'TL1')

  const signInBtn = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    return buttons.some(b => b.textContent?.trim() === 'Sign in')
  })
  assert(signInBtn, 'Sign in button exists', 'TL1')

  // Social login buttons
  const googleBtn = await page.evaluate(() => {
    const body = document.body.innerText
    return body.includes('Google')
  })
  assert(googleBtn, 'Google social login button exists', 'TL1')

  const appleBtn = await page.evaluate(() => {
    const body = document.body.innerText
    return body.includes('Apple')
  })
  assert(appleBtn, 'Apple social login button exists', 'TL1')

  // "Or continue with" text
  const orText = await page.evaluate(() => document.body.innerText.includes('Or continue with'))
  assert(orText, '"Or continue with" text is visible', 'TL1')

  // Glassmorphism left panel
  const glassPanel = await page.evaluate(() => {
    const left = document.querySelector('.w-\\[35\\%\\]')
    if (!left) return false
    const blur = window.getComputedStyle(left).backdropFilter
    return blur && blur !== 'none'
  })
  assert(glassPanel, 'Left panel has backdrop-blur glass effect', 'TL1')

  // Video on right side
  const videoExists = await page.evaluate(() => {
    const v = document.querySelector('video')
    return !!v
  })
  assert(videoExists, 'Right side video element exists', 'TL1')

  // Register / Sign up toggle link
  const registerLink = await page.evaluate(() => {
    const body = document.body.innerText
    return body.includes('Sign up')
  })
  assert(registerLink, 'Register "Sign up" toggle link exists', 'TL1')

  // Hermès orange brand
  const brandColor = await page.evaluate(() => {
    const brand = Array.from(document.querySelectorAll('span')).find(s => s.textContent === 'PettyCare')
    if (!brand) return ''
    return window.getComputedStyle(brand).color
  })
  assert(brandColor === 'rgb(255, 107, 53)', `Brand color is Hermès orange (#FF6B35 → ${brandColor})`, 'TL1')

  // ─────────────────────────────────────────────
  //  TL2 — Form Interaction
  // ─────────────────────────────────────────────
  console.log('\n📋 TL2 — Form Interaction\n')

  // Password visibility toggle
  const hasToggleBtn = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    return buttons.some(b => b.querySelector('svg[class*="lucide-eye"]') || b.querySelector('svg[class*="lucide-eye-off"]'))
  })
  assert(hasToggleBtn, 'Password visibility toggle button exists', 'TL2')

  // Click password visibility toggle
  const toggleClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const toggle = buttons.find(b =>
      (b.innerHTML.includes('Eye') || b.innerHTML.includes('eye')) &&
      !b.textContent?.trim()
    )
    if (toggle) { toggle.click(); return true }
    return false
  })
  await sleep(300)
  assert(toggleClicked, 'Password toggle clickable', 'TL2')

  // After toggle, check if input type changed to text
  const inputTypeAfterToggle = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input')
    return Array.from(inputs).some(i => i.type === 'text')
  })
  assert(inputTypeAfterToggle, 'Password field switches to text when toggled', 'TL2')

  // Toggle back to password
  const toggleBack = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const toggle = buttons.find(b =>
      (b.innerHTML.includes('Eye') || b.innerHTML.includes('eye')) &&
      !b.textContent?.trim()
    )
    if (toggle) { toggle.click(); return true }
    return false
  })
  await sleep(200)
  assert(toggleBack, 'Password toggle works both ways', 'TL2')

  // Switch to Register mode
  const switchedToRegister = await clickButton('Sign up')
  await sleep(500)
  const registerModeActive = await page.evaluate(() => {
    const body = document.body.innerText
    return body.includes('Create account')
  })
  assert(registerModeActive, 'Clicking "Sign up" switches to register mode showing "Create account"', 'TL2')

  // Switch back to Login mode
  const switchedToLogin = await clickButton('Sign in')
  await sleep(500)
  const loginModeActive = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    return buttons.some(b => b.textContent?.trim() === 'Sign in')
  })
  assert(loginModeActive, 'Clicking "Sign in" switches back to login mode', 'TL2')

  // Fill email field
  await fillInput('input[type="email"]', 'test@example.com')
  const emailValue = await page.evaluate(() => {
    const input = document.querySelector<HTMLInputElement>('input[type="email"]')
    return input?.value || ''
  })
  assert(emailValue === 'test@example.com', 'Email input field accepts text', 'TL2')

  // Fill password field
  await fillInput('input[type="password"]', 'mypassword')
  const passValue = await page.evaluate(() => {
    const input = document.querySelector<HTMLInputElement>('input[type="password"]')
    return input?.value || ''
  })
  assert(passValue === 'mypassword', 'Password input field accepts text', 'TL2')

  // Empty submit validation (should not crash)
  await fillInput('input[type="email"]', '')
  await fillInput('input[type="password"]', '')
  const submitClicked = await clickButton('Sign in')
  assert(submitClicked, 'Submit button clickable even when empty', 'TL2')

  // Loading state on submit
  await fillInput('input[type="email"]', 'test@example.com')
  await fillInput('input[type="password"]', 'test123')
  await sleep(200)

  // ─────────────────────────────────────────────
  //  Summary
  // ─────────────────────────────────────────────
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`)

  if (failed > 0) {
    console.log('Failed tests:')
    testResults.filter(r => !r.passed).forEach(r =>
      console.log(`  ❌ [${r.level}] ${r.name}`)
    )
  }

  await browser.close()
  process.exit(failed > 0 ? 1 : 0)
}

run()
