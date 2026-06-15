# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev       # Start Vite dev server (vite.config.ts: port 5173, strictPort: false → falls back to 5174/5175 if busy)
npm run build     # TypeScript check (`tsc -b`) + Vite production build
npm run preview   # Preview production build
npm run lint      # ESLint (no config file found — only default rules apply)
```

**Note**: No test framework (Vitest, Jest, etc.) is currently configured. README says port 5175 but config sets 5173 with `strictPort: false`.

## Docker

```bash
docker compose up -d   # Builds nginx image, serves dist/ on 127.0.0.1:8080
npm run build          # Must run first — Dockerfile copies dist/
```

- `docker/web/Dockerfile` — nginx:alpine serving prebuilt static files with gzip (css, js, svg)
- `docker/web/nginx.conf` — SPA fallback (`try_files $uri /index.html`)
- `docker/cloudflared/` — Cloudflare Tunnel for public exposure (see `docker/cloudflared/README.md`)
- Token stored in `docker/cloudflared/.env` (not committed)

## Docs

- `docs/frontend-experience.md` — Architectural decisions, component patterns, 8pt grid caveats, dark mode strategy
- `docs/ecc/pet-health-platform.plan.md` — Original implementation plan and milestones
- `docker/cloudflared/README.md` — Cloudflare Tunnel deployment guide

## Tech Stack

- **Framework**: React 19 + TypeScript (strict mode)
- **Build**: Vite 6 with `@vitejs/plugin-react`
- **Styling**: Tailwind CSS 3.4 with Apple HIG design tokens
- **Animation**: Framer Motion 11
- **Icons**: Lucide React
- **State**: React Context (no external state library)
- **Routing**: React Router DOM 7 (BrowserRouter)
- **Path alias**: `@/` → `./src/*` (configured in vite.config.ts and tsconfig)

## Project Architecture

### Design System (Apple HIG)

All Apple design tokens live in `tailwind.config.ts` under `theme.extend`:
- **Colors**: `apple-*` namespace — semantic colors (`apple-label`, `apple-systemBackground`) use CSS variables that auto-switch with `.dark` class; fixed colors (`apple-blue`, `apple-green`, etc.) are static hex values.
- **Typography**: 11-level SF font hierarchy (`apple-large-title` → `apple-caption-2`)
- **Spacing**: Overridden to 8pt grid (4px base, so `p-1` = 8px, `p-2` = 16px, etc.) — **caution**: this cascades to all Tailwind size utilities (e.g. `h-10` = 80px); use explicit pixel values like `h-[36px]` for element sizing.
- **Border radius**: `rounded-apple` (10px), `rounded-apple-xl` (16px), etc.
- **Shadows**: `shadow-apple-*` (light) / `shadow-dark-apple-*` (dark)
- **Glassmorphism**: CSS classes `glass`, `glass-light`, `glass-heavy` in `index.css`

### Architecture Lessons (from `docs/frontend-experience.md`)

- **8pt grid caveat**: Overriding Tailwind default spacing (`p-1` = 8px instead of 4px) cascades to ALL size utilities — `h-10` becomes 80px, not 40px. Use pixel values `h-[36px]` for element sizing, `p-*` only for layout spacing.
- **Dark mode approach**: CSS variables + `.dark` class is more reliable than Tailwind `dark:` prefix for semantic colors. The JIT compiler can't resolve dynamic var values, so a `.dark .text-apple-label` override layer in `index.css` is required.
- **Peer selector**: Tailwind `peer-checked` doesn't work with nested children; use React checked prop + conditional classes instead.
- **Border flash**: Avoid conditional rendering for dark-mode-sensitive elements — keep DOM nodes present and control visibility via CSS opacity/width.
- **Avatar perf**: Image `onError` fallback to initials/emoji avoids broken image UI.
- **Reduced motion**: `prefers-reduced-motion: reduce` disables all animations via CSS.
- **High contrast**: `prefers-contrast: more` applies stronger label/separator colors.

### Layer Structure

```
src/
├── design-tokens/       # JS constants for colors, typography, spacing, shadows, animations
│   ├── colors.ts        # appleColors, appleDarkColors, healthColors
│   ├── typography.ts    # appleTypography with 11 font levels
│   ├── spacing.ts       # 8pt grid spacing constants
│   ├── shadows.ts       # Apple shadow layer definitions
│   └── animations.ts    # Framer Motion spring presets, durations, stagger helpers
│
├── components/
│   ├── ui/              # Atomic Apple-styled components (14 files)
│   │   ├── AppleButton      — 3 variants (primary/secondary/plain), 3 sizes, loading spinner, active scale
│   │   ├── AppleCard        — 3 padding levels, hoverable (elevation + translate), polymorphic `as` prop
│   │   ├── AppleSwitch      — iOS-style toggle, sm/md sizes, spring animation
│   │   ├── AppleAvatar      — 4 sizes, image with initials emoji fallback on error
│   │   ├── AppleBadge       — Count badge or dot variant
│   │   ├── AppleSidebar     — 7 nav items, active highlight with blue background
│   │   ├── AppleToolbar     — Title + search overlay (fullscreen with quick links) + theme toggle + notifications
│   │   ├── AppleTable       — Generic typed table with column render functions
│   │   ├── AppleSegmentedControl — iOS-style segmented tabs
│   │   ├── AppleProgressRing — Circular progress SVG, customizable size/stroke/color
│   │   ├── GlassPanel        — Frosted glass container (light/medium/heavy blur)
│   │   └── DynamicType       — Typography component mapping 11 SF font levels to semantic tags
│   │   └── Patterns: `cn()` for class merge, `group-hover:text-apple-blue` for hover states, no color prop — default `text-apple-label` adapts to dark/light automatically
│   ├── common/           # Cross-cutting state components
│   │   ├── LoadingState     — Skeleton card or animated dots with message
│   │   ├── EmptyState       — Icon + title + description + optional action button
│   │   ├── ErrorState       — Warning icon + message + retry button
│   │   ├── Toast            — Fixed container, auto-dismiss, 4 variants (success/error/info/warning), slide-in animation
│   │   └── ContextMenu      — Right-click trigger, outside-click-close, danger/disabled item support
│   └── pet/              # Domain-specific components
│       └── PetSelector      — Custom dropdown with outside-click + Escape close, emoji per species
│
├── features/             # Page-level modules, one file per page, one folder per domain
│   ├── pets/             # PetListPage (search + species filter + grid cards), PetDetailPage (health overview table), PetFormPage (validation + FormSelect component)
│   ├── health/           # HealthPage with per-pet vaccinations/vet visits/medications (3 tabs), local mock data in `perPet*` records
│   ├── activity/         # ActivityPage with today stats (4 metric cards + progress ring), history list with mini-bar
│   ├── feeding/          # FeedingPage with daily timeline schedule (connected dots), log/repeat buttons
│   ├── appointments/     # AppointmentsPage with monthly calendar grid (day dots) + upcoming card list
│   └── settings/         # SettingsPage (appearance/notifications/privacy sections), inline SettingRow component
│
├── layouts/              # RootLayout (sidebar + toolbar + main content)
├── store/                # React Context providers (pet-context.tsx with mock data)
├── hooks/                # useTheme (dark mode toggle, localStorage, OS preference detection)
├── types/                # TypeScript interfaces (pet, health, reminder)
├── utils/                # cn (clsx + twMerge), date (format, age calc, relative time), format (weight, health score, currency)
├── App.tsx               # Root component with page routing via state machine (no <Routes>)
├── main.tsx              # Entry point: StrictMode + BrowserRouter + PetProvider
└── index.css             # CSS variables, dark mode, glass effects, theme transitions
```

### State Management

- **React Context** (`PetProvider` in `src/store/pet-context.tsx`): pets array with CRUD operations
- **`usePets()` hook**: typed context consumer — throws if used outside provider
- **Mock data**: Pre-populated pet records; feature pages have their own local mock data
- **Page routing**: App.tsx uses a `PetPageContext` state machine (not React Router `<Routes>`) — sidebar navigation dispatches page state changes

### Dark Mode

- CSS variable-driven: `--apple-*` defined in `:root` and `.dark`
- `useTheme` hook toggles `.dark` class on `<html>`, persists to localStorage
- Respects OS `prefers-color-scheme: dark` unless user has explicitly toggled
- Smooth theme transitions via `.theme-transitioning` class (400ms)

### Coding Patterns

- **Component state coverage**: Every data component handles 4 states — loading / empty / error / data
- **Utility classes**: `cn()` from `src/utils/cn.ts` (clsx + tailwind-merge) for conditional class merging
- **Hover pattern**: `group-hover:text-apple-blue` on all interactive list rows across all feature pages
- **Typography**: Use `<DynamicType styleLevel="..." />` over raw `<span className="text-apple-*">` for consistent SF font sizing
- **Icons**: All from `lucide-react`, imported individually for tree-shaking; no icon library bundles
- **Immutability**: State updates use immutable patterns (`map`, `filter`, spread) — no direct mutation or immer
- **No backend**: All data is local mock objects; no API calls, no async data fetching, no Supabase or server
- **Dropdown pattern**: Custom select/dropdown popups (PetSelector, FormSelect, HealthPage tab selector) all share the same pattern: `useState(open)` + `useRef(div)` + `mousedown` outside-click + `Escape` key listener, cleaned up in `useEffect` return

### CSS Architecture

- **Global styles** in `src/index.css`: CSS custom properties, dark mode overrides, glass effects, skeleton shimmer, scrollbar styling, reduced motion, high contrast
- **Custom utility classes** in `@layer components`: `.glass`, `.glass-light`, `.glass-heavy`, `.apple-card`, `.apple-inset-group`, `.skeleton`
- **Animation utilities**: `.transition-apple` (ease-out cubic), `.transition-spring` (spring cubic)
- **Hidden scrollbar utility**: `.scrollbar-none` class retains scroll functionality without visible scrollbars

### Docker

- `docker-compose.yml` runs the built app via `docker/web/Dockerfile` behind nginx (port 8080)
- `cloudflared` tunnel service for public exposure
