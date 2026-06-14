import { useState, useEffect, useCallback, useRef } from 'react'

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'pettycare-theme'
const TRANSITION_DURATION = 400 // ms, matches CSS transition timing

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const transitioningRef = useRef(false)

  // ── Sync .dark class + localStorage ──
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  // ── Follow OS preference when no explicit user choice ──
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')

    const handler = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem(STORAGE_KEY)
      // Only auto-switch if user hasn't explicitly toggled
      if (stored !== 'light' && stored !== 'dark') {
        setThemeState(e.matches ? 'dark' : 'light')
      }
    }

    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // ── Smooth transition wrapper ──
  const toggleTheme = useCallback(() => {
    if (transitioningRef.current) return // debounce rapid toggles

    const root = document.documentElement
    const next = theme === 'light' ? 'dark' : 'light'

    // Add transition class before the change
    root.classList.add('theme-transitioning')
    transitioningRef.current = true

    // Perform the toggle
    setThemeState(next)

    // Remove transition class after animation completes
    setTimeout(() => {
      root.classList.remove('theme-transitioning')
      transitioningRef.current = false
    }, TRANSITION_DURATION)
  }, [theme])

  return { theme, toggleTheme } as const
}
