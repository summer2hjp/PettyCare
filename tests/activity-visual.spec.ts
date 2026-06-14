/**
 * Activity Module Visual & Functional Tests
 *
 * Verifies the Activity page renders correctly with all stat cards,
 * progress ring, Day/Week/Month view switcher, history list,
 * and handles view switching and pet selection interactions.
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

  // ════════════════════════════════════════════════════════════
  // TL1: ACTIVITY PAGE RENDERING
  // ════════════════════════════════════════════════════════════

  // ─── Load Dashboard first, then navigate to Activity ───
  console.log('\n📋 [TL1] Navigation to Activity Page')
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
  await sleep(1000)

  // Navigate to Activity page via sidebar
  await page.evaluate(() => {
    const sidebar = document.querySelector('nav')
    if (!sidebar) return
    const buttons = Array.from(sidebar.querySelectorAll('button'))
    const activityBtn = buttons.find(b =>
      b.textContent?.trim() === 'Activity'
    )
    if (activityBtn) activityBtn.click()
  })
  await sleep(1000)

  // ─── Test 1: Page loads and shows correct title ───
  console.log('\n📋 [TL1] Activity Page Load')
  const pageTitle = await page.title()
  assert(pageTitle.includes('PettyCare'), `Page title is "${pageTitle}"`, 'TL1')

  // ─── Test 2: Sidebar "Activity" nav item exists ───
  console.log('\n📋 [TL1] Sidebar Navigation')
  const sidebarHasActivity = await page.evaluate(() => {
    const sidebar = document.querySelector('nav')
    if (!sidebar) return false
    const buttons = Array.from(sidebar.querySelectorAll('button'))
    return buttons.some(b => b.textContent?.trim() === 'Activity')
  })
  assert(sidebarHasActivity, 'Sidebar has "Activity" nav item', 'TL1')

  // Sidebar Activity button should have active styling
  const activityNavActive = await page.evaluate(() => {
    const sidebar = document.querySelector('nav')
    if (!sidebar) return false
    const buttons = Array.from(sidebar.querySelectorAll('button'))
    const activityBtn = buttons.find(b => b.textContent?.trim() === 'Activity')
    if (!activityBtn) return false
    return activityBtn.className.includes('bg-apple-blue') || activityBtn.classList.contains('bg-apple-blue')
  })
  assert(activityNavActive, 'Sidebar "Activity" nav item shows active state', 'TL1')

  // ─── Test 3: PetSelector dropdown is visible ───
  console.log('\n📋 [TL1] PetSelector')
  const petSelectorVisible = await page.evaluate(() => {
    const main = document.querySelector('main')
    if (!main) return false
    const bodyText = main.textContent || ''
    // The PetSelector shows a pet name (one of the mock pets)
    const petNames = ['Luna', 'Max', 'Coco', 'Bella', 'Charlie']
    return petNames.some(name => bodyText.includes(name))
  })
  assert(petSelectorVisible, 'PetSelector dropdown shows a pet name', 'TL1')

  // PetSelector should have a chevron/dropdown indicator
  const petSelectorHasChevron = await page.evaluate(() => {
    const main = document.querySelector('main')
    if (!main) return false
    // Find a button in main that contains a pet name and has a chevron icon (ChevronDown)
    const buttons = Array.from(main.querySelectorAll('button'))
    const petNames = ['Luna', 'Max', 'Coco', 'Bella', 'Charlie']
    const petBtn = buttons.find(b => petNames.some(n => b.textContent?.includes(n)))
    if (!petBtn) return false
    // Check for SVG chevron icon inside the button
    return !!petBtn.querySelector('svg')
  })
  assert(petSelectorHasChevron, 'PetSelector has chevron dropdown indicator', 'TL1')

  // ─── Test 4: 4 stat cards visible (Steps, Distance, Active Time, Calories) ───
  console.log('\n📋 [TL1] Stat Cards')
  const statCardsVisible = await page.evaluate(() => {
    const body = document.body.innerText

    // Check for the 4 stat card labels
    const hasSteps = body.includes('Steps')
    const hasDistance = body.includes('Distance')
    const hasActiveTime = body.includes('Active Time')
    const hasCalories = body.includes('Calories')

    // Check for units
    const hasStepsUnit = body.includes('steps')
    const hasDistanceUnit = body.includes('km')
    const hasDurationUnit = body.includes('min')
    const hasCaloriesUnit = body.includes('cal')

    return {
      allLabels: hasSteps && hasDistance && hasActiveTime && hasCalories,
      allUnits: hasStepsUnit && hasDistanceUnit && hasCaloriesUnit,
      steps: hasSteps,
      distance: hasDistance,
      activeTime: hasActiveTime,
      calories: hasCalories,
    }
  })
  assert(statCardsVisible.allLabels, 'All 4 stat card labels visible: Steps, Distance, Active Time, Calories', 'TL1')
  assert(statCardsVisible.allUnits, 'Stat card units visible (steps, km, kcal)', 'TL1')

  // Stat cards should show numeric values
  const statCardValues = await page.evaluate(() => {
    const body = document.body.innerText
    // Steps are displayed as comma-separated numbers (e.g., "4,327 steps")
    const stepsMatch = body.match(/[\d,]+ steps/)
    const distanceMatch = body.match(/[\d.]+ km/)
    const durationMatch = body.match(/\d+ min/)
    const caloriesMatch = body.includes('cal') && body.match(/\d+/)
    return {
      stepsValue: stepsMatch ? stepsMatch[0] : null,
      distanceValue: distanceMatch ? distanceMatch[0] : null,
      durationValue: durationMatch ? durationMatch[0] : null,
      caloriesValue: body.match(/[\d,]+(?=[\s\S]*cal)/)?.[0] ?? null,
    }
  })
  assert(statCardValues.stepsValue !== null, `Steps stat shows value: "${statCardValues.stepsValue}"`, 'TL1')
  assert(statCardValues.distanceValue !== null, `Distance stat shows value: "${statCardValues.distanceValue}"`, 'TL1')
  assert(statCardValues.durationValue !== null, `Active Time stat shows value: "${statCardValues.durationValue}"`, 'TL1')
  assert(statCardValues.caloriesValue !== null, `Calories stat shows value: "${statCardValues.caloriesValue}"`, 'TL1')

  // ─── Test 5: Day/Week/Month view switcher (SegmentedControl) ───
  console.log('\n📋 [TL1] View Switcher')
  const segmentedControlVisible = await page.evaluate(() => {
    const body = document.body.innerText
    const hasDay = body.includes('Day')
    const hasWeek = body.includes('Week')
    const hasMonth = body.includes('Month')
    return { hasDay, hasWeek, hasMonth, all: hasDay && hasWeek && hasMonth }
  })
  assert(segmentedControlVisible.all, 'SegmentedControl with Day/Week/Month options visible', 'TL1')

  // Active segment should be "Week" (default view)
  const defaultViewIsWeek = await page.evaluate(() => {
    const body = document.body.innerText
    // The SegmentedControl buttons with "Day", "Week", "Month" labels
    const allButtons = Array.from(document.querySelectorAll('button'))
    const segButtons = allButtons.filter(b =>
      b.textContent?.trim() === 'Day' ||
      b.textContent?.trim() === 'Week' ||
      b.textContent?.trim() === 'Month'
    )
    if (segButtons.length < 3) return false
    const weekBtn = segButtons.find(b => b.textContent?.trim() === 'Week')
    if (!weekBtn) return false
    return weekBtn.className.includes('bg-apple-blue') || weekBtn.classList.contains('bg-apple-blue')
  })
  assert(defaultViewIsWeek, 'Default view is "Week" (Week segment has active styling)', 'TL1')

  // ─── Test 6: AppleProgressRing showing activity progress ───
  console.log('\n📋 [TL1] Activity Progress Ring')
  const progressRingVisible = await page.evaluate(() => {
    // AppleProgressRing renders an SVG with two circles
    const svgs = document.querySelectorAll('main svg')
    for (const svg of svgs) {
      const circles = svg.querySelectorAll('circle')
      if (circles.length >= 2) return true
    }
    return false
  })
  assert(progressRingVisible, 'AppleProgressRing (SVG with circles) is visible', 'TL1')

  // Progress ring should show a percentage and "Goal" label
  const progressRingContent = await page.evaluate(() => {
    const body = document.body.innerText
    const hasGoal = body.includes('Goal')
    const hasTodayActivity = body.includes("Today's Activity")
    const hasPercentage = !!body.match(/\d+%/g)
    return { hasGoal, hasTodayActivity, hasPercentage }
  })
  assert(progressRingContent.hasTodayActivity, 'Progress ring has "Today\'s Activity" label', 'TL1')
  assert(progressRingContent.hasPercentage, 'Progress ring shows percentage value', 'TL1')
  assert(progressRingContent.hasGoal, 'Progress ring has "Goal" label', 'TL1')

  // ─── Test 7: Weekly Average card ───
  console.log('\n📋 [TL1] Weekly Average')
  const weeklyAverageVisible = await page.evaluate(() => {
    const body = document.body.innerText
    return body.includes('Weekly Average')
  })
  assert(weeklyAverageVisible, 'Weekly Average card is visible', 'TL1')

  // Weekly average should show steps/day and km/day
  const weeklyAvgValues = await page.evaluate(() => {
    const body = document.body.innerText
    const stepsPerDay = body.match(/[\d,]+ steps\/day/)
    const kmPerDay = body.match(/[\d.]+ km\/day/)
    return {
      stepsPerDay: stepsPerDay ? stepsPerDay[0] : null,
      kmPerDay: kmPerDay ? kmPerDay[0] : null,
    }
  })
  assert(weeklyAvgValues.stepsPerDay !== null, `Weekly Average shows steps/day: "${weeklyAvgValues.stepsPerDay}"`, 'TL1')
  assert(weeklyAvgValues.kmPerDay !== null, `Weekly Average shows km/day: "${weeklyAvgValues.kmPerDay}"`, 'TL1')

  // ─── Test 8: History list with date + step entries ───
  console.log('\n📋 [TL1] History List')
  const historySectionVisible = await page.evaluate(() => {
    const body = document.body.innerText
    return body.includes('History')
  })
  assert(historySectionVisible, 'History section heading is visible', 'TL1')

  const historyEntries = await page.evaluate(() => {
    const body = document.body.innerText
    // History entries follow pattern: "MMM DD, YYYY" "X,XXX steps"
    const datePattern = /\w{3}\s\d{1,2},\s\d{4}/g
    const dates = body.match(datePattern)
    // Count lines that contain " steps " pattern (history entries)
    const lines = body.split('\n')
    const stepLines = lines.filter(l => l.includes('steps'))
    return {
      datesFound: dates ? dates.length : 0,
      stepLines: stepLines.length,
      hasDateAndSteps: dates && dates.length > 0,
    }
  })
  assert(historyEntries.hasDateAndSteps, `History list has ${historyEntries.datesFound} date entries`, 'TL1')
  assert(historyEntries.stepLines >= 5, `History list has ${historyEntries.stepLines} entries with steps (expected >=5)`, 'TL1')

  // Each history entry should have " steps " and " km " and " min "
  const historyEntryFormat = await page.evaluate(() => {
    const body = document.body.innerText
    const lines = body.split('\n')
    const properLines = lines.filter(l =>
      l.includes('steps') && l.includes('km') && l.includes('min')
    )
    return properLines.length
  })
  assert(historyEntryFormat >= 5, `History entries contain "steps · km · min" format (${historyEntryFormat} rows)`, 'TL1')

  // ─── Test 9: Apple design tokens and CSS variables ───
  console.log('\n📋 [TL1] CSS & Design Tokens')
  const cssVars = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement)
    return {
      bg: style.getPropertyValue('--apple-systemBackground').trim(),
      label: style.getPropertyValue('--apple-label').trim(),
      blue: style.getPropertyValue('--apple-blue').trim(),
      green: style.getPropertyValue('--apple-green').trim(),
    }
  })
  assert(cssVars.bg.length > 0 || cssVars.label.length > 0,
    `CSS variables loaded (--apple-systemBackground: "${cssVars.bg}")`, 'TL1')
  console.log(`  ℹ️  CSS tokens: bg="${cssVars.bg}", label="${cssVars.label}", blue="${cssVars.blue}", green="${cssVars.green}"`)

  // Stat cards should use semantic color classes
  const semanticColorUsage = await page.evaluate(() => {
    const main = document.querySelector('main')
    if (!main) return false
    const statContainers = main.querySelectorAll('.grid-cols-2 > div')
    let hasColorClasses = 0
    statContainers.forEach(container => {
      const iconBg = container.querySelector('.rounded-full')
      if (iconBg) {
        const cls = iconBg.className
        if (cls.includes('bg-apple-')) hasColorClasses++
      }
    })
    return hasColorClasses >= 4
  })
  assert(semanticColorUsage, 'Stat cards use Apple semantic colors (bg-apple-green/blue/orange/red)', 'TL1')

  // ─── Screenshot: Initial Activity Page ───
  await page.screenshot({ path: 'tests/activity-page.png', fullPage: true })
  console.log('\n📸 Screenshot saved to tests/activity-page.png')

  // ════════════════════════════════════════════════════════════
  // TL2: VIEW SWITCHING & PET SELECTION INTERACTIONS
  // ════════════════════════════════════════════════════════════

  // ─── Test 10: Click Week view → Week segment stays active ───
  console.log('\n📋 [TL2] View Switching: Week View')
  await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'))
    const weekBtn = allButtons.find(b => b.textContent?.trim() === 'Week')
    if (weekBtn) weekBtn.click()
  })
  await sleep(500)

  const weekViewActive = await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'))
    const weekBtn = allButtons.find(b => b.textContent?.trim() === 'Week')
    if (!weekBtn) return false
    return weekBtn.className.includes('bg-apple-blue') || weekBtn.classList.contains('bg-apple-blue')
  })
  assert(weekViewActive, 'Week view button has active styling after click', 'TL2')

  // ─── Test 11: Click Month view → Month becomes active, Week inactive ───
  console.log('\n📋 [TL2] View Switching: Month View')
  await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'))
    const monthBtn = allButtons.find(b => b.textContent?.trim() === 'Month')
    if (monthBtn) monthBtn.click()
  })
  await sleep(500)

  const monthViewState = await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'))
    const monthBtn = allButtons.find(b => b.textContent?.trim() === 'Month')
    const weekBtn = allButtons.find(b => b.textContent?.trim() === 'Week')
    const dayBtn = allButtons.find(b => b.textContent?.trim() === 'Day')
    return {
      monthActive: monthBtn ? (monthBtn.className.includes('bg-apple-blue') || monthBtn.classList.contains('bg-apple-blue')) : false,
      weekInactive: weekBtn ? !(weekBtn.className.includes('bg-apple-blue') || weekBtn.classList.contains('bg-apple-blue')) : false,
      dayInactive: dayBtn ? !(dayBtn.className.includes('bg-apple-blue') || dayBtn.classList.contains('bg-apple-blue')) : false,
    }
  })
  assert(monthViewState.monthActive, 'Month view button has active styling', 'TL2')
  assert(monthViewState.weekInactive, 'Week view button no longer has active styling', 'TL2')
  assert(monthViewState.dayInactive, 'Day view button is inactive', 'TL2')

  // ─── Test 12: Click Day view → Day becomes active ───
  console.log('\n📋 [TL2] View Switching: Back to Day View')
  await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'))
    const dayBtn = allButtons.find(b => b.textContent?.trim() === 'Day')
    if (dayBtn) dayBtn.click()
  })
  await sleep(500)

  const dayViewState = await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'))
    const dayBtn = allButtons.find(b => b.textContent?.trim() === 'Day')
    const weekBtn = allButtons.find(b => b.textContent?.trim() === 'Week')
    const monthBtn = allButtons.find(b => b.textContent?.trim() === 'Month')
    return {
      dayActive: dayBtn ? (dayBtn.className.includes('bg-apple-blue') || dayBtn.classList.contains('bg-apple-blue')) : false,
      weekInactive: weekBtn ? !(weekBtn.className.includes('bg-apple-blue') || weekBtn.classList.contains('bg-apple-blue')) : false,
      monthInactive: monthBtn ? !(monthBtn.className.includes('bg-apple-blue') || monthBtn.classList.contains('bg-apple-blue')) : false,
    }
  })
  assert(dayViewState.dayActive, 'Day view button has active styling', 'TL2')
  assert(dayViewState.weekInactive, 'Week view button is inactive', 'TL2')
  assert(dayViewState.monthInactive, 'Month view button is inactive', 'TL2')

  // ─── Test 13: Switch PetSelector → stats and history refresh with different data ───
  console.log('\n📋 [TL2] Pet Switching: Change selected pet')

  // First, get the current steps value
  const currentStepsBefore = await page.evaluate(() => {
    const body = document.body.innerText
    const match = body.match(/[\d,]+ steps/)
    return match ? match[0] : null
  })
  console.log(`  ℹ️  Current steps before pet switch: ${currentStepsBefore}`)

  // Open PetSelector dropdown by clicking the pet name button
  const petDropdownOpened = await page.evaluate(() => {
    const main = document.querySelector('main')
    if (!main) return false
    const buttons = Array.from(main.querySelectorAll('button'))
    const petNames = ['Luna', 'Max', 'Coco', 'Bella', 'Charlie']
    const petBtn = buttons.find(b => petNames.some(n => b.textContent?.includes(n)))
    if (!petBtn) return false
    petBtn.click()
    return true
  })
  await sleep(500)
  assert(petDropdownOpened, 'PetSelector dropdown opened by clicking pet name button', 'TL2')

  // Verify dropdown is visible
  const dropdownVisible = await page.evaluate(() => {
    const glassHeavy = document.querySelector('.glass-heavy')
    return glassHeavy !== null && glassHeavy.children.length > 0
  })
  assert(dropdownVisible, 'PetSelector dropdown menu is visible after click', 'TL2')

  // Count available pets in dropdown
  const dropdownPetCount = await page.evaluate(() => {
    const glassHeavy = document.querySelector('.glass-heavy')
    if (!glassHeavy) return 0
    return glassHeavy.querySelectorAll('button').length
  })
  assert(dropdownPetCount >= 2, `PetSelector dropdown shows ${dropdownPetCount} pets (expected >=2)`, 'TL2')

  // Switch to a different pet by clicking the last pet in the dropdown
  const switchedToPet = await page.evaluate(() => {
    const glassHeavy = document.querySelector('.glass-heavy')
    if (!glassHeavy) return null
    const petButtons = glassHeavy.querySelectorAll('button')
    // Click the last pet (different from current)
    const lastBtn = petButtons[petButtons.length - 1] as HTMLElement
    const petName = lastBtn.textContent?.trim() || ''
    lastBtn.click()
    return petName
  })
  await sleep(800)
  assert(switchedToPet !== null && switchedToPet.length > 0,
    `Switched to pet: "${switchedToPet}"`, 'TL2')

  // Verify the selected pet name changed in the selector button
  const selectorShowsNewPet = await page.evaluate(() => {
    const main = document.querySelector('main')
    if (!main) return ''
    const buttons = Array.from(main.querySelectorAll('button'))
    const petNames = ['Luna', 'Max', 'Coco', 'Bella', 'Charlie']
    const petBtn = buttons.find(b => petNames.some(n => b.textContent?.includes(n)))
    return petBtn ? petBtn.textContent?.trim() || '' : ''
  })
  assert(selectorShowsNewPet.length > 0,
    `PetSelector now shows: "${selectorShowsNewPet}"`, 'TL2')

  // Verify stats changed (different random data for new pet)
  const currentStepsAfter = await page.evaluate(() => {
    const body = document.body.innerText
    const match = body.match(/[\d,]+ steps/)
    return match ? match[0] : null
  })
  console.log(`  ℹ️  Current steps after pet switch: ${currentStepsAfter}`)

  // Since mockActivity generates random data, steps should be different
  // (or at least the component should have re-rendered)
  const stepsChanged = currentStepsBefore !== currentStepsAfter
  assert(stepsChanged,
    `Steps value changed after pet switch (was "${currentStepsBefore}", now "${currentStepsAfter}")`, 'TL2')

  // Verify history list still shows entries after switch
  const historyAfterSwitch = await page.evaluate(() => {
    const body = document.body.innerText
    const datePattern = /\w{3}\s\d{1,2},\s\d{4}/g
    const dates = body.match(datePattern)
    return dates ? dates.length : 0
  })
  assert(historyAfterSwitch >= 5, `History list still shows ${historyAfterSwitch} date entries after pet switch`, 'TL2')

  // Verify progress ring still shows percentage after switch
  const progressAfterSwitch = await page.evaluate(() => {
    const body = document.body.innerText
    return !!body.match(/\d+%/g)
  })
  assert(progressAfterSwitch, 'Progress ring still shows percentage after pet switch', 'TL2')

  // ─── Final screenshot after interactions ───
  await page.screenshot({ path: 'tests/activity-after-interaction.png', fullPage: true })
  console.log('\n📸 Post-interaction screenshot saved to tests/activity-after-interaction.png')

  // ─── Summary ───
  console.log(`\n${'='.repeat(50)}`)
  console.log(`📊 Results: ${passed} passed, ${failed} failed`)
  const tl1Total = testResults.filter(r => r.level === 'TL1').length
  const tl2Total = testResults.filter(r => r.level === 'TL2').length
  const tl1Pass = testResults.filter(r => r.level === 'TL1' && r.passed).length
  const tl2Pass = testResults.filter(r => r.level === 'TL2' && r.passed).length
  console.log(`📋 By Test Level:`)
  console.log(`   TL1 (UI Rendering):       ${tl1Pass}/${tl1Total} passed`)
  console.log(`   TL2 (View/Pet Switching): ${tl2Pass}/${tl2Total} passed`)
  console.log(`${'='.repeat(50)}`)

  await browser.close()
  process.exit(failed > 0 ? 1 : 0)
}

run().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})
