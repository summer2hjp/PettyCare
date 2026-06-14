/**
 * Settings Page Visual & Functional Tests
 *
 * Verifies the Settings page renders correctly with all sections
 * (Appearance, Notifications, Privacy) and toggle interactions
 * (Dark Mode, Push Notifications, Email Reminders, Medication Reminders).
 */

import puppeteer from 'puppeteer'

const BASE_URL = 'http://localhost:5173'

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  page.setDefaultTimeout(10000)
  await page.setViewport({ width: 1440, height: 900 })

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

  // ════════════════════════════════════════════════
  // TL1: SETTINGS PAGE RENDERING
  // ════════════════════════════════════════════════

  // ─── Test 1: Page loads ───
  console.log('\n📋 [TL1] Settings Page Load')
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
  await sleep(1000)
  const title = await page.title()
  assert(title.includes('PettyCare'), `Page title is "${title}"`, 'TL1')

  // ─── Test 2: Sidebar "Settings" nav item exists ───
  console.log('\n📋 [TL1] Sidebar "Settings" Nav Item')
  const sidebarHasSettings = await page.evaluate(() => {
    const sidebar = document.querySelector('aside')
    if (!sidebar) return false
    const buttons = Array.from(sidebar.querySelectorAll('button'))
    return buttons.some(b => b.textContent?.trim() === 'Settings')
  })
  assert(sidebarHasSettings, 'Sidebar "Settings" nav item exists', 'TL1')

  // Navigate to Settings page via sidebar
  await page.evaluate(() => {
    const sidebar = document.querySelector('aside')
    if (!sidebar) return
    const buttons = Array.from(sidebar.querySelectorAll('button'))
    const settingsBtn = buttons.find(b => b.textContent?.trim() === 'Settings')
    if (settingsBtn) settingsBtn.click()
  })
  await sleep(1000)

  const bodyText = await page.evaluate(() => document.body.innerText)

  // ─── Test 3: "Settings" heading is visible ───
  console.log('\n📋 [TL1] Settings Page Content')
  assert(bodyText.includes('Settings'), 'Settings page heading is visible', 'TL1')

  // ─── Test 4: "Appearance" section with title and Dark Mode toggle ───
  console.log('\n📋 [TL1] Appearance Section')
  assert(bodyText.includes('Appearance'), 'Has "Appearance" section heading', 'TL1')
  assert(bodyText.includes('Dark Mode'), 'Has "Dark Mode" label', 'TL1')
  // Verify the Dark Mode row contains an AppleSwitch (hidden checkbox input)
  const hasDarkModeSwitch = await page.evaluate(() => {
    const groups = Array.from(document.querySelectorAll('.group'))
    const darkModeRow = groups.find(el => el.textContent?.includes('Dark Mode'))
    if (!darkModeRow) return false
    return !!darkModeRow.querySelector('input[type="checkbox"].sr-only')
  })
  assert(hasDarkModeSwitch, 'Dark Mode toggle (AppleSwitch) exists in Appearance section', 'TL1')

  // ─── Test 5: "Notifications" section with title and toggles ───
  console.log('\n📋 [TL1] Notifications Section')
  assert(bodyText.includes('Notifications'), 'Has "Notifications" section heading', 'TL1')
  assert(bodyText.includes('Push Notifications'), 'Has "Push Notifications" toggle', 'TL1')
  assert(bodyText.includes('Email Reminders'), 'Has "Email Reminders" toggle', 'TL1')
  assert(bodyText.includes('Medication Reminders'), 'Has "Medication Reminders" toggle', 'TL1')

  // Verify notification rows contain AppleSwitch components
  const notificationSwitches = await page.evaluate(() => {
    const groups = Array.from(document.querySelectorAll('.group'))
    const pushRow = groups.find(el => el.textContent?.includes('Push Notifications'))
    const emailRow = groups.find(el => el.textContent?.includes('Email Reminders'))
    const medRow = groups.find(el => el.textContent?.includes('Medication Reminders'))
    return {
      push: !!pushRow?.querySelector('input[type="checkbox"].sr-only'),
      email: !!emailRow?.querySelector('input[type="checkbox"].sr-only'),
      medication: !!medRow?.querySelector('input[type="checkbox"].sr-only'),
    }
  })
  assert(notificationSwitches.push, 'Push Notifications has AppleSwitch', 'TL1')
  assert(notificationSwitches.email, 'Email Reminders has AppleSwitch', 'TL1')
  assert(notificationSwitches.medication, 'Medication Reminders has AppleSwitch', 'TL1')

  // ─── Test 6: "Privacy" section with title and description ───
  console.log('\n📋 [TL1] Privacy Section')
  assert(bodyText.includes('Privacy'), 'Has "Privacy" section heading', 'TL1')
  assert(bodyText.includes('Data Sharing'), 'Has "Data Sharing" row', 'TL1')
  assert(bodyText.includes('Export Data'), 'Has "Export Data" row', 'TL1')

  // ─── Test 7: "About" section is rendered ───
  console.log('\n📋 [TL1] About Section')
  assert(bodyText.includes('About'), 'Has "About" section heading', 'TL1')
  assert(bodyText.includes('Version'), 'Has "Version" row', 'TL1')
  assert(bodyText.includes('PettyCare'), 'Has "PettyCare" row (species emoji)', 'TL1')

  // ─── Test 8: Sign Out button exists ───
  console.log('\n📋 [TL1] Sign Out Button')
  assert(bodyText.includes('Sign Out'), 'Has "Sign Out" button', 'TL1')

  // ─── Test 9: User avatar card ───
  console.log('\n📋 [TL1] User Profile Card')
  assert(bodyText.includes('Pet Parent'), 'Has "Pet Parent" user name', 'TL1')
  assert(bodyText.includes('Premium Member'), 'Has "Premium Member" badge', 'TL1')

  // ─── Screenshot ───
  await page.screenshot({ path: 'tests/settings-page.png', fullPage: true })
  console.log('\n📸 Screenshot saved to tests/settings-page.png')

  // ════════════════════════════════════════════════
  // TL2: TOGGLE INTERACTIONS
  // ════════════════════════════════════════════════

  /**
   * Helper: find the AppleSwitch hidden checkbox inside a SettingRow
   * whose text content includes the given label, and return its checked state.
   */
  async function getCheckboxInRow(labelText: string): Promise<boolean | null> {
    return page.evaluate((text: string) => {
      const groups = Array.from(document.querySelectorAll('.group'))
      const row = groups.find(el => el.textContent?.includes(text))
      if (!row) return null
      const checkbox = row.querySelector('input[type="checkbox"]') as HTMLInputElement | null
      return checkbox ? checkbox.checked : null
    }, labelText)
  }

  /**
   * Helper: click the AppleSwitch hidden checkbox inside a SettingRow
   * whose text content includes the given label.
   */
  async function clickCheckboxInRow(labelText: string): Promise<void> {
    await page.evaluate((text: string) => {
      const groups = Array.from(document.querySelectorAll('.group'))
      const row = groups.find(el => el.textContent?.includes(text))
      if (!row) return
      const checkbox = row.querySelector('input[type="checkbox"]') as HTMLInputElement | null
      if (checkbox) {
        checkbox.click()
      }
    }, labelText)
  }

  // ─── Test 10: Click Dark Mode toggle → theme switches to dark ───
  console.log('\n📋 [TL2] Dark Mode Toggle - Enable Dark Mode')

  // Read initial theme state
  const initialIsDark = await page.evaluate(() =>
    document.documentElement.classList.contains('dark')
  )
  console.log(`  ℹ️  Initial state - .dark class present: ${initialIsDark}`)

  // Ensure we are in light mode to get baseline CSS vars
  if (initialIsDark) {
    await clickCheckboxInRow('Dark Mode')
    await sleep(600)
  }

  // Read actual light-mode CSS variables
  const lightCssVars = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement)
    return {
      bg: style.getPropertyValue('--apple-systemBackground').trim(),
      label: style.getPropertyValue('--apple-label').trim(),
      secondaryLabel: style.getPropertyValue('--apple-secondaryLabel').trim(),
    }
  })
  console.log(`  ℹ️  Light mode CSS vars: bg="${lightCssVars.bg}", label="${lightCssVars.label}"`)

  // Verify we're actually in light mode
  const isLight = await page.evaluate(() =>
    !document.documentElement.classList.contains('dark')
  )
  assert(isLight, 'Page is in light mode before toggling to dark', 'TL2')

  // Toggle to dark mode
  await clickCheckboxInRow('Dark Mode')
  await sleep(600) // Wait for 400ms transition + buffer

  const isDarkAfterToggle = await page.evaluate(() =>
    document.documentElement.classList.contains('dark')
  )
  assert(isDarkAfterToggle, 'Dark mode enabled: .dark class present on <html>', 'TL2')

  // Verify CSS variables changed in dark mode
  const darkCssVars = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement)
    return {
      bg: style.getPropertyValue('--apple-systemBackground').trim(),
      label: style.getPropertyValue('--apple-label').trim(),
      secondaryLabel: style.getPropertyValue('--apple-secondaryLabel').trim(),
    }
  })
  const varsChanged = darkCssVars.bg !== lightCssVars.bg ||
    darkCssVars.label !== lightCssVars.label
  assert(varsChanged, `CSS variables changed between themes (light bg="${lightCssVars.bg}" vs dark bg="${darkCssVars.bg}")`, 'TL2')
  console.log(`  ℹ️  Dark mode CSS vars: bg="${darkCssVars.bg}", label="${darkCssVars.label}"`)

  // ─── Test 11: Dark Mode toggle state synced ───
  console.log('\n📋 [TL2] Dark Mode Switch Checked State')
  const darkSwitchChecked = await getCheckboxInRow('Dark Mode')
  assert(darkSwitchChecked === true, `Dark Mode AppleSwitch checked state is ${darkSwitchChecked} (expected true)`, 'TL2')

  // ─── Test 12: Click Dark Mode toggle again → switches back to light ───
  console.log('\n📋 [TL2] Dark Mode Toggle - Disable Dark Mode')
  await clickCheckboxInRow('Dark Mode')
  await sleep(600)

  const isLightAfterToggle = await page.evaluate(() =>
    !document.documentElement.classList.contains('dark')
  )
  assert(isLightAfterToggle, 'Dark mode disabled: .dark class removed from <html>', 'TL2')

  // Verify the AppleSwitch is unchecked
  const darkSwitchUnchecked = await getCheckboxInRow('Dark Mode')
  assert(darkSwitchUnchecked === false, `Dark Mode AppleSwitch unchecked after toggle back (got ${darkSwitchUnchecked})`, 'TL2')

  // ─── Test 13: Click Push Notifications toggle → state changes ───
  console.log('\n📋 [TL2] Push Notifications Toggle')

  const initialPushState = await getCheckboxInRow('Push Notifications')
  console.log(`  ℹ️  Initial Push Notifications state: ${initialPushState}`)

  // Toggle ON
  await clickCheckboxInRow('Push Notifications')
  await sleep(300)

  const afterFirstPushToggle = await getCheckboxInRow('Push Notifications')
  assert(
    afterFirstPushToggle !== null && afterFirstPushToggle !== initialPushState,
    `Push Notifications toggled from ${initialPushState} to ${afterFirstPushToggle}`,
    'TL2'
  )

  // Toggle back to original
  await clickCheckboxInRow('Push Notifications')
  await sleep(300)
  const afterSecondPushToggle = await getCheckboxInRow('Push Notifications')
  assert(
    afterSecondPushToggle === initialPushState,
    `Push Notifications returned to original state (${afterSecondPushToggle})`,
    'TL2'
  )

  // ─── Test 14: Click Email Reminders toggle → state changes ───
  console.log('\n📋 [TL2] Email Reminders Toggle')
  const initialEmailState = await getCheckboxInRow('Email Reminders')
  console.log(`  ℹ️  Initial Email Reminders state: ${initialEmailState}`)

  await clickCheckboxInRow('Email Reminders')
  await sleep(300)

  const afterEmailToggle = await getCheckboxInRow('Email Reminders')
  assert(
    afterEmailToggle !== null && afterEmailToggle !== initialEmailState,
    `Email Reminders toggled from ${initialEmailState} to ${afterEmailToggle}`,
    'TL2'
  )

  // Restore original
  await clickCheckboxInRow('Email Reminders')
  await sleep(300)

  // ─── Test 15: Click Medication Reminders toggle → state changes ───
  console.log('\n📋 [TL2] Medication Reminders Toggle')
  const initialMedState = await getCheckboxInRow('Medication Reminders')
  console.log(`  ℹ️  Initial Medication Reminders state: ${initialMedState}`)

  await clickCheckboxInRow('Medication Reminders')
  await sleep(300)

  const afterMedToggle = await getCheckboxInRow('Medication Reminders')
  assert(
    afterMedToggle !== null && afterMedToggle !== initialMedState,
    `Medication Reminders toggled from ${initialMedState} to ${afterMedToggle}`,
    'TL2'
  )

  // ─── Final screenshot ───
  await page.screenshot({ path: 'tests/settings-after-interaction.png', fullPage: true })
  console.log('\n📸 Post-interaction screenshot saved to tests/settings-after-interaction.png')

  // ════════════════════════════════════════════════
  // SUMMARY
  // ════════════════════════════════════════════════
  console.log(`\n${'='.repeat(50)}`)
  console.log(`📊 Results: ${passed} passed, ${failed} failed`)
  const tl1Total = testResults.filter(r => r.level === 'TL1').length
  const tl2Total = testResults.filter(r => r.level === 'TL2').length
  const tl1Pass = testResults.filter(r => r.level === 'TL1' && r.passed).length
  const tl2Pass = testResults.filter(r => r.level === 'TL2' && r.passed).length
  console.log(`📋 By Test Level:`)
  console.log(`   TL1 (UI Rendering):         ${tl1Pass}/${tl1Total} passed`)
  console.log(`   TL2 (Toggle Interactions):  ${tl2Pass}/${tl2Total} passed`)
  console.log(`${'='.repeat(50)}`)

  await browser.close()
  process.exit(failed > 0 ? 1 : 0)
}

run().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})
