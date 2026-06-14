/**
 * PettyCare Chrome Visual Tests
 *
 * Tests the global app chrome: sidebar, toolbar, layout structure,
 * navigation, search overlay, and theme toggle.
 *
 * Run: npx tsx tests/chrome-visual.spec.ts
 *
 * Prerequisites: Dev server running at http://localhost:5173
 * (will auto-start if not already running)
 */

import puppeteer, { type Page, type Browser } from 'puppeteer'
import { spawn, type ChildProcess } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'

// ── Paths ──
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '..')
const BASE_URL = 'http://localhost:5173'
const VIEWPORT = { width: 1280, height: 800 }

// ── Test state ──
let passed = 0
let failed = 0
const failures: { group: string; msg: string }[] = []
let currentGroup = ''

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++
    console.log(`  ✓  ${message}`)
  } else {
    failed++
    failures.push({ group: currentGroup, msg: message })
    console.log(`  ✗  ${message}`)
  }
}

function group(name: string) {
  currentGroup = name
  console.log(`\n--- ${name} ---`)
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ── Dev server management ──

async function isServerRunning(): Promise<boolean> {
  return new Promise(resolve => {
    const req = http.get(BASE_URL, res => {
      res.resume()
      resolve(true)
    })
    req.on('error', () => resolve(false))
    req.setTimeout(2000, () => {
      req.destroy()
      resolve(false)
    })
  })
}

async function startDevServer(): Promise<ChildProcess> {
  console.log('  Starting dev server...')
  const server = spawn('npm', ['run', 'dev'], {
    cwd: PROJECT_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    env: { ...process.env },
  })

  // Collect stderr for error reporting
  const stderrChunks: string[] = []
  server.stderr?.on('data', (data: Buffer) => {
    stderrChunks.push(data.toString())
  })

  // Wait for server to be ready
  const started = await new Promise<boolean>(resolve => {
    const timeout = setTimeout(() => {
      server.kill()
      resolve(false)
    }, 30000)

    server.stdout?.on('data', (data: Buffer) => {
      const text = data.toString()
      // Vite outputs "Local:" when ready
      if (text.includes('Local:') || text.includes('localhost:5173')) {
        clearTimeout(timeout)
        // Give it a moment to stabilize
        setTimeout(() => resolve(true), 500)
      }
    })

    server.on('error', () => {
      clearTimeout(timeout)
      resolve(false)
    })

    server.on('exit', () => {
      clearTimeout(timeout)
      resolve(false)
    })
  })

  if (!started) {
    const stderr = stderrChunks.join('\n')
    server.kill()
    throw new Error(
      `Failed to start dev server.\n${stderr ? `Stderr:\n${stderr}` : 'No output — is the project set up correctly? Try "npm install" first.'}`
    )
  }

  console.log('  Dev server is ready.')
  return server
}

// ── Helper: ensure app is in known state ──

async function resetAppState(page: Page) {
  // Force light theme for consistent test baseline
  await page.evaluate(() => {
    localStorage.setItem('pettycare-theme', 'light')
    document.documentElement.classList.remove('dark')
  })
}

// ── TL1: Sidebar Rendering ──

async function testSidebarRendering(page: Page) {
  group('TL1: Sidebar Rendering')

  // 1. Logo link with paw emoji and PettyCare text, linking to GitHub
  const linkHref = await page.evaluate(() => {
    const link = document.querySelector('a[href*="github"]')
    return link?.getAttribute('href') ?? null
  })
  assert(linkHref === 'https://github.com/summer2hjp/PettyCare',
    'Sidebar logo links to https://github.com/summer2hjp/PettyCare')

  const linkText = await page.evaluate(() => {
    const link = document.querySelector('a[href*="github"]')
    return link?.textContent ?? ''
  })
  assert(linkText.includes('\u{1F43E}'), 'Sidebar logo contains paw emoji')
  assert(linkText.includes('PettyCare'), 'Sidebar logo contains "PettyCare" text')

  // 2. Seven nav items with correct labels in order
  const navLabels = await page.evaluate(() => {
    const buttons = document.querySelectorAll('aside nav button')
    return Array.from(buttons).map(b => b.textContent?.trim() ?? '')
  })
  const expectedLabels = ['Dashboard', 'Pets', 'Health', 'Activity', 'Feeding', 'Appointments', 'Settings']
  assert(navLabels.length === 7, 'Seven nav items rendered')
  for (let i = 0; i < expectedLabels.length; i++) {
    const match = navLabels[i] === expectedLabels[i]
    assert(match, `Nav item ${i + 1} is "${expectedLabels[i]}"`)
  }

  // 3. Active item (Dashboard by default) has blue highlighted background
  const activeItemInfo = await page.evaluate(() => {
    const buttons = document.querySelectorAll('aside nav button')
    for (const btn of buttons) {
      const style = window.getComputedStyle(btn)
      // bg-apple-blue = #007AFF = rgb(0, 122, 255)
      if (style.backgroundColor === 'rgb(0, 122, 255)') {
        return {
          label: btn.textContent?.trim() ?? '',
          color: style.color,
          fontWeight: style.fontWeight,
        }
      }
    }
    return null
  })
  assert(activeItemInfo !== null, 'An active nav item has blue background')
  assert(activeItemInfo?.label === 'Dashboard', 'Active nav item is Dashboard')
  assert(activeItemInfo?.color === 'rgb(255, 255, 255)', 'Active nav item has white text')
  assert(activeItemInfo?.fontWeight === '600', 'Active nav item has font-semibold (600)')

  // 4. Each nav item has an SVG icon
  const iconCount = await page.evaluate(() => {
    const buttons = document.querySelectorAll('aside nav button')
    return Array.from(buttons).filter(b => b.querySelector('svg')).length
  })
  assert(iconCount === 7, 'All 7 nav items contain an SVG icon')

  // 5. Sidebar width is w-60 (~240px)
  const sidebarWidth = await page.evaluate(() => {
    const aside = document.querySelector('aside')
    return aside ? Math.round(aside.getBoundingClientRect().width) : 0
  })
  // w-60 = 15rem. With default 16px root font = 240px.
  // Allow small tolerance for sub-pixel rendering.
  assert(Math.abs(sidebarWidth - 240) <= 2, `Sidebar width is ~240px (got ${sidebarWidth}px)`)
}

// ── TL1: Toolbar Rendering ──

async function testToolbarRendering(page: Page) {
  group('TL1: Toolbar Rendering')

  // 1. Title displays "Welcome back 👋" on Dashboard
  const titleText = await page.evaluate(() => {
    const h1 = document.querySelector('header h1')
    return h1?.textContent?.trim() ?? ''
  })
  assert(titleText.includes('Welcome back'), 'Toolbar title shows "Welcome back"')
  assert(titleText.includes('\u{1F44B}'), 'Toolbar title includes wave emoji')

  // 2. Search button with Search icon exists
  const hasSearchBtn = await page.evaluate(() => {
    const header = document.querySelector('header')
    if (!header) return false
    const buttons = header.querySelectorAll('button')
    return Array.from(buttons).some(btn => btn.querySelector('svg[viewBox="0 0 24 24"]'))
  })
  assert(hasSearchBtn, 'Search button with SVG icon exists in toolbar')

  // 3. Notification bell button exists
  const hasBellBtn = await page.evaluate(() => {
    const header = document.querySelector('header')
    if (!header) return false
    const buttons = header.querySelectorAll('button svg')
    // Bell icon has a distinctive path or we can check for aria-label
    // More reliably, check for multiple SVG elements (search + bell + theme)
    return Array.from(buttons).length >= 3 // at least search, bell, theme
  })
  assert(hasBellBtn, 'Notification bell button exists in toolbar')

  // 4. Theme toggle button exists (shows Moon icon in light mode)
  const hasMoonIcon = await page.evaluate(() => {
    const header = document.querySelector('header')
    if (!header) return false
    const buttons = header.querySelectorAll('button')
    for (const btn of buttons) {
      const svg = btn.querySelector('svg')
      if (svg) {
        const paths = svg.querySelectorAll('path')
        // Moon icon SVG path data: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
        for (const p of paths) {
          const d = p.getAttribute('d') ?? ''
          if (d.includes('M12 3a6')) return true
        }
      }
    }
    return false
  })
  assert(hasMoonIcon, 'Theme toggle shows Moon icon in light mode')

  // 5. User avatar area with 👤 emoji
  const hasUserAvatar = await page.evaluate(() => {
    const header = document.querySelector('header')
    if (!header) return false
    return header.textContent?.includes('\u{1F464}') ?? false
  })
  assert(hasUserAvatar, 'User avatar area shows 👤 emoji')
}

// ── TL1: Layout Structure ──

async function testLayoutStructure(page: Page) {
  group('TL1: Layout Structure')

  // 1. Page has sidebar on left + main content area
  const hasSidebar = await page.evaluate(() => {
    return document.querySelector('aside') !== null
  })
  assert(hasSidebar, 'Sidebar (<aside>) exists on the page')

  // The main content area is the div next to aside (the flex-1 container)
  const hasMainContent = await page.evaluate(() => {
    const aside = document.querySelector('aside')
    if (!aside) return false
    // The sibling of aside should be the main content wrapper
    const sibling = aside.nextElementSibling
    if (!sibling) return false
    // It should contain a <main> element
    return sibling.querySelector('main') !== null
  })
  assert(hasMainContent, 'Main content area exists next to sidebar')

  // 2. Header toolbar spans across top of content area
  const headerInContent = await page.evaluate(() => {
    const aside = document.querySelector('aside')
    if (!aside) return false
    const content = aside.nextElementSibling
    if (!content) return false
    // The header should be the first child of the content wrapper
    const firstChild = content.firstElementChild
    return firstChild?.tagName === 'HEADER'
  })
  assert(headerInContent, 'Header toolbar is first child in content area (spans top)')

  // 3. Main content is scrollable (has overflow-y-auto)
  const isMainScrollable = await page.evaluate(() => {
    const main = document.querySelector('main')
    if (!main) return false
    const style = window.getComputedStyle(main)
    return style.overflowY === 'auto' || style.overflowY === 'scroll'
  })
  assert(isMainScrollable, 'Main content area is scrollable (overflow-y-auto)')
}

// ── TL2: Sidebar Navigation ──

async function testSidebarNavigation(page: Page) {
  group('TL2: Sidebar Navigation')

  // Helper to click a nav item by label and wait for render
  async function clickNav(label: string) {
    await page.evaluate((lbl: string) => {
      const buttons = document.querySelectorAll('aside nav button')
      for (const btn of buttons) {
        if (btn.textContent?.trim() === lbl) {
          btn.click()
          break
        }
      }
    }, label)
    // Wait a tick for React state to update
    await sleep(300)
  }

  async function activeNavLabel(): Promise<string | null> {
    return page.evaluate(() => {
      const buttons = document.querySelectorAll('aside nav button')
      for (const btn of buttons) {
        const style = window.getComputedStyle(btn)
        if (style.backgroundColor === 'rgb(0, 122, 255)') {
          return btn.textContent?.trim() ?? null
        }
      }
      return null
    })
  }

  // 1. Click "Pets" -> page content changes to pet list, Pets highlighted
  const hasAddPetBefore = await page.evaluate(() =>
    document.body.textContent?.includes('Add Pet') ?? false
  )
  // Should be on Dashboard now, so Add Pet not visible yet
  // (Dashboard doesn't have "Add Pet" button)

  await clickNav('Pets')
  await sleep(200)

  // Check Pets nav is highlighted
  assert(await activeNavLabel() === 'Pets', 'After clicking Pets, Pets nav item is active (blue)')

  // Check page content changed — PetListPage has "Add Pet" button
  const hasAddPetAfter = await page.evaluate(() =>
    document.body.textContent?.includes('Add Pet') ?? false
  )
  assert(hasAddPetAfter, 'After clicking Pets, page shows pet list content ("Add Pet" button)')

  // 2. Click "Health" -> page content changes, Health highlighted
  await clickNav('Health')
  await sleep(200)

  assert(await activeNavLabel() === 'Health', 'After clicking Health, Health nav item is active (blue)')

  // Health page has PetSelector component and vaccination data
  const hasHealthContent = await page.evaluate(() =>
    document.body.textContent?.includes('Vaccinations') ?? false
  )
  assert(hasHealthContent, 'After clicking Health, page shows health content ("Vaccinations" tab)')

  // 3. Click "Dashboard" -> returns to Dashboard with correct highlight
  await clickNav('Dashboard')
  await sleep(200)

  assert(await activeNavLabel() === 'Dashboard', 'After clicking Dashboard, Dashboard nav item is active (blue)')

  const hasDashboardTitle = await page.evaluate(() => {
    const h1 = document.querySelector('header h1')
    return h1?.textContent?.includes('Welcome back') ?? false
  })
  assert(hasDashboardTitle, 'After clicking Dashboard, Dashboard page content renders ("Welcome back" title)')
}

// ── TL2: Search Overlay ──

async function testSearchOverlay(page: Page) {
  group('TL2: Search Overlay')

  // 1. Click search button -> overlay opens with search input
  // Target the search button via the actions container: first button in header .ml-auto
  await page.evaluate(() => {
    const actionsDiv = document.querySelector('header .ml-auto')
    if (!actionsDiv) return
    const firstBtn = actionsDiv.querySelector('button')
    if (firstBtn) firstBtn.click()
  })
  await sleep(400) // slide-down animation duration

  // Check overlay is visible by looking for the search input with specific placeholder
  const overlayVisible = await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="Search"]')
    return input !== null
  })
  assert(overlayVisible, 'Search overlay opens when search button is clicked')

  // 2. Search input has correct placeholder
  const placeholder = await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="Search"]')
    return input?.getAttribute('placeholder') ?? ''
  })
  assert(placeholder === 'Search pets, health records, reminders...',
    'Search input has placeholder "Search pets, health records, reminders..."')

  // 3. Quick links appear
  const hasQuickLinks = await page.evaluate(() => {
    const body = document.body.textContent ?? ''
    return body.includes('Vaccination Schedule') &&
      body.includes('Weight Tracking') &&
      body.includes('Vet Appointments') &&
      body.includes('Medication Reminders') &&
      body.includes('Feeding Plan') &&
      body.includes('Activity Log')
  })
  assert(hasQuickLinks, 'Quick links section shows all 6 items (Vaccination Schedule, Weight Tracking, Vet Appointments, Medication Reminders, Feeding Plan, Activity Log)')

  // 4. Close with X button -> overlay closes
  // Find the X button inside the search overlay (the button that contains X icon SVG paths)
  await page.evaluate(() => {
    const allButtons = document.querySelectorAll('button')
    for (const btn of allButtons) {
      const svg = btn.querySelector('svg')
      if (!svg) continue
      const paths = svg.querySelectorAll('path')
      for (const p of paths) {
        const d = p.getAttribute('d') ?? ''
        // X icon paths are: "M18 6 6 18" and "m6 6 12 12"
        if (d.includes('M18 6') && d.includes('6 18')) {
          btn.click()
          return
        }
      }
    }
  })
  await sleep(300)

  const overlayClosed = await page.evaluate(() => {
    // Verify the overlay search input is gone
    const input = document.querySelector('input[placeholder*="Search"]')
    return input === null
  })
  assert(overlayClosed, 'Search overlay closes when X button is clicked')
}

