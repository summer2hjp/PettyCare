/**
 * Appointments Page Visual & Functional Tests
 *
 * TL1: Verifies the Appointments page renders correctly with
 *      navigation, calendar grid, day dots, and appointment cards.
 * TL2: Verifies month switching and list updates.
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

  // ───────── Helper: navigate to Appointments via sidebar ─────────
  async function navigateToAppointments() {
    await page.evaluate(() => {
      const sidebar = document.querySelector('nav')
      if (!sidebar) return
      const buttons = Array.from(sidebar.querySelectorAll('button'))
      const apptBtn = buttons.find(b =>
        b.textContent?.trim() === 'Appointments'
      )
      if (apptBtn) apptBtn.click()
    })
    await sleep(800)
  }

  // ───────── Helper: navigate to Dashboard via sidebar ─────────
  async function navigateToDashboard() {
    await page.evaluate(() => {
      const sidebar = document.querySelector('nav')
      if (!sidebar) return
      const buttons = Array.from(sidebar.querySelectorAll('button'))
      const dashBtn = buttons.find(b =>
        b.textContent?.trim() === 'Dashboard'
      )
      if (dashBtn) dashBtn.click()
    })
    await sleep(800)
  }

  // ════════════════════════════════════════════════
  // TL1: APPOINTMENTS PAGE RENDERING
  // ════════════════════════════════════════════════

  // ─── Test 1: Page loads ───
  console.log('\n📋 [TL1] Page Load')
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
  await sleep(1000)
  const title = await page.title()
  assert(title.includes('PettyCare'), `Page title is "${title}"`, 'TL1')

  // ─── Test 2: Sidebar "Appointments" nav item exists ───
  console.log('\n📋 [TL1] Sidebar Navigation')
  const sidebarApptExists = await page.evaluate(() => {
    const sidebar = document.querySelector('nav')
    if (!sidebar) return false
    const buttons = Array.from(sidebar.querySelectorAll('button'))
    return buttons.some(b => b.textContent?.trim() === 'Appointments')
  })
  assert(sidebarApptExists, 'Sidebar "Appointments" nav item exists', 'TL1')

  // Navigate to Appointments page
  await navigateToAppointments()

  // ─── Test 3: Appointments page title visible ───
  console.log('\n📋 [TL1] Appointments Page Identity')
  const bodyText = await page.evaluate(() => document.body.innerText)
  assert(bodyText.includes('Appointments') || bodyText.includes('Upcoming'),
    'Appointments page content is visible', 'TL1')

  // ─── Test 4: Month navigation — left/right arrows and month label ───
  console.log('\n📋 [TL1] Month Navigation')
  const monthNav = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const chevronLeft = buttons.some(b =>
      b.innerHTML.includes('ChevronLeft') || b.querySelector('[class*="chevron-left"], svg')
    )
    // Simpler: check for SVG icon elements inside buttons
    const allSvg = document.body.innerHTML
    const hasLeftArrow = allSvg.includes('chevron-left') || allSvg.includes('ChevronLeft')
    const hasRightArrow = allSvg.includes('chevron-right') || allSvg.includes('ChevronRight')
    // Find month/year text — present in the page as a title3 heading
    const monthMatch = document.body.innerText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/)
    return {
      hasLeftArrow,
      hasRightArrow,
      monthLabel: monthMatch ? monthMatch[0] : null,
    }
  })
  assert(monthNav.hasLeftArrow, 'Month left arrow button exists', 'TL1')
  assert(monthNav.hasRightArrow, 'Month right arrow button exists', 'TL1')
  assert(monthNav.monthLabel !== null, `Month label "${monthNav.monthLabel}" is displayed`, 'TL1')
  console.log(`  ℹ️  Current month label: ${monthNav.monthLabel}`)

  // ─── Test 5: Calendar grid with 7 columns (Sun-Sat), date numbers visible ───
  console.log('\n📋 [TL1] Calendar Grid')
  const calendarInfo = await page.evaluate(() => {
    // Check day headers
    const body = document.body.innerText
    const hasSunday = body.includes('Sun')
    const hasMonday = body.includes('Mon')
    const hasSaturday = body.includes('Sat')
    // Check date numbers are present (1-31 range)
    const dateMatch = body.match(/\b([1-9]|[12]\d|3[01])\b/g)
    const dateNumbers = dateMatch ? dateMatch.filter(n => parseInt(n) >= 1 && parseInt(n) <= 31).length : 0
    return { hasSunday, hasMonday, hasSaturday, dateNumbers }
  })
  assert(calendarInfo.hasSunday && calendarInfo.hasMonday && calendarInfo.hasSaturday,
    `Calendar has day headers (Sun: ${calendarInfo.hasSunday}, Mon: ${calendarInfo.hasMonday}, Sat: ${calendarInfo.hasSaturday})`, 'TL1')
  assert(calendarInfo.dateNumbers >= 7,
    `Calendar grid has ${calendarInfo.dateNumbers} date numbers visible (expected ≥7)`, 'TL1')
  console.log(`  ℹ️  Calendar: ${calendarInfo.dateNumbers} date cells`)

  // ─── Test 6: Day dots present on days with appointments ───
  console.log('\n📋 [TL1] Day Dots')
  const dayDots = await page.evaluate(() => {
    // Day dots are small colored circles (w-1.5 h-1.5 rounded-full)
    const dots = document.querySelectorAll('.w-1\\.5.h-1\\.5, [class*="rounded-full"]')
    const smallDots = Array.from(dots).filter(el => {
      const html = (el as HTMLElement).outerHTML
      return html.includes('w-1.5') && html.includes('h-1.5')
    })
    return smallDots.length
  })
  // There should be day dots since mock data has appointments on today and tomorrow
  assert(dayDots >= 1, `Found ${dayDots} day dot(s) on the calendar (expected ≥1)`, 'TL1')

  // ─── Test 7: Appointment cards list below calendar ───
  console.log('\n📋 [TL1] Appointment Cards')
  const apptCards = await page.evaluate(() => {
    const body = document.body.innerText
    // Appointment cards have time, vet name, type
    const hasDrSmith = body.includes('Dr. Smith')
    const hasDrLee = body.includes('Dr. Lee')
    const hasTimePattern = /\d{1,2}:\d{2}/.test(body)
    // Check for appointment type keywords
    const hasCheckupType = body.includes('Checkup') || body.includes('Vaccination') || body.includes('Dental') || body.includes('Follow-up') || body.includes('Skin')
    return { hasDrSmith, hasDrLee, hasTimePattern, hasCheckupType }
  })
  assert(apptCards.hasDrSmith || apptCards.hasDrLee,
    `Vet names visible (Dr. Smith: ${apptCards.hasDrSmith}, Dr. Lee: ${apptCards.hasDrLee})`, 'TL1')
  assert(apptCards.hasTimePattern, 'Appointment times are displayed (HH:MM format)', 'TL1')
  assert(apptCards.hasCheckupType, 'Appointment type labels visible (Checkup/Vaccination/etc.)', 'TL1')

  // ─── Test 8: Appointment type icons (Stethoscope, Syringe, Scissors) ───
  console.log('\n📋 [TL1] Appointment Type Icons')
  // Check for icons visible with the default selected pet (Luna, petId "1")
  // Luna has: Annual Checkup (Stethoscope) and Vaccination (Syringe)
  // Dental Cleaning (Scissors) is for pet "Max" (petId "2") — switch to it if needed
  const iconInfo = await page.evaluate(() => {
    const html = document.body.innerHTML.toLowerCase()
    const hasStethoscope = html.includes('stethoscope')
    const hasSyringe = html.includes('syringe')
    const hasScissorsFile = html.includes('scissors')
    const hasPlus = html.includes('plus')
    return { hasStethoscope, hasSyringe, hasScissorsFile, hasPlus }
  })
  assert(iconInfo.hasStethoscope, 'Stethoscope icon present (Annual Checkup/Follow-up/Skin Check)', 'TL1')
  assert(iconInfo.hasSyringe, 'Syringe icon present (Vaccination)', 'TL1')
  assert(iconInfo.hasPlus, 'Plus icon present (Book button)', 'TL1')
  console.log(`  ℹ️  Icons detected — Stethoscope: ${iconInfo.hasStethoscope}, Syringe: ${iconInfo.hasSyringe}, Scissors: ${iconInfo.hasScissorsFile}`)

  // ─── Test 8b: Scissors icon appears when selecting a pet with Dental Cleaning ───
  // Pet "Max" (petId "2") has a Dental Cleaning appointment which uses the Scissors icon
  console.log('\n📋 [TL1] Scissors Icon (Dental Cleaning) via Pet Switch')
  await page.evaluate(() => {
    // Find the PetSelector button and click it to open the dropdown
    const buttons = Array.from(document.querySelectorAll('button'))
    // The PetSelector button contains a pet name (e.g., "Luna")
    const selectorBtn = buttons.find(b =>
      b.textContent?.includes('Luna') || b.textContent?.includes('Max') || b.textContent?.includes('Bella')
    )
    if (selectorBtn) selectorBtn.click()
  })
  await sleep(400)

  // Click on "Max" in the dropdown
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const maxBtn = buttons.find(b => b.textContent?.includes('Max') && !b.closest('nav'))
    if (maxBtn) maxBtn.click()
  })
  await sleep(500)

  const scissorsFound = await page.evaluate(() => {
    return document.body.innerHTML.toLowerCase().includes('scissors')
  })
  assert(scissorsFound, 'Scissors icon appears when Max (Dental Cleaning) is selected', 'TL1')

  // Switch back to Luna for subsequent tests
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const selectorBtn = buttons.find(b => b.textContent?.includes('Max'))
    if (selectorBtn) selectorBtn.click()
  })
  await sleep(300)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const lunaBtn = buttons.find(b => b.textContent?.includes('Luna') && !b.closest('nav'))
    if (lunaBtn) lunaBtn.click()
  })
  await sleep(500)

  // ─── Test 9: Appointment notes displayed ───
  console.log('\n📋 [TL1] Appointment Notes')
  const notesVisible = await page.evaluate(() => {
    const body = document.body.innerText
    return body.includes('stool sample') || body.includes('Fast after') || body.includes('Bring')
  })
  assert(notesVisible, 'Appointment notes text is visible (e.g., "Bring stool sample")', 'TL1')

  // ─── Test 10: Today badge on today's appointments ───
  console.log('\n📋 [TL1] Today Badge')
  const todayBadge = await page.evaluate(() => {
    const body = document.body.innerText
    return body.includes('Today')
  })
  // Today badge appears if today's date matches an appointment date
  // Mock data creates appointments for today, so this should be visible
  assert(todayBadge, '"Today" badge visible on today\'s appointment cards', 'TL1')

  // ─── Test 11: Add/Book "+" button exists ───
  console.log('\n📋 [TL1] Book Button')
  const bookButtonExists = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    return buttons.some(b =>
      b.textContent?.includes('Book') ||
      b.innerHTML.includes('Plus') ||
      b.innerHTML.includes('plus')
    )
  })
  assert(bookButtonExists, 'Book/Add "+" button exists', 'TL1')

  // ─── Test 12: PetSelector dropdown exists ───
  console.log('\n📋 [TL1] Pet Selector')
  const hasPetSelector = await page.evaluate(() => {
    const body = document.body.innerText
    // PetSelector shows pet names like Luna, Max, Bella, Coco, Charlie
    return body.includes('Luna') || body.includes('Max') || body.includes('Bella')
  })
  assert(hasPetSelector, 'Pet selector with pet names is visible', 'TL1')

  // ─── Test 13: Semantic color tokens used ───
  console.log('\n📋 [TL1] Semantic Colors')
  const cssVars = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement)
    return {
      bg: style.getPropertyValue('--apple-systemBackground').trim(),
      label: style.getPropertyValue('--apple-label').trim(),
      blue: style.getPropertyValue('--apple-blue').trim(),
    }
  })
  assert(cssVars.bg.length > 0 || cssVars.label.length > 0,
    `CSS variables loaded (--apple-systemBackground: "${cssVars.bg}")`, 'TL1')
  console.log(`  ℹ️  CSS vars: bg=${cssVars.bg}, label=${cssVars.label}, blue=${cssVars.blue}`)

  // ─── Screenshot after TL1 ───
  await page.screenshot({ path: 'tests/appointments-tl1.png', fullPage: true })
  console.log('\n📸 TL1 screenshot saved to tests/appointments-tl1.png')

  // ════════════════════════════════════════════════
  // TL2: MONTH SWITCHING & INTERACTION
  // ════════════════════════════════════════════════

  // ─── Test 14: Click right arrow → month changes ───
  console.log('\n📋 [TL2] Month Navigation: Right Arrow')
  const initialMonth = await page.evaluate(() => {
    const match = document.body.innerText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/)
    return match ? match[0] : null
  })
  console.log(`  ℹ️  Initial month: ${initialMonth}`)

  // Click the right arrow button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    // Look for the month navigation right arrow — it's a button containing ChevronRight icon
    // It's usually the last button in the month header section
    // Find the button that is inside the flex container with the month label
    const allHtml = document.body.innerHTML
    // The right arrow button has ChevronRight icon
    const rightArrowBtn = buttons.find(b =>
      b.innerHTML.includes('chevron-right') || b.innerHTML.includes('ChevronRight')
    )
    if (rightArrowBtn) rightArrowBtn.click()
  })
  await sleep(600)

  const afterRightMonth = await page.evaluate(() => {
    const match = document.body.innerText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/)
    return match ? match[0] : null
  })
  const monthChanged = initialMonth !== afterRightMonth
  assert(monthChanged, `Clicking right arrow changes month (${initialMonth} → ${afterRightMonth})`, 'TL2')
  console.log(`  ℹ️  Month after right arrow: ${afterRightMonth}`)

  // ─── Test 15: Click left arrow → month goes back to original ───
  console.log('\n📋 [TL2] Month Navigation: Left Arrow')
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const leftArrowBtn = buttons.find(b =>
      b.innerHTML.includes('chevron-left') || b.innerHTML.includes('ChevronLeft')
    )
    if (leftArrowBtn) leftArrowBtn.click()
  })
  await sleep(600)

  const afterLeftMonth = await page.evaluate(() => {
    const match = document.body.innerText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/)
    return match ? match[0] : null
  })
  assert(afterLeftMonth === initialMonth,
    `Clicking left arrow returns to original month (${afterLeftMonth} === ${initialMonth})`, 'TL2')

  // ─── Test 16: Calendar grid updates when month changes ───
  console.log('\n📋 [TL2] Calendar Grid Updates on Month Switch')
  // The appointment cards below the calendar show ALL appointments for the selected pet
  // (not filtered by viewDate). But the calendar grid itself updates with new month dates.
  // Verify the calendar grid structure changes by checking the first visible date cell
  // or the calendar month label position.
  const gridChanged = await page.evaluate(() => {
    // Capture the calendar grid's rendered day numbers as a string
    const dayCells = Array.from(document.querySelectorAll('.aspect-square'))
      .filter(el => el.textContent?.trim() && /^\d+$/.test(el.textContent.trim()))
      .map(el => el.textContent?.trim())
      .join(',')
    return dayCells
  })
  console.log(`  ℹ️  Calendar days in July: ${gridChanged.substring(0, 60)}...`)

  // Navigate back to June for the next test
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const leftArrowBtn = buttons.find(b =>
      b.innerHTML.includes('chevron-left') || b.innerHTML.includes('ChevronLeft')
    )
    if (leftArrowBtn) leftArrowBtn.click()
  })
  await sleep(600)

  const gridOriginal = await page.evaluate(() => {
    const dayCells = Array.from(document.querySelectorAll('.aspect-square'))
      .filter(el => el.textContent?.trim() && /^\d+$/.test(el.textContent.trim()))
      .map(el => el.textContent?.trim())
      .join(',')
    return dayCells
  })
  console.log(`  ℹ️  Calendar days in June:  ${gridOriginal.substring(0, 60)}...`)

  assert(gridChanged !== gridOriginal,
    'Calendar grid dates update when month changes (July grid differs from June grid)', 'TL2')

  // Verify we're back on the correct month
  const afterGridNav = await page.evaluate(() => {
    const match = document.body.innerText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/)
    return match ? match[0] : null
  })
  console.log(`  ℹ️  After grid comparison, month is: ${afterGridNav}`)

  // ─── Test 17: Appointment cards remain visible after month switch ───
  console.log('\n📋 [TL2] Appointment Cards Persist After Month Switch')
  const cardsPersist = await page.evaluate(() => {
    const body = document.body.innerText
    return body.includes('Dr. Smith') && /\d{1,2}:\d{2}/.test(body)
  })
  assert(cardsPersist, 'Appointment cards remain visible after month switch', 'TL2')

  // ─── Test 18: Month navigation is bi-directional (go forward 2, back 2, verify cycle) ───
  console.log('\n📋 [TL2] Month Navigation: Bidirectional Cycle')
  // We are on June (the initial month). Go forward twice, then back twice to verify full cycle.
  // Close any stray dropdown first by pressing Escape
  await page.keyboard.press('Escape')
  await sleep(300)

  async function clickRightArrow() {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const rightArrowBtn = buttons.find(b =>
        b.innerHTML.includes('chevron-right') || b.innerHTML.includes('ChevronRight')
      )
      if (rightArrowBtn) rightArrowBtn.click()
    })
  }
  async function clickLeftArrow() {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const leftArrowBtn = buttons.find(b =>
        b.innerHTML.includes('chevron-left') || b.innerHTML.includes('ChevronLeft')
      )
      if (leftArrowBtn) leftArrowBtn.click()
    })
  }

  // Capture current month as cycle start
  const cycleStart = await page.evaluate(() => {
    const match = document.body.innerText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/)
    return match ? match[0] : null
  })
  console.log(`  ℹ️  Cycle start: ${cycleStart}`)

  // Go forward 1 month, then back 1 month, verify we return
  await clickRightArrow()
  await sleep(600)
  const cycleMid = await page.evaluate(() => {
    const match = document.body.innerText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/)
    return match ? match[0] : null
  })
  console.log(`  ℹ️  After right: ${cycleMid}`)
  assert(cycleMid !== cycleStart, `Month changes after clicking right (${cycleStart} → ${cycleMid})`, 'TL2')

  await clickLeftArrow()
  await sleep(600)
  const cycleEnd = await page.evaluate(() => {
    const match = document.body.innerText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/)
    return match ? match[0] : null
  })
  assert(cycleEnd === cycleStart,
    `Month navigation is bi-directional (${cycleStart} → ${cycleMid} → ${cycleEnd})`, 'TL2')
  console.log(`  ℹ️  Cycle complete: ${cycleStart} → ${cycleMid} → ${cycleEnd}`)

  // ─── Screenshot after TL2 ───
  await page.screenshot({ path: 'tests/appointments-tl2.png', fullPage: true })
  console.log('\n📸 Post-interaction screenshot saved to tests/appointments-tl2.png')

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
  console.log(`   TL1 (UI Rendering):           ${tl1Pass}/${tl1Total} passed`)
  console.log(`   TL2 (Month Switching/Inter.): ${tl2Pass}/${tl2Total} passed`)
  console.log(`${'='.repeat(50)}`)

  await browser.close()
  process.exit(failed > 0 ? 1 : 0)
}

run().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})
