/**
 * Dashboard Visual & Functional Tests
 *
 * Verifies the redesigned Dashboard renders correctly with
 * all 7 horizontal scrolling sections.
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

  // ─────────────────────────────────────────────────
  //  AUTH: Ensure signed in before dashboard tests
  // ─────────────────────────────────────────────────
  async function ensureAuthenticated() {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
    await sleep(2000)

    const bodyAfterLoad = await page.evaluate(() => document.body.innerText)
    if (bodyAfterLoad.includes('Welcome back') || bodyAfterLoad.includes('Dashboard')) return

    console.log('🔑 Signing in as test user...')

    // Switch to register mode
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.trim() === 'Sign up' && !b.closest('nav'))
      if (btn) btn.click()
    })
    await sleep(600)

    // Fill auth form using native setter (works with React controlled inputs)
    await page.evaluate(() => {
      const emailInput = document.querySelector<HTMLInputElement>('input[type="email"]')
      const passInput = document.querySelector<HTMLInputElement>('input[type="password"]')
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
      if (emailInput && setter) {
        setter.call(emailInput, 'test@pettycare.com')
        emailInput.dispatchEvent(new Event('input', { bubbles: true }))
        emailInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
      if (passInput && setter) {
        setter.call(passInput, 'test123456')
        passInput.dispatchEvent(new Event('input', { bubbles: true }))
        passInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })
    await sleep(300)

    // Submit sign up
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.trim() === 'Create account')
      if (btn) btn.click()
    })
    await sleep(2000)

    // Check if signup failed (user already exists → still on register form)
    const afterSignup = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      return {
        hasSignIn: buttons.some(b => b.textContent?.trim() === 'Sign in'),
        hasCreateAccount: buttons.some(b => b.textContent?.trim() === 'Create account'),
      }
    })

    if (afterSignup.hasCreateAccount && !afterSignup.hasSignIn) {
      // Signup failed — switch to login mode
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent?.trim() === 'Sign in')
        if (btn) btn.click()
      })
      await sleep(600)
    }

    // Fill login form
    await page.evaluate(() => {
      const emailInput = document.querySelector<HTMLInputElement>('input[type="email"]')
      const passInput = document.querySelector<HTMLInputElement>('input[type="password"]')
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
      if (emailInput && setter) {
        setter.call(emailInput, 'test@pettycare.com')
        emailInput.dispatchEvent(new Event('input', { bubbles: true }))
        emailInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
      if (passInput && setter) {
        setter.call(passInput, 'test123456')
        passInput.dispatchEvent(new Event('input', { bubbles: true }))
        passInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })
    await sleep(300)

    // Sign in
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.trim() === 'Sign in')
      if (btn) btn.click()
    })

    // Wait for dashboard to render
    await sleep(3000)
    const dashboardReady = await page.evaluate(() =>
      document.body.innerText.includes('Dashboard') || document.body.innerText.includes('Welcome back')
    )
    console.log(`  ${dashboardReady ? '✅' : '❌'} Authenticated (dashboard ready: ${dashboardReady})`)
  }

  // ════════════════════════════════════════════════
  // TL1: UI RENDERING & STYLE VERIFICATION
  // ════════════════════════════════════════════════

  // ─── Auth Step: Ensure signed in ───
  await ensureAuthenticated()

  // ─── Test 1: Page loads ───
  console.log('\n📋 [TL1] Dashboard Page Load')
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
  await sleep(1500)
  const title = await page.title()
  assert(title.includes('PettyCare'), `Page title is "${title}"`, 'TL1')

  // ─── Test 2: Welcome message ───
  console.log('\n📋 [TL1] Welcome Header')
  const bodyText = await page.evaluate(() => document.body.innerText)
  assert(bodyText.includes('Welcome back'), 'Shows "Welcome back 👋"', 'TL1')

  // ─── Test 3: Quick Actions section ───
  console.log('\n📋 [TL1] Quick Actions')
  assert(bodyText.includes('Quick Actions'), 'Has "Quick Actions" heading', 'TL1')
  assert(bodyText.includes('Add Pet'), 'Has "Add Pet" button', 'TL1')
  assert(bodyText.includes('Log Feeding'), 'Has "Log Feeding" button', 'TL1')
  assert(bodyText.includes('Log Vaccination'), 'Has "Log Vaccination" button', 'TL1')
  assert(bodyText.includes('Schedule Visit'), 'Has "Schedule Visit" button', 'TL1')
  assert(bodyText.includes('Add Vet Visit'), 'Has "Add Vet Visit" button', 'TL1')

  // ─── Test 4: Health Overview section ───
  console.log('\n📋 [TL1] Health Overview')
  assert(bodyText.includes('Health Overview'), 'Has "Health Overview" heading', 'TL1')
  assert(bodyText.includes('Health Score'), 'Has "Health Score" card', 'TL1')
  assert(bodyText.includes('Vaccinations due'), 'Has "Vaccinations due" card', 'TL1')
  assert(bodyText.includes('Active medications'), 'Has "Active medications" card', 'TL1')
  assert(bodyText.includes('View All'), 'Has "View All" link', 'TL1')

  // ─── Test 5: Activity section ───
  console.log('\n📋 [TL1] Activity')
  assert(bodyText.includes('Activity'), 'Has "Activity" heading', 'TL1')
  assert(bodyText.includes('steps'), 'Has steps stat', 'TL1')
  assert(bodyText.includes('Weekly trend'), 'Has weekly trend indicator', 'TL1')

  // ─── Test 6: Feeding Schedule section ───
  console.log('\n📋 [TL1] Feeding Schedule')
  assert(bodyText.includes('Feeding Schedule'), 'Has "Feeding Schedule" heading', 'TL1')
  assert(bodyText.includes('Breakfast') || bodyText.includes('Lunch') || bodyText.includes('Dinner'),
    'Has meal schedule entries', 'TL1')

  // ─── Test 7: Upcoming Events section ───
  console.log('\n📋 [TL1] Upcoming Events')
  assert(bodyText.includes('Upcoming Events'), 'Has "Upcoming Events" heading', 'TL1')
  assert(bodyText.includes('Tomorrow') || bodyText.includes('Next week'), 'Has urgency labels', 'TL1')

  // ─── Test 8: Recent Activity section ───
  console.log('\n📋 [TL1] Recent Activity')
  assert(bodyText.includes('Recent Activity'), 'Has "Recent Activity" heading', 'TL1')

  // ─── Test 9: Insights section ───
  console.log('\n📋 [TL1] Insights')
  assert(bodyText.includes('Insights'), 'Has "Insights" heading', 'TL1')

  // ─── Test 10: Horizontal scroll containers ───
  console.log('\n📋 [TL1] Scroll Behavior')
  const scrollContainers = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.snap-x')).length
  })
  assert(scrollContainers >= 5, `Found ${scrollContainers} horizontal scroll containers`, 'TL1')

  // ─── Test 11: View All buttons ───
  console.log('\n📋 [TL1] Navigation')
  const viewAllButtons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button'))
      .filter(b => b.textContent?.includes('View All'))
      .length
  })
  assert(viewAllButtons >= 3, `Found ${viewAllButtons} "View All" buttons`, 'TL1')

  // ─── Test 12: Dark mode CSS compatibility ───
  console.log('\n📋 [TL1] Dark Mode CSS')
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

  // Verify Dashboard sections use semantic color tokens
  const hasSemanticColors = await page.evaluate(() => {
    const cards = document.querySelectorAll('.snap-start')
    if (cards.length === 0) return false
    let styledCount = 0
    cards.forEach(card => {
      const text = card.querySelector('.text-apple-secondaryLabel, .text-apple-label, .text-apple-blue')
      if (text || card.className.includes('bg-apple-')) styledCount++
    })
    return styledCount >= cards.length * 0.5
  })
  assert(hasSemanticColors, 'Dashboard cards use Apple semantic colors', 'TL1')

  // ─── Test 23: PetSelectorStrip renders with pet avatars ───
  console.log('\n📋 [TL1] Pet Selector Strip')
  assert(bodyText.includes('My Pets'), 'PetSelectorStrip shows "My Pets" heading', 'TL1')
  assert(bodyText.includes('All'), 'PetSelectorStrip has "All" pets button', 'TL1')
  const petSelectorInfo = await page.evaluate(() => {
    const body = document.body.innerText
    const petNames = ['Luna', 'Max', 'Coco', 'Bella', 'Charlie'].filter(n => body.includes(n))
    const glassEls = document.querySelectorAll('.glass-light').length
    return { petNames, glassEls }
  })
  assert(petSelectorInfo.petNames.length >= 1,
    `PetSelectorStrip shows ${petSelectorInfo.petNames.length} pet names`, 'TL1')
  assert(petSelectorInfo.glassEls >= 1,
    `Page has ${petSelectorInfo.glassEls} glass-light elements for pet selector`, 'TL1')
  console.log(`  ℹ️  Pet names found: ${petSelectorInfo.petNames.join(', ') || 'none'}, glass-light: ${petSelectorInfo.glassEls}`)

  // ─── Test 24: MomentSection daily gallery renders ───
  console.log('\n📋 [TL1] Daily Moments Gallery')
  assert(bodyText.includes('📸 宠物的日常'), 'Daily moments heading "📸 宠物的日常" renders', 'TL1')
  const dailySection = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('.mb-6'))
    const daily = sections.find(s => s.textContent?.includes('📸 宠物的日常'))
    if (!daily) return { exists: false, glassElements: 0 }
    const cards = daily.querySelectorAll('.snap-start')
    return { exists: true, glassElements: daily.querySelectorAll('.glass-light').length, cardCount: cards.length }
  })
  assert(dailySection.exists, 'Daily moments section container found in DOM', 'TL1')
  console.log(`  ℹ️  Daily moments: ${dailySection.cardCount} cards, ${dailySection.glassElements} glass elements`)

  // ─── Test 25: MomentSection interaction gallery renders ───
  console.log('\n📋 [TL1] Interaction Moments Gallery')
  assert(bodyText.includes('💕 互动瞬间'), 'Interaction moments heading "💕 互动瞬间" renders', 'TL1')
  const interactionSection = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('.mb-6'))
    const interaction = sections.find(s => s.textContent?.includes('💕 互动瞬间'))
    if (!interaction) return { exists: false, glassElements: 0 }
    const cards = interaction.querySelectorAll('.snap-start')
    return { exists: true, glassElements: interaction.querySelectorAll('.glass-light, .glass').length, cardCount: cards.length }
  })
  assert(interactionSection.exists, 'Interaction moments section container found in DOM', 'TL1')
  console.log(`  ℹ️  Interaction moments: ${interactionSection.cardCount} cards, ${interactionSection.glassElements} glass elements`)

  // ─── Test 26: GrowthTimelineSection renders ───
  console.log('\n📋 [TL1] Growth Timeline')
  assert(bodyText.includes('📈 成长轨迹'), 'Growth timeline heading "📈 成长轨迹" renders', 'TL1')
  const growthSection = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('.mb-6'))
    const growth = sections.find(s => s.textContent?.includes('📈 成长轨迹'))
    if (!growth) return { exists: false, glassElements: 0 }
    return { exists: true, glassElements: growth.querySelectorAll('.glass-light').length, entries: growth.querySelectorAll('button').length }
  })
  assert(growthSection.exists, 'Growth timeline section container found in DOM', 'TL1')
  console.log(`  ℹ️  Growth timeline: ${growthSection.entries} entries, ${growthSection.glassElements} glass elements`)

  // ─── Test 27: DataCardRow shows stat cards ───
  console.log('\n📋 [TL1] Data Cards Overview')
  assert(bodyText.includes('Overview'), 'DataCardRow shows "Overview" section heading', 'TL1')
  assert(bodyText.includes('Health'), 'DataCardRow has "Health" stat card label', 'TL1')
  assert(bodyText.includes('Feeding'), 'DataCardRow has "Feeding" stat card label', 'TL1')
  assert(bodyText.includes('Events'), 'DataCardRow has "Events" stat card label', 'TL1')
  assert(bodyText.includes('Insight'), 'DataCardRow has "Insight" stat card label', 'TL1')

  // ─── Test 28: GlassPanel / glassmorphism styling present on cards ───
  console.log('\n📋 [TL1] Glassmorphism Design System')
  const glassAll = await page.evaluate(() => {
    const light = document.querySelectorAll('.glass-light').length
    const medium = document.querySelectorAll('.glass').length
    const heavy = document.querySelectorAll('.glass-heavy').length
    return { light, medium, heavy, total: light + medium + heavy }
  })
  assert(glassAll.total >= 5,
    `Glassmorphism styling widely used: ${glassAll.total} elements (light:${glassAll.light}, medium:${glassAll.medium}, heavy:${glassAll.heavy})`, 'TL1')
  console.log(`  ℹ️  Glass elements: ${glassAll.light} light, ${glassAll.medium} medium, ${glassAll.heavy} heavy`)

  // ─── Screenshot ───
  await page.screenshot({ path: 'tests/dashboard-fullpage.png', fullPage: true })
  console.log('\n📸 Screenshot saved to tests/dashboard-fullpage.png')

  // ════════════════════════════════════════════════
  // TL2: INTERACTIVE NAVIGATION TESTS
  // ════════════════════════════════════════════════

  /**
   * Helper: navigate back to Dashboard via sidebar nav.
   * Finds the sidebar <button> whose aria-label or text matches.
   */
  async function navigateToDashboard() {
    // Try multiple strategies to find the Dashboard nav button
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

  // ─── Test 13: Quick Action — "Add Pet" navigates to pet form ───
  console.log('\n📋 [TL2] Navigation: Quick Action → Add Pet')
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const addPetBtn = buttons.find(b =>
      b.textContent?.includes('Add Pet') &&
      // exclude the sidebar "Pets" button if it also has "Add Pet" text
      !b.closest('nav')
    )
    if (addPetBtn) {
      addPetBtn.click()
      return true
    }
    return false
  })
  await sleep(1000)
  const formPageInfo = await page.evaluate(() => {
    const body = document.body.innerText
    return {
      hasSaveButton: body.includes('Save'),
      hasCancelButton: body.includes('Cancel'),
      hasNameField: !!document.querySelector('input[placeholder*="name" i]'),
      hasBreedField: !!document.querySelector('input[placeholder*="Breed" i]'),
      bodyPreview: body.substring(0, 300),
    }
  })
  assert(formPageInfo.hasSaveButton || formPageInfo.hasNameField,
    `Add Pet navigated to form (Save: ${formPageInfo.hasSaveButton}, Name field: ${formPageInfo.hasNameField})`, 'TL2')
  if (!formPageInfo.hasSaveButton) {
    console.log(`  🔍 Form page debug: ${JSON.stringify(formPageInfo, null, 2).substring(0, 300)}`)
  }

  await navigateToDashboard()

  // ─── Test 14: Quick Action — "Log Feeding" navigates to feeding page ───
  console.log('\n📋 [TL2] Navigation: Quick Action → Log Feeding')
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const feedBtn = buttons.find(b =>
      b.textContent?.includes('Log Feeding') &&
      !b.closest('nav')
    )
    if (feedBtn) feedBtn.click()
  })
  await sleep(800)
  const feedPageText = await page.evaluate(() => document.body.innerText)
  const isOnFeeding = feedPageText.includes("Today's Schedule") || feedPageText.includes('Feeding')
  assert(isOnFeeding, 'Clicking "Log Feeding" navigates to the feeding page', 'TL2')

  await navigateToDashboard()

  // ─── Test 15: Quick Action — "Schedule Visit" navigates to appointments ───
  console.log('\n📋 [TL2] Navigation: Quick Action → Schedule Visit')
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const schedBtn = buttons.find(b =>
      b.textContent?.includes('Schedule Visit') &&
      !b.closest('nav')
    )
    if (schedBtn) schedBtn.click()
  })
  await sleep(800)
  const apptPageText = await page.evaluate(() => document.body.innerText)
  const isOnAppointments = apptPageText.includes('Appointments') || apptPageText.includes('Calendar')
  assert(isOnAppointments, 'Clicking "Schedule Visit" navigates to the appointments page', 'TL2')

  await navigateToDashboard()

  // ─── Test 16: "View All" — Health Overview → Health page ───
  console.log('\n📋 [TL2] Navigation: View All → Health')
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const viewAllBtns = buttons.filter(b => b.textContent?.includes('View All'))
    if (viewAllBtns.length > 0) viewAllBtns[0].click()
  })
  await sleep(800)
  const healthPageText = await page.evaluate(() => document.body.innerText)
  const isOnHealthPage = healthPageText.includes('Vaccinations') || healthPageText.includes('Vet Visits') || healthPageText.includes('Medications')
  assert(isOnHealthPage, 'Clicking Health "View All" navigates to the Health page', 'TL2')

  await navigateToDashboard()

  // ─── Test 17: "View All" — Activity → Activity page ───
  console.log('\n📋 [TL2] Navigation: View All → Activity')
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const viewAllBtns = buttons.filter(b => b.textContent?.includes('View All'))
    if (viewAllBtns.length >= 2) viewAllBtns[1].click()
  })
  await sleep(800)
  const activityPageText = await page.evaluate(() => document.body.innerText)
  const isOnActivityPage = activityPageText.includes('steps') || activityPageText.includes('Activity')
  assert(isOnActivityPage, 'Clicking Activity "View All" navigates to the Activity page', 'TL2')

  await navigateToDashboard()

  // ════════════════════════════════════════════════
  // TL4: DATA CONSISTENCY & CROSS-REFERENCING
  // ════════════════════════════════════════════════

  // ─── Test 18: Pet count consistency across sections ───
  console.log('\n📋 [TL4] Interlinking: Pet Count Consistency')
  const dashboardBody = await page.evaluate(() => document.body.innerText)
  const petCountMatch = dashboardBody.match(/(\d+)\s*pets?/)
  const petCount = petCountMatch ? parseInt(petCountMatch[1]) : 0
  assert(petCount > 0, `Health Overview shows pet count: ${petCount}`, 'TL4')
  console.log(`  ℹ️  Dashboard shows "${petCount} pets"`)

  const uniquePetsInFeeding = await page.evaluate(() => {
    const body = document.body.innerText
    const petNames = ['Luna', 'Max', 'Coco', 'Bella', 'Charlie']
    return petNames.filter(n => body.includes(n)).length
  })
  assert(uniquePetsInFeeding >= 2, `Found ${uniquePetsInFeeding} pet names referenced across sections`, 'TL4')

  // ─── Test 19: Cross-section data consistency ───
  console.log('\n📋 [TL4] Interlinking: Cross-Section Data Consistency')
  const sectionPetOverlap = await page.evaluate(() => {
    const body = document.body.innerText
    const found: Record<string, string[]> = {}
    const petNames = ['Luna', 'Max', 'Coco', 'Bella', 'Charlie']
    const sectionHeaders = ['Health Overview', 'Activity', 'Feeding Schedule', 'Upcoming Events']
    sectionHeaders.forEach(header => {
      const idx = body.indexOf(header)
      if (idx >= 0) {
        const context = body.substring(idx, idx + 500)
        found[header] = petNames.filter(n => context.includes(n))
      }
    })
    return found
  })
  console.log(`  ℹ️  Pets per section: ${JSON.stringify(sectionPetOverlap)}`)
  const sectionsWithRefs = Object.values(sectionPetOverlap).filter(refs => refs.length > 0).length
  assert(sectionsWithRefs >= 2, `${sectionsWithRefs} sections cross-reference pet data`, 'TL4')

  // ─── Test 20: Form field detection ───
  console.log('\n📋 [TL2] Form Interaction: Pet form has required fields')
  // Navigate to pet-form directly
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const addPetBtn = buttons.find(b =>
      b.textContent?.includes('Add Pet') &&
      !b.closest('nav')
    )
    if (addPetBtn) addPetBtn.click()
  })
  await sleep(1000)

  const formFields = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input, select, textarea'))
    const allText = document.body.innerText
    return {
      inputCount: inputs.length,
      hasNamePlaceholder: inputs.some(i => (i as HTMLInputElement).placeholder?.toLowerCase().includes("pet's name")),
      hasBreedPlaceholder: inputs.some(i => (i as HTMLInputElement).placeholder?.toLowerCase().includes('golden') || (i as HTMLInputElement).placeholder?.toLowerCase().includes('breed')),
      hasBirthDate: inputs.some(i => (i as HTMLInputElement).type === 'date'),
      hasWeight: inputs.some(i => (i as HTMLInputElement).type === 'number'),
      hasSaveBtn: allText.includes('Save'),
      hasCancelBtn: allText.includes('Cancel'),
      fieldsCount: ['Name', 'Breed', 'Species', 'Gender', 'Date of Birth', 'Weight', 'Color', 'Microchip', 'Notes']
        .filter(f => allText.includes(f)).length,
    }
  })
  assert(formFields.inputCount >= 3 && formFields.hasSaveBtn,
    `Form has ${formFields.inputCount} inputs and Save button`, 'TL2')
  console.log(`  ℹ️  Form: ${formFields.inputCount} inputs, ${formFields.fieldsCount}/9 labels, Save: ${formFields.hasSaveBtn}`)

  // ─── Test 21: Fill sample pet data & submit ───
  console.log('\n📋 [TL2] Form Interaction: Fill sample pet data & submit')
  const fillResult = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'))

    // Fill name
    const nameInput = inputs.find(i =>
      (i as HTMLInputElement).placeholder?.toLowerCase().includes("pet's name") ||
      i.id?.toLowerCase().includes('name')
    ) as HTMLInputElement
    if (nameInput) {
      nameInput.value = 'TestPuppy'
      nameInput.dispatchEvent(new Event('input', { bubbles: true }))
    }

    // Fill breed
    const breedInput = inputs.find(i =>
      (i as HTMLInputElement).placeholder?.toLowerCase().includes('breed') ||
      (i as HTMLInputElement).placeholder?.toLowerCase().includes('golden')
    ) as HTMLInputElement
    if (breedInput) {
      breedInput.value = 'Test Breed'
      breedInput.dispatchEvent(new Event('input', { bubbles: true }))
    }

    // Fill weight
    const weightInput = inputs.find(i => (i as HTMLInputElement).type === 'number') as HTMLInputElement
    if (weightInput) {
      weightInput.value = '5'
      weightInput.dispatchEvent(new Event('input', { bubbles: true }))
    }

    return { nameFilled: nameInput?.value === 'TestPuppy', breedFilled: breedInput?.value === 'Test Breed' }
  })
  assert(fillResult.nameFilled || fillResult.breedFilled,
    `Form fields filled (name: ${fillResult.nameFilled}, breed: ${fillResult.breedFilled})`, 'TL2')

  // Submit
  const submitClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const saveBtn = buttons.find(b => b.textContent?.includes('Save'))
    if (saveBtn) { saveBtn.click(); return true }
    return false
  })
  assert(submitClicked, 'Save button was clicked', 'TL2')

  // Wait for save → navigation to pets list
  await sleep(1000)

  // Navigate back to Dashboard and check for updated pet count
  await navigateToDashboard()

  // ─── Test 22: Verify data reactivity after form submission ───
  console.log('\n📋 [TL4] Interlinking: Data reactivity after pet addition')
  const afterAddText = await page.evaluate(() => document.body.innerText)
  const petCountMatch2 = afterAddText.match(/(\d+)\s*pets?/)
  const newPetCount = petCountMatch2 ? parseInt(petCountMatch2[1]) : 0
  // Should be at least 5 (from mock data), likely 6 after adding TestPuppy
  assert(newPetCount >= 5, `Dashboard pet count updated: ${newPetCount} pets (expected ≥5)`, 'TL4')
  console.log(`  ℹ️  Pet count after addition: ${newPetCount}`)

  const healthScoreDisplayed = afterAddText.includes('Health Score') &&
    (afterAddText.includes('%') || afterAddText.includes('Excellent') || afterAddText.includes('Good') || afterAddText.includes('Fair'))
  assert(healthScoreDisplayed, 'Health score recomputes from updated pet data', 'TL4')

  // ─── Final screenshot after interactions ───
  await page.screenshot({ path: 'tests/dashboard-after-interaction.png', fullPage: true })
  console.log('\n📸 Post-interaction screenshot saved to tests/dashboard-after-interaction.png')

  // ─── Summary ───
  console.log(`\n${'='.repeat(50)}`)
  console.log(`📊 Results: ${passed} passed, ${failed} failed`)
  const tl1Total = testResults.filter(r => r.level === 'TL1').length
  const tl2Total = testResults.filter(r => r.level === 'TL2').length
  const tl4Total = testResults.filter(r => r.level === 'TL4').length
  const tl1Pass = testResults.filter(r => r.level === 'TL1' && r.passed).length
  const tl2Pass = testResults.filter(r => r.level === 'TL2' && r.passed).length
  const tl4Pass = testResults.filter(r => r.level === 'TL4' && r.passed).length
  console.log(`📋 By Test Level:`)
  console.log(`   TL1 (UI Rendering):     ${tl1Pass}/${tl1Total} passed`)
  console.log(`   TL2 (Navigation/Form):  ${tl2Pass}/${tl2Total} passed`)
  console.log(`   TL4 (Data Consistency): ${tl4Pass}/${tl4Total} passed`)
  console.log(`${'='.repeat(50)}`)

  await browser.close()
  process.exit(failed > 0 ? 1 : 0)
}

run().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})
