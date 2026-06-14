/**
 * Feeding Page Visual & Functional Tests
 *
 * TL1: Feeding Page Rendering
 *   - Sidebar "Feeding" nav item exists and navigates to Feeding page
 *   - PetSelector dropdown is visible
 *   - "Today's Schedule" section present with Clock icon
 *   - Feeding timeline shows meals per pet (time + label + food + portion)
 *   - "Log Meal" and "Repeat Yesterday" buttons visible
 *
 * TL2: Pet Switching & Feeding Actions
 *   - Switch PetSelector changes feeding schedule to that pet's meals
 *     (Luna: 3 meals, Max: 2 meals, Charlie: 2 meals)
 *   - Click "Log Meal" button is clickable without page crash
 *   - Click "Repeat Yesterday" button is clickable without page crash
 */

import puppeteer from 'puppeteer'

const BASE_URL = 'http://localhost:5173'

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

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
  // TL1: FEEDING PAGE RENDERING
  // ════════════════════════════════════════════════

  // --- Test 1: Page loads ---
  console.log('\n📋 [TL1] Page Load')
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
  await sleep(1500)
  const pageTitle = await page.title()
  assert(pageTitle.includes('PettyCare'), `Page title is "${pageTitle}"`, 'TL1')

  // --- Test 2: Sidebar "Feeding" nav item exists ---
  console.log('\n📋 [TL1] Sidebar Navigation')
  const sidebarHasFeeding = await page.evaluate(() => {
    const sidebar = document.querySelector('aside') || document.querySelector('nav')
    if (!sidebar) return false
    return Array.from(sidebar.querySelectorAll('button')).some(b =>
      b.textContent?.trim() === 'Feeding'
    )
  })
  assert(sidebarHasFeeding, 'Sidebar "Feeding" nav item exists', 'TL1')

  // Navigate to Feeding page via sidebar
  await page.evaluate(() => {
    const sidebar = document.querySelector('aside') || document.querySelector('nav')
    if (!sidebar) return
    const buttons = Array.from(sidebar.querySelectorAll('button'))
    const feedingBtn = buttons.find(b => b.textContent?.trim() === 'Feeding')
    if (feedingBtn) feedingBtn.click()
  })
  await sleep(1200)

  // Verify we are on the Feeding page
  const onFeedingPage = await page.evaluate(() => {
    return document.body.innerText.includes("Today's Schedule")
  })
  assert(onFeedingPage, 'Navigated to Feeding page (shows "Today\'s Schedule")', 'TL1')

  // --- Test 3: PetSelector dropdown is visible ---
  console.log('\n📋 [TL1] PetSelector Visibility')
  const petSelectorVisible = await page.evaluate(() => {
    // The PetSelector trigger button shows the pet name inside a span
    // with class text-apple-footnote. The button lives inside a relative div.
    const selectorDiv = document.querySelector('div.relative')
    if (!selectorDiv) return false
    const triggerButton = selectorDiv.querySelector('button')
    if (!triggerButton) return false
    const nameSpan = triggerButton.querySelector('span.text-apple-footnote')
    return !!nameSpan && nameSpan.textContent !== ''
  })
  assert(petSelectorVisible, 'PetSelector dropdown with pet name is visible on Feeding page', 'TL1')

  // --- Test 4: "Today's Schedule" section present with Clock icon ---
  console.log('\n📋 [TL1] Today\'s Schedule Section')
  const bodyText = await page.evaluate(() => document.body.innerText)
  assert(bodyText.includes("Today's Schedule"), '"Today\'s Schedule" section heading is present', 'TL1')

  // Check for Clock icon (lucide-react Clock renders an SVG with a clock path)
  const clockIconExists = await page.evaluate(() => {
    const svgs = document.querySelectorAll('svg')
    return Array.from(svgs).some(svg =>
      svg.innerHTML.toLowerCase().includes('clock') ||
      svg.classList.contains('lucide-clock') ||
      // Check for standard clock path data (M12 2v20 M2 12h20 M12 6v6l4 2)
      svg.innerHTML.includes('M12 2v20') ||
      svg.innerHTML.includes('M2 12h20') ||
      svg.innerHTML.includes('M12 6v6')
    )
  })
  assert(clockIconExists, 'Clock icon is displayed next to "Today\'s Schedule" heading', 'TL1')

  // --- Test 5: Feeding timeline shows meals per pet ---
  console.log('\n📋 [TL1] Timeline Meals Display')
  // By default the first pet (Luna, id:1) is selected, which has 3 meals.
  // The timeline meals are direct children of the .space-y-3 div inside the AppleCard.
  const timelineMealCount = await page.evaluate(() => {
    const container = document.querySelector('.space-y-3')
    if (!container) return 0
    // Direct children of .space-y-3 are the meal flex rows
    return container.children.length
  })
  assert(timelineMealCount === 3, `Luna's timeline has 3 meals (${timelineMealCount})`, 'TL1')

  // Check for meal-specific elements: time format, labels, food, portion
  const mealDetails = await page.evaluate(() => {
    const body = document.body.innerText
    return {
      hasBreakfast: body.includes('Breakfast'),
      hasLunch: body.includes('Lunch'),
      hasDinner: body.includes('Dinner'),
      hasTime: /[0-2]\d:[0-5]\d/.test(body),
      hasFood: body.includes('Purina Cat Chow'),
      hasPortion: body.includes('cup'),
    }
  })
  assert(mealDetails.hasBreakfast, 'Timeline shows "Breakfast" meal label', 'TL1')
  assert(mealDetails.hasLunch, 'Timeline shows "Lunch" meal label', 'TL1')
  assert(mealDetails.hasDinner, 'Timeline shows "Dinner" meal label', 'TL1')
  assert(mealDetails.hasTime, 'Timeline shows meal times in HH:MM format', 'TL1')
  assert(mealDetails.hasFood, 'Timeline shows food name (Purina Cat Chow)', 'TL1')
  assert(mealDetails.hasPortion, 'Timeline shows portion size (cup)', 'TL1')

  // --- Test 6: "Log Meal" button visible ---
  console.log('\n📋 [TL1] Action Buttons')
  const logMealExists = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).some(b =>
      b.textContent?.includes('Log Meal')
    )
  })
  assert(logMealExists, '"Log Meal" button is visible', 'TL1')

  // --- Test 7: "Repeat Yesterday" button visible ---
  const repeatExists = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).some(b =>
      b.textContent?.includes('Repeat Yesterday')
    )
  })
  assert(repeatExists, '"Repeat Yesterday" button is visible', 'TL1')

  // --- Test 8: Recent Records section ---
  const recentRecordsExists = await page.evaluate(() => {
    return document.body.innerText.includes('Recent Records')
  })
  assert(recentRecordsExists, '"Recent Records" section is present', 'TL1')

  // --- Test 9: Timeline connector dots (green for completed meals) ---
  console.log('\n📋 [TL1] Timeline Visual Indicators')
  // All three meals for Luna have mock records, so each meal has a green dot
  // (w-3 h-3 rounded-full border-2 border-apple-green bg-apple-green) on the timeline
  const greenDots = await page.evaluate(() => {
    const container = document.querySelector('.space-y-3')
    if (!container) return 0
    // Each meal row has a div with border-apple-green class (the timeline dot)
    return container.querySelectorAll('.border-apple-green').length
  })
  assert(greenDots === 3, `Timeline shows ${greenDots} green meal status dots (expected 3)`, 'TL1')

  // ════════════════════════════════════════════════
  // TL2: PET SWITCHING & FEEDING ACTIONS
  // ════════════════════════════════════════════════

  // --- Test 10: Switch to Max (id:2) → 2 meals, no Lunch ---
  console.log('\n📋 [TL2] Switch Pet to Max')
  await page.evaluate(() => {
    // Open PetSelector dropdown by clicking the trigger button
    const selectorDiv = document.querySelector('div.relative')
    if (!selectorDiv) return
    const triggerButton = selectorDiv.querySelector('button')
    if (triggerButton) triggerButton.click()
  })
  await sleep(600)

  // Wait for dropdown and click Max
  const maxSelected = await page.evaluate(() => {
    // Find the glass-heavy dropdown panel
    const dropdown = document.querySelector('[class*="glass-heavy"]')
    if (!dropdown) return false
    // Button textContent includes emoji (e.g. "🐕Max") — use .includes for substring matching
    const maxBtn = Array.from(dropdown.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Max')
    )
    if (maxBtn) { maxBtn.click(); return true }
    return false
  })
  assert(maxSelected, 'Selected Max from PetSelector dropdown', 'TL2')
  await sleep(1000)

  // Verify Max's meal count (2 meals: Breakfast, Dinner)
  const maxMealCount = await page.evaluate(() => {
    const container = document.querySelector('.space-y-3')
    if (!container) return 0
    return container.children.length
  })
  assert(maxMealCount === 2, `Max's schedule shows 2 meals (${maxMealCount})`, 'TL2')

  // Check Max-specific meal content
  const maxBodyText = await page.evaluate(() => document.body.innerText)
  assert(maxBodyText.includes('Breakfast'), "Max's schedule includes Breakfast", 'TL2')
  assert(!maxBodyText.includes('Lunch'), "Max's schedule correctly does NOT include Lunch", 'TL2')
  assert(maxBodyText.includes('Dinner'), "Max's schedule includes Dinner", 'TL2')
  assert(maxBodyText.includes('Royal Canin Large'), "Max's meals show Royal Canin Large food", 'TL2')

  // --- Test 11: Switch to Charlie (id:5) → 2 meals, Morning/Evening ---
  console.log('\n📋 [TL2] Switch Pet to Charlie')
  await page.evaluate(() => {
    const selectorDiv = document.querySelector('div.relative')
    if (!selectorDiv) return
    const triggerButton = selectorDiv.querySelector('button')
    if (triggerButton) triggerButton.click()
  })
  await sleep(600)

  const charlieSelected = await page.evaluate(() => {
    const dropdown = document.querySelector('[class*="glass-heavy"]')
    if (!dropdown) return false
    // Button text includes emoji prefix — substring match needed
    const charlieBtn = Array.from(dropdown.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Charlie')
    )
    if (charlieBtn) { charlieBtn.click(); return true }
    return false
  })
  assert(charlieSelected, 'Selected Charlie from PetSelector dropdown', 'TL2')
  await sleep(1000)

  const charlieMealCount = await page.evaluate(() => {
    const container = document.querySelector('.space-y-3')
    if (!container) return 0
    return container.children.length
  })
  assert(charlieMealCount === 2, `Charlie's schedule shows 2 meals (${charlieMealCount})`, 'TL2')

  const charlieBodyText = await page.evaluate(() => document.body.innerText)
  assert(charlieBodyText.includes('Morning'), "Charlie's schedule includes Morning meal", 'TL2')
  assert(charlieBodyText.includes('Evening'), "Charlie's schedule includes Evening meal", 'TL2')
  assert(charlieBodyText.includes('Sunflower seeds'), "Charlie's meals show Sunflower seeds food", 'TL2')
  assert(charlieBodyText.includes('1 tbsp'), "Charlie's meals show '1 tbsp' portion", 'TL2')

  // --- Test 12: Click "Log Meal" button ---
  console.log('\n📋 [TL2] Action: Log Meal click')
  const logMealClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const logBtn = buttons.find(b => b.textContent?.includes('Log Meal'))
    if (logBtn) { logBtn.click(); return true }
    return false
  })
  assert(logMealClicked, '"Log Meal" button is clickable', 'TL2')
  await sleep(500)

  // Verify page is still functional after click
  const afterLog = await page.evaluate(() => document.body.innerText)
  assert(afterLog.includes("Today's Schedule"), 'Page stays on Feeding page after clicking "Log Meal"', 'TL2')

  // --- Test 13: Click "Repeat Yesterday" button ---
  console.log('\n📋 [TL2] Action: Repeat Yesterday click')
  const repeatClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const repeatBtn = buttons.find(b => b.textContent?.includes('Repeat Yesterday'))
    if (repeatBtn) { repeatBtn.click(); return true }
    return false
  })
  assert(repeatClicked, '"Repeat Yesterday" button is clickable', 'TL2')
  await sleep(500)

  const afterRepeat = await page.evaluate(() => document.body.innerText)
  assert(afterRepeat.includes("Today's Schedule"), 'Page stays on Feeding page after clicking "Repeat Yesterday"', 'TL2')

  // --- Test 14: Switch back to Luna and verify original meal count ---
  console.log('\n📋 [TL2] Switch back to Luna')
  await page.evaluate(() => {
    const selectorDiv = document.querySelector('div.relative')
    if (!selectorDiv) return
    const triggerButton = selectorDiv.querySelector('button')
    if (triggerButton) triggerButton.click()
  })
  await sleep(600)

  await page.evaluate(() => {
    const dropdown = document.querySelector('[class*="glass-heavy"]')
    if (!dropdown) return
    const lunaBtn = Array.from(dropdown.querySelectorAll('button')).find(b =>
      b.textContent?.trim().includes('Luna')
    )
    if (lunaBtn) lunaBtn.click()
  })
  await sleep(1000)

  const lunaMealCount = await page.evaluate(() => {
    const container = document.querySelector('.space-y-3')
    if (!container) return 0
    return container.children.length
  })
  assert(lunaMealCount === 3, `Luna's schedule restored to 3 meals (${lunaMealCount}) after switching back`, 'TL2')

  // --- Screenshot ---
  await page.screenshot({ path: 'tests/feeding-page.png', fullPage: true })
  console.log('\n📸 Screenshot saved to tests/feeding-page.png')

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
  console.log(`   TL1 (UI Rendering):          ${tl1Pass}/${tl1Total} passed`)
  console.log(`   TL2 (Pet Switch/Actions):    ${tl2Pass}/${tl2Total} passed`)
  console.log(`${'='.repeat(50)}`)

  await browser.close()
  process.exit(failed > 0 ? 1 : 0)
}

run().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})