// ── TL2: Theme Toggle ──

async function testThemeToggle(page: Page) {
  group('TL2: Theme Toggle')

  // Ensure we start in light mode
  await resetAppState(page)

  // 1. Click theme toggle -> dark class added, icon changes to Sun
  const wasDarkBefore = await page.evaluate(() =>
    document.documentElement.classList.contains('dark')
  )
  assert(!wasDarkBefore, 'Initially no .dark class on <html> (light mode)')

  // Click the theme toggle button
  const toggledDark = await page.evaluate(() => {
    const header = document.querySelector('header')
    if (!header) return false
    const buttons = header.querySelectorAll('button')
    for (const btn of buttons) {
      const svg = btn.querySelector('svg')
      if (svg) {
        const paths = svg.querySelectorAll('path')
        for (const p of paths) {
          const d = p.getAttribute('d') ?? ''
          // Moon icon: "M12 3a6 6 0 0 0 9 9..."
          if (d.includes('M12 3a6')) {
            btn.click()
            return true
          }
        }
      }
    }
    return false
  })
  assert(toggledDark, 'Theme toggle button was found and clicked')

  // Wait for useTheme's debounce (400ms) to expire before toggling back
  await sleep(500)

  const isDarkAfterToggle = await page.evaluate(() =>
    document.documentElement.classList.contains('dark')
  )
  assert(isDarkAfterToggle, 'After clicking theme toggle, .dark class is present on <html>')

  // Check that Sun icon is now visible (dark mode shows Sun)
  const hasSunIcon = await page.evaluate(() => {
    const header = document.querySelector('header')
    if (!header) return false
    const buttons = header.querySelectorAll('button')
    for (const btn of buttons) {
      const svg = btn.querySelector('svg')
      if (svg) {
        const paths = svg.querySelectorAll('path')
        for (const p of paths) {
          const d = p.getAttribute('d') ?? ''
          // Sun icon has a path like "M12 2v2" (circle center)
          if (d.includes('M12 2v2')) return true
        }
      }
    }
    return false
  })
  assert(hasSunIcon, 'After toggle to dark, theme button shows Sun icon')

  // 2. Click toggle again -> .dark class removed, icon changes to Moon
  const toggledLight = await page.evaluate(() => {
    const header = document.querySelector('header')
    if (!header) return false
    const buttons = header.querySelectorAll('button')
    for (const btn of buttons) {
      const svg = btn.querySelector('svg')
      if (svg) {
        const paths = svg.querySelectorAll('path')
        for (const p of paths) {
          const d = p.getAttribute('d') ?? ''
          // Sun icon: "M12 2v2"
          if (d.includes('M12 2v2')) {
            btn.click()
            return true
          }
        }
      }
    }
    return false
  })
  assert(toggledLight, 'Theme toggle button (now Sun) was found and clicked')

  // Wait for useTheme's debounce (400ms) to expire before toggling back
  await sleep(500)

  const isDarkAfterSecondToggle = await page.evaluate(() =>
    document.documentElement.classList.contains('dark')
  )
  assert(!isDarkAfterSecondToggle, 'After second toggle, .dark class is removed from <html>')
}

