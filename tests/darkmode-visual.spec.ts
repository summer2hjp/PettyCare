/**
 * PettyCare Dark Mode Visual Tests
 *
 * Tests the dark mode enhancement: ShapeGrid, Dock, ShinyText, MagicRings.
 *
 * Run: npx tsx tests/darkmode-visual.spec.ts
 *
 * Prerequisites: Dev server running at http://localhost:5173
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

  const stderrChunks: string[] = []
  server.stderr?.on('data', (data: Buffer) => {
    stderrChunks.push(data.toString())
  })

  const started = await new Promise<boolean>(resolve => {
    const timeout = setTimeout(() => {
      server.kill()
      resolve(false)
    }, 30000)

    server.stdout?.on('data', (data: Buffer) => {
      const text = data.toString()
      if (text.includes('Local:') || text.includes('localhost:5173')) {
        clearTimeout(timeout)
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
      `Failed to start dev server.\n${stderr ? `Stderr:\n${stderr}` : 'No output — try "npm install" first.'}`
    )
  }

  console.log('  Dev server is ready.')
  return server
}

// ── TL1: ShapeGrid Background ──

async function testShapeGridDark(page: Page) {
  group('TL1: ShapeGrid (Dark Mode Background)')

  // ShapeGrid only renders in dark mode
  await page.evaluate(() => {
    localStorage.setItem('pettycare-theme', 'dark')
    document.documentElement.classList.add('dark')
  })
  await page.reload({ waitUntil: 'networkidle0' })
  await sleep(500)

  const hasDarkClass = await page.evaluate(() =>
    document.documentElement.classList.contains('dark')
  )
  assert(hasDarkClass, 'App is in dark mode')

  // ShapeGrid renders a canvas in the overlay div
  const hasShapeGridCanvas = await page.evaluate(() => {
    const container = document.querySelector('.h-dvh > .absolute.inset-0')
    if (!container) return false
    return container.querySelector('canvas') !== null
  })
  assert(hasShapeGridCanvas, 'ShapeGrid canvas renders in dark mode')

  // Canvas has aria-hidden
  const canvasAriaHidden = await page.evaluate(() => {
    const container = document.querySelector('.h-dvh > .absolute.inset-0')
    if (!container) return false
    const canvas = container.querySelector('canvas')
    return canvas?.getAttribute('aria-hidden') === 'true'
  })
  assert(canvasAriaHidden, 'ShapeGrid canvas has aria-hidden="true"')
}

// ── TL1: Dock in Dark Mode ──

async function testDockDark(page: Page) {
  group('TL1: Dock (Dark Mode Toolbar)')

  // In dark mode, toolbar right actions are replaced by Dock
  const hasDockToolbar = await page.evaluate(() => {
    const header = document.querySelector('header')
    if (!header) return false
    const dock = header.querySelector('[role="toolbar"]')
    return dock !== null && dock?.getAttribute('aria-label') === 'Application dock'
  })
  assert(hasDockToolbar, 'Dock toolbar renders in dark mode in header')

  // Dock has items
  const dockItemCount = await page.evaluate(() => {
    const dock = document.querySelector('[role="toolbar"]')
    if (!dock) return 0
    return dock.querySelectorAll('button').length
  })
  assert(dockItemCount >= 3, `Dock shows at least 3 items (got ${dockItemCount})`)

  // Switch back to light mode to verify Dock unmounts
  await page.evaluate(() => {
    localStorage.setItem('pettycare-theme', 'light')
    document.documentElement.classList.remove('dark')
  })
  await page.reload({ waitUntil: 'networkidle0' })
  await sleep(500)

  const hasNoDock = await page.evaluate(() => {
    return document.querySelector('[role="toolbar"]') === null
  })
  assert(hasNoDock, 'Dock is not rendered in light mode')
}

// ── TL1: ShinyText in Settings ──

async function testShinyText(page: Page) {
  group('TL1: ShinyText')

  await page.evaluate(() => {
    localStorage.setItem('pettycare-theme', 'dark')
    document.documentElement.classList.add('dark')
  })
  await page.reload({ waitUntil: 'networkidle0' })
  await sleep(500)

  // Navigate to Settings
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('aside nav button')
    for (const btn of buttons) {
      if (btn.textContent?.trim() === 'Settings') {
        btn.click()
        break
      }
    }
  })
  await sleep(500)

  // Check for shiny-text elements (section titles)
  const shinyTextCount = await page.evaluate(() => {
    return document.querySelectorAll('.shiny-text').length
  })
  assert(shinyTextCount >= 3, `At least 3 ShinyText elements found (got ${shinyTextCount})`)
}

// ── TL2: MagicRings on Dashboard ──

async function testMagicRingsDashboard(page: Page) {
  group('TL2: MagicRings (Dashboard)')

  // Navigate to Dashboard in dark mode
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('aside nav button')
    for (const btn of buttons) {
      if (btn.textContent?.trim() === 'Dashboard') {
        btn.click()
        break
      }
    }
  })
  await sleep(500)

  const magicRingsCount = await page.evaluate(() => {
    const parents = document.querySelectorAll('.grid > .relative')
    let count = 0
    parents.forEach(p => {
      const rings = p.querySelector(':scope > .overflow-hidden')
      if (rings) count++
    })
    return count
  })
  assert(magicRingsCount >= 2, `At least 2 MagicRings instances visible on Dashboard (got ${magicRingsCount})`)
}

// ── TL2: Theme Toggle Switches Components ──

async function testThemeToggleComponents(page: Page) {
  group('TL2: Theme Toggle Component Swap')

  await page.evaluate(() => {
    localStorage.setItem('pettycare-theme', 'light')
    document.documentElement.classList.remove('dark')
  })
  await page.reload({ waitUntil: 'networkidle0' })
  await sleep(500)

  const noCanvas = await page.evaluate(() => {
    const container = document.querySelector('.h-dvh > .absolute.inset-0')
    if (!container) return true
    return container.querySelector('canvas') === null
  })
  assert(noCanvas, 'ShapeGrid canvas absent in light mode')

  // Toggle to dark
  await page.evaluate(() => {
    const header = document.querySelector('header')
    if (!header) return
    const buttons = header.querySelectorAll('button')
    for (const btn of buttons) {
      const svg = btn.querySelector('svg')
      if (svg) {
        const paths = svg.querySelectorAll('path')
        for (const p of paths) {
          const d = p.getAttribute('d') ?? ''
          if (d.includes('M12 3a6')) {
            btn.click()
            return
          }
        }
      }
    }
  })
  await sleep(700)

  const dockAfterToggle = await page.evaluate(() => {
    return document.querySelector('[role="toolbar"]') !== null
  })
  assert(dockAfterToggle, 'Dock appears after toggling to dark mode')

  // Toggle back to light
  await page.evaluate(() => {
    const header = document.querySelector('header')
    if (!header) return
    const buttons = header.querySelectorAll('button')
    for (const btn of buttons) {
      const svg = btn.querySelector('svg')
      if (svg) {
        const paths = svg.querySelectorAll('path')
        for (const p of paths) {
          const d = p.getAttribute('d') ?? ''
          if (d.includes('M12 2v2')) {
            btn.click()
            return
          }
        }
      }
    }
  })
  await sleep(700)

  const dockAfterSecondToggle = await page.evaluate(() => {
    return document.querySelector('[role="toolbar"]') !== null
  })
  assert(!dockAfterSecondToggle, 'Dock disappears after toggling back to light mode')
}

// ── Main ──

async function main() {
  console.log('===========================================')
  console.log('  PettyCare Dark Mode Visual Tests')
  console.log('===========================================')

  let devServer: ChildProcess | null = null
  const running = await isServerRunning()

  if (!running) {
    try {
      devServer = await startDevServer()
    } catch (err) {
      console.error(`\nError: ${err instanceof Error ? err.message : String(err)}`)
      process.exit(1)
    }
  } else {
    console.log('  Dev server is already running.')
  }

  let browser: Browser | undefined
  let exitCode = 0

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()
    await page.setViewport(VIEWPORT)

    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 15000 })
    await page.waitForSelector('aside', { timeout: 5000 })
    await page.waitForSelector('header', { timeout: 5000 })

    await testShapeGridDark(page)
    await testDockDark(page)
    await testShinyText(page)
    await testMagicRingsDashboard(page)
    await testThemeToggleComponents(page)

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
      await sleep(500)
    }
  }

  process.exit(exitCode)
}

main()