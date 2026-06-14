# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server (port 5173)
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run preview    # Preview production build
npx tsc --noEmit   # Type-check only (no emit)
```

## Project Architecture

### Routes & Navigation

SPA with simple state-based routing (no react-router routes used despite importing BrowserRouter). `App.tsx` holds a `PetPageContext` discriminated union that drives page rendering:

```
state.page    → component
────────────────────────────────
dashboard     → inline dashboard (cards, tables, demo data)
pets          → PetListPage
pet-detail    → PetDetailPage(id)
pet-form      → PetFormPage(id?)
health        → HealthPage
activity      → ActivityPage
feeding       → FeedingPage
appointments  → AppointmentsPage
settings      → SettingsPage
```

Navigation happens via `App.tsx`'s `navigateTo()` which sets both `currentNav` (for sidebar highlight) and `page` (for rendering). The sidebar `<AppleSidebar>` and toolbar `<AppleToolbar>` receive these as props from `<RootLayout>`.

### Data Layer

**React Context** (`src/store/pet-context.tsx`): `PetProvider` wraps the entire app, provides `{ pets, loading, error, getPet, addPet, updatePet, deletePet }`. Currently uses in-memory mock data (`MOCK_PETS` array) — no backend API.

### Component Architecture

```
src/
├── components/
│   ├── ui/           # Atomic Apple HIG components
│   │   ├── AppleButton / AppleCard / AppleSwitch / AppleBadge
│   │   ├── AppleToolbar / AppleSidebar        # Navigation chrome
│   │   ├── AppleTable / AppleAvatar / AppleProgressRing
│   │   ├── AppleSegmentedControl / AppleBadge
│   │   ├── GlassPanel (frosted glass container)
│   │   └── DynamicType (semantic typography component)
│   ├── common/       # State components
│   │   ├── LoadingState / EmptyState / ErrorState
│   │   ├── Toast (notification)
│   │   └── ContextMenu (right-click menu)
│   └── pet/          # Domain components
│       └── PetSelector
├── features/         # Page modules (one per nav item)
│   ├── pets/         # PetListPage, PetDetailPage, PetFormPage
│   ├── health/       # Vaccination, visits, medication
│   ├── activity/     # Step/distance/time tracking
│   ├── feeding/      # Meal plans, food records
│   ├── appointments/ # Calendar view
│   └── settings/     # Theme, notifications, privacy
├── layouts/          # RootLayout (sidebar + toolbar + main)
├── store/            # React Context + mock data
├── design-tokens/    # Color/font/spacing/shadow/animation constants
├── types/            # Pet, Health, Reminder interfaces
└── utils/            # cn() (clsx + tailwind-merge), date formatters
```

### Design System Conventions

**Apple HIG — CSS variable driven**. `tailwind.config.ts` maps Apple semantic colors to `var(--apple-*)` CSS vars instead of static hex values. The `.dark` class on `<html>` switches all variables. Dark mode also sets `color-scheme: dark` for native controls.

**Typography**: Use `<DynamicType styleLevel="title3" weight={600}>` instead of raw `<h3>` tags. 11 font levels (largeTitle → caption2).

**Color usage**: Prefer semantic tokens (`text-apple-label`, `bg-apple-systemBackground`) over arbitrary colors. Fixed brand colors (`apple-red`, `apple-blue`) don't change between themes.

**8pt spacing**: 4/8pt rhythm through customized Tailwind spacing. Use `h-[36px]` for precise component heights (the customized `h-9` ≠ 36px due to spacing overrides).

**State coverage pattern**: Each data-type component renders one of: `LoadingState` / `EmptyState` / `ErrorState` / data view. See `components/common/` for the base state components.

### Key Patterns

- **`cn()` utility** (`src/utils/cn.ts`): wraps `clsx` + `tailwind-merge` for conflict-free conditional classes
- **`group-hover:text-apple-blue`**: Unified hover highlight used across all clickable rows/cards
- **Theme**: `useTheme()` hook reads localStorage → `prefers-color-scheme`, toggles `.dark` class, follows OS changes via matchMedia listener. Smooth transition via `.theme-transitioning` CSS class on `<html>`.
- **Immutable state updates**: All pet mutations create new arrays/objects (e.g., `prev.map(...)`, `prev.filter(...)`)
- **Mock data first**: All features start with inline mock data; backend integration is a future concern