// ── Main ──

async function main() {
  console.log('===========================================')
  console.log('  PettyCare Chrome Visual Tests')
  console.log('===========================================')

  // ── Dev server ──
  let devServer: ChildProcess | null = null
  const running = await isServerRunning()

  if (!running) {
    try {
      devServer = await startDevServer()
    } catch (err) {
      console.error(`\nError: ${err instanceof Error ? err.message : String(err)}`)
      console.error('Make sure the project is set up: npm install')
      process.exit(1)
    }
  } else {
    console.log('  Dev server is already running.')
  }

  // ── Puppeteer ──
  let browser: Browser | undefined
  let exitCode = 0

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()
    await page.setViewport(VIEWPORT)

    // Initial load
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 15000 })
    // Reset to light mode baseline
    await resetAppState(page)
    await page.reload({ waitUntil: 'networkidle0' })

    // Wait for app chrome to render
    await page.waitForSelector('aside', { timeout: 5000 })
    await page.waitForSelector('header', { timeout: 5000 })

    // ── Run Tests ──
    await testSidebarRendering(page)
    await testToolbarRendering(page)
    await testLayoutStructure(page)
    await testSidebarNavigation(page)
    await testSearchOverlay(page)
    await testThemeToggle(page)

    // ── Report ──
    const total = passed + failed
    console.log(`\n${'='.repeat(43)}`)
    console.log(`  Results: ${passed}/${total} passed, ${failed} failed`)
    if (failures.length > 0) {
      console.log(`\n  Issues:`)
      const byGroup: Record<string, string[]> = {}
      for (const f of failures) {
        if (!byGroup[f.group]) byGroup[f.group] = []
        byGroup[f.group].push(f.msg)
      }
      for (const [groupName, msgs] of Object.entries(byGroup)) {
        console.log(`    ${groupName}:`)
        for (const m of msgs) {
          console.log(`      - ${m}`)
        }
      }
      console.log()
    }
    console.log(`  Status: ${failed === 0 ? 'ALL PASSED' : 'SOME FAILED'}`)
    console.log(`${'='.repeat(43)}\n`)

    if (failed > 0) {
      exitCode = 1
    }
  } catch (err) {
    console.error(`\nFatal error: ${err instanceof Error ? err.message : String(err)}`)
    if (err instanceof Error && err.stack) {
      console.error(err.stack)
    }
    exitCode = 1
  } finally {
    if (browser) await browser.close()
    if (devServer) {
      devServer.kill('SIGTERM')
      // Give it a moment to shut down
      await sleep(500)
    }
  }

  process.exit(exitCode)
}

main()
