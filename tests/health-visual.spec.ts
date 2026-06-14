/**
 * Health Page Visual & Functional Tests
 *
 * Test Levels: TL1 (UI) + TL2 (Tab/Pet) + TL3 (Data Flow)
 */
import puppeteer from 'puppeteer'

const BASE_URL = 'http://localhost:5173'
async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function run() {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] })
  const page = await browser.newPage()
  page.setDefaultTimeout(10000)
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
  await sleep(1500)

  let passed = 0, failed = 0
  const results: { level: string; name: string; passed: boolean }[] = []
  function assert(cond: boolean, name: string, level = 'TL1') {
    results.push({ level, name, passed: cond })
    console.log(`  ${cond ? '✅' : '❌'} [${level}] ${name}`)
    cond ? passed++ : failed++
  }

  // Navigate to Health via sidebar
  await page.evaluate(() => {
    const nav = document.querySelector('nav')
    if (!nav) return
    const btn = Array.from(nav.querySelectorAll('button')).find((b: any) => b.textContent?.trim() === 'Health')
    if (btn) btn.click()
  })
  await sleep(1000)

  // ═══════════════ TL1: UI RENDERING ═══════════════
  console.log('\n📋 [TL1] Health Page')

  // Sidebar highlight
  const sidebarHealth = await page.evaluate(() => {
    const nav = document.querySelector('nav')
    const btn = Array.from(nav?.querySelectorAll('button') ?? []).find((b: any) => b.textContent?.trim() === 'Health')
    return btn ? getComputedStyle(btn).backgroundColor : ''
  })
  assert(sidebarHealth.includes('rgb(0, 122, 255)'), 'Sidebar "Health" highlighted in blue', 'TL1')

  // PetSelector visible
  const petSelectorText = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const sel = buttons.find((b: any) => (b.textContent?.includes('Luna') || b.textContent?.includes('Max')) && b.querySelector('svg'))
    return sel?.textContent?.trim() ?? ''
  })
  assert(petSelectorText.includes('Luna'), `PetSelector: "${petSelectorText}"`, 'TL1')

  // Tab selector shows current tab
  const currentTabText = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const tab = buttons.find((b: any) => b.querySelector('svg') && (b.textContent?.includes('Vaccinations') || b.textContent?.includes('Visits') || b.textContent?.includes('Medications')))
    return tab?.textContent?.trim() ?? ''
  })
  assert(currentTabText.includes('Vaccinations'), `Tab: "${currentTabText}"`, 'TL1')

  // Open tab dropdown to verify all 3 options
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const tab = buttons.find((b: any) => b.querySelector('svg') && b.textContent?.includes('Vaccinations'))
    if (tab) tab.click()
  })
  await sleep(400)
  const allTabs = await page.evaluate(() => {
    const body = document.body.innerText
    return { vax: body.includes('Vaccinations'), visits: body.includes('Visits'), meds: body.includes('Medications') }
  })
  assert(allTabs.vax && allTabs.visits && allTabs.meds, 'All 3 tabs in dropdown', 'TL1')

  // Click Medications dropdown item to switch tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const medsItem = buttons.find((b: any) => b.textContent?.includes('Medications') && !b.querySelector('svg'))
    if (medsItem) medsItem.click()
  })
  await sleep(600)

  const medsContent = await page.evaluate(() => {
    const body = document.body.innerText
    return {
      hasTitle: body.includes('Medications'),
      hasDrug: body.includes('Hairball Relief') || body.includes('Apoquel'),
      hasActive: body.includes('Active'),
      hasAddMed: body.includes('Add Medication'),
    }
  })
  assert(medsContent.hasTitle, 'Medications tab active', 'TL1')
  assert(medsContent.hasDrug, 'Medication entries visible', 'TL1')
  assert(medsContent.hasActive, 'Active status badge', 'TL1')
  assert(medsContent.hasAddMed, '"Add Medication" button', 'TL1')

  // Switch to Vet Visits tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const tab = buttons.find((b: any) => b.querySelector('svg') && b.textContent?.includes('Medications'))
    if (tab) tab.click()
  })
  await sleep(400)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const visitsItem = buttons.find((b: any) => b.textContent?.includes('Visits') && !b.querySelector('svg'))
    if (visitsItem) visitsItem.click()
  })
  await sleep(600)

  const visitsContent = await page.evaluate(() => {
    const body = document.body.innerText
    return {
      hasCheckup: body.includes('Annual checkup') || body.includes('Checkup'),
      hasVet: body.includes('Dr.'),
      hasCost: body.includes('$'),
      hasAdd: body.includes('Add Visit'),
    }
  })
  assert(visitsContent.hasCheckup, 'Vet visits: checkup entry', 'TL1')
  assert(visitsContent.hasVet, 'Vet visits: Dr. name', 'TL1')
  assert(visitsContent.hasAdd, 'Vet visits: "Add Visit" button', 'TL1')

  // Switch back to Vaccinations tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const tab = buttons.find((b: any) => b.querySelector('svg') && b.textContent?.includes('Visits'))
    if (tab) tab.click()
  })
  await sleep(400)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const vaxItem = buttons.find((b: any) => b.textContent?.includes('Vaccinations') && !b.querySelector('svg'))
    if (vaxItem) vaxItem.click()
  })
  await sleep(600)

  const vaxContent = await page.evaluate(() => {
    const body = document.body.innerText
    return {
      hasFVRCP: body.includes('FVRCP'),
      hasRabies: body.includes('Rabies'),
      hasStatus: body.includes('Completed') || body.includes('Upcoming'),
      hasAdd: body.includes('Add Record'),
    }
  })
  assert(vaxContent.hasFVRCP, 'Vaccinations: FVRCP listed', 'TL1')
  assert(vaxContent.hasRabies, 'Vaccinations: Rabies listed', 'TL1')
  assert(vaxContent.hasStatus, 'Vaccinations: status badges', 'TL1')
  assert(vaxContent.hasAdd, 'Vaccinations: "Add Record" button', 'TL1')

  // ═══════════════ TL2: PET SWITCHING ═══════════════
  console.log('\n📋 [TL2] Pet Switching — Data Changes')

  // Open pet selector
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const pet = buttons.find((b: any) => b.textContent?.includes('Luna') && b.querySelector('svg'))
    if (pet) pet.click()
  })
  await sleep(400)

  // Select Max
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const maxBtn = buttons.find((b: any) => b.textContent?.includes('Max') && !b.querySelector('svg'))
    if (maxBtn) maxBtn.click()
  })
  await sleep(800)

  const maxData = await page.evaluate(() => {
    const body = document.body.innerText
    return {
      hasDHPP: body.includes('DHPP'),
      hasBordetella: body.includes('Bordetella'),
      hasLepto: body.includes('Leptospirosis'),
      hasOverdue: body.includes('Overdue'),
      noFelineLeukemia: !body.includes('Feline Leukemia'),
    }
  })
  assert(maxData.hasDHPP, 'Max: DHPP vaccine shown', 'TL2')
  assert(maxData.hasBordetella, 'Max: Bordetella vaccine shown', 'TL2')
  assert(maxData.hasLepto, 'Max: Leptospirosis vaccine shown', 'TL2')
  assert(maxData.hasOverdue, 'Max: Overdue badge visible', 'TL2')
  assert(maxData.noFelineLeukemia, 'Max: Luna-specific vaccine not shown', 'TL2')

  // ═══════════════ TL3: DEEP DATA CONSISTENCY ═══════════════
  console.log('\n📋 [TL3] Deep Data Consistency')

  // Switch to Coco → Medications tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const pet = buttons.find((b: any) => b.textContent?.includes('Max') && b.querySelector('svg'))
    if (pet) pet.click()
  })
  await sleep(400)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const cocoBtn = buttons.find((b: any) => b.textContent?.includes('Coco') && !b.querySelector('svg'))
    if (cocoBtn) cocoBtn.click()
  })
  await sleep(600)

  // Medications tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const tab = buttons.find((b: any) => b.querySelector('svg') && b.textContent?.includes('Vaccinations'))
    if (tab) tab.click()
  })
  await sleep(400)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const medsItem = buttons.find((b: any) => b.textContent?.includes('Medications') && !b.querySelector('svg'))
    if (medsItem) medsItem.click()
  })
  await sleep(600)

  const cocoMeds = await page.evaluate(() => {
    const body = document.body.innerText
    return { apoquel: body.includes('Apoquel'), heartgard: body.includes('Heartgard') }
  })
  assert(cocoMeds.apoquel, 'Coco: Apoquel medication visible', 'TL3')
  assert(cocoMeds.heartgard, 'Coco: Heartgard medication visible', 'TL3')

  // Switch to Bella → check empty medications
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const pet = buttons.find((b: any) => b.textContent?.includes('Coco') && b.querySelector('svg'))
    if (pet) pet.click()
  })
  await sleep(400)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const bellaBtn = buttons.find((b: any) => b.textContent?.includes('Bella') && !b.querySelector('svg'))
    if (bellaBtn) bellaBtn.click()
  })
  await sleep(600)

  const bellaEmpty = await page.evaluate(() => {
    const body = document.body.innerText
    return body.includes('No medications') || body.includes('no medications')
  })
  assert(bellaEmpty, 'Bella: Empty medications state shown', 'TL3')

  // ═══════════════ SUMMARY ═══════════════
  console.log(`\n${'='.repeat(50)}`)
  console.log(`📊 Results: ${passed} passed, ${failed} failed`)
  const byLevel = (lvl: string) => {
    const t = results.filter(r => r.level === lvl)
    return `${t.filter(r => r.passed).length}/${t.length}`
  }
  console.log(`📋 By Test Level:`)
  console.log(`   TL1 (UI Rendering):      ${byLevel('TL1')} passed`)
  console.log(`   TL2 (Pet Switching):     ${byLevel('TL2')} passed`)
  console.log(`   TL3 (Data Consistency):  ${byLevel('TL3')} passed`)
  console.log(`${'='.repeat(50)}`)

  await browser.close()
  process.exit(failed > 0 ? 1 : 0)
}

run().catch(err => { console.error('Test failed:', err); process.exit(1) })
