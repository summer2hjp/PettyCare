# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm install            # Install dependencies
npm run dev            # Start dev server (port 5173)
npm run build          # tsc -b && vite build
npm run lint           # ESLint
npm run preview        # Preview production build
npx tsc --noEmit       # Type-check only (no emit)

# Tests (Puppeteer visual tests — dev server must be running on :5173)
npx tsx tests/chrome-visual.spec.ts       # Sidebar + toolbar chrome
npx tsx tests/dashboard-visual.spec.ts    # Dashboard module
npx tsx tests/pets-visual.spec.ts         # Pets CRUD module
npx tsx tests/health-visual.spec.ts       # Health module
npx tsx tests/activity-visual.spec.ts     # Activity module
npx tsx tests/feeding-visual.spec.ts      # Feeding module
npx tsx tests/appointments-visual.spec.ts # Appointments module
npx tsx tests/settings-visual.spec.ts     # Settings module

# Run all tests sequentially
for f in tests/*.spec.ts; do echo "=== $f ==="; npx tsx "$f" | tail -5; done

# Supabase local
npx supabase start       # Start local Supabase
npx supabase stop        # Stop local Supabase
npx supabase db reset    # Reset local database (applies all migrations + seed)
```

**IMPORTANT**: `@/` path alias maps to `src/` (configured in `vite.config.ts`). Use `@/lib/supabase`, `@/store/pet-context`, etc.

## Project Architecture

### Routes & Navigation

SPA with state-based routing (no react-router used for page switching despite importing BrowserRouter from react-router-dom). `App.tsx` holds a `PetPageContext` discriminated union:

```
state.page    → component
────────────────────────────────
dashboard     → DashboardPage
pets          → PetListPage
pet-detail    → PetDetailPage(id)
pet-form      → PetFormPage(id?)
health        → HealthPage
activity      → ActivityPage
feeding       → FeedingPage
appointments  → AppointmentsPage
settings      → SettingsPage
```

Navigation via `App.tsx`'s `navigateTo()` sets both `currentNav` (sidebar highlight) and `page` (rendering). `<AppleSidebar>` and `<AppleToolbar>` receive these as props from `<RootLayout>`.

### Data Layer — Supabase + React Context

**Authentication** (`src/store/auth-context.tsx`): `AuthProvider` wraps the entire app. Provides `{ user, loading, signIn, signUp, signOut }` via Supabase Auth. `AuthGuard` checks auth state and shows `AuthPage` (login/register) when unauthenticated.

**Pets CRUD** (`src/store/pet-context.tsx`): `PetProvider` fetches from Supabase (`pets` table), provides `{ pets, loading, error, getPet, addPet, updatePet, deletePet }`. All mutations go through Supabase REST API first, then optimistic local update.

**Env vars required**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — loaded at startup; missing either throws.

### Component Architecture

```
src/
├── components/
│   ├── ui/           # Atomic Apple HIG components
│   │   ├── AppleButton / AppleCard / AppleSwitch / AppleBadge / AppleAvatar
│   │   ├── AppleToolbar / AppleSidebar        # Navigation chrome
│   │   ├── AppleTable / AppleProgressRing / AppleSegmentedControl
│   │   ├── GlassPanel (frosted glass container)
│   │   └── DynamicType (semantic typography component)
│   ├── common/       # Cross-cutting state components
│   │   ├── LoadingState / EmptyState / ErrorState / Toast / ContextMenu
│   └── pet/          # Domain components
│       └── PetSelector
├── features/         # Page modules (one per nav item)
│   ├── pets/         # PetListPage, PetDetailPage, PetFormPage
│   ├── auth/         # AuthPage (login/register split-screen), AuthGuard
│   ├── health/       # Vaccination/visits/medication tabs
│   ├── activity/     # Step/distance/time tracking + progress rings
│   ├── feeding/      # Meal plans, food records
│   ├── appointments/ # Monthly calendar view
│   ├── dashboard/    # 7-section aggregated overview
│   └── settings/     # Theme/notifications/privacy
├── layouts/          # RootLayout (sidebar + toolbar + main)
├── store/            # React Context providers (pet-context, auth-context)
├── design-tokens/    # Apple HIG token definitions (color, font, spacing, shadow, animation)
├── types/            # Pet, Health, Reminder TypeScript interfaces
├── hooks/            # useTheme (dark/light mode, localStorage + matchMedia)
├── lib/              # Supabase client singleton
└── utils/            # cn() (clsx + tailwind-merge), date formatters
```

### Design System Conventions

**Apple HIG — CSS variable driven**. `tailwind.config.ts` maps Apple semantic colors to `var(--apple-*)` CSS vars. The `.dark` class on `<html>` switches all variables. Dark mode also sets `color-scheme: dark`.

**Typography**: Use `<DynamicType styleLevel="title3" weight={600}>` over raw `<h3>` tags. 11 font levels (`largeTitle` → `caption2`).

**Color usage**: Prefer semantic tokens (`text-apple-label`, `bg-apple-systemBackground`) over arbitrary colors. Fixed brand colors (`apple-red`, `apple-blue`) don't change between themes.

**8pt spacing**: 4/8pt rhythm through customized Tailwind spacing. Use `h-[36px]` for precise component heights (the customized `h-9` ≠ 36px due to spacing overrides).

**Frosted glass**: `GlassPanel` component with 3 blur levels (light/medium/heavy). Uses `backdrop-filter: blur(...)` with rgba backgrounds.

**State coverage pattern**: Each data-type component renders one of: `LoadingState` / `EmptyState` / `ErrorState` / data view. See `components/common/`.

### Key Patterns

- **`cn()` utility** (`src/utils/cn.ts`): wraps `clsx` + `tailwind-merge` for conflict-free conditional classes
- **`group-hover:text-apple-blue`**: Unified hover highlight across all clickable rows/cards
- **Theme**: `useTheme()` hook reads localStorage → `prefers-color-scheme`, toggles `.dark` class, follows OS changes via matchMedia listener. Smooth transition via `.theme-transitioning` CSS class.
- **Immutable state updates**: All pet mutations create new arrays/objects (`prev.map(...)`, `prev.filter(...)`), never mutate in-place
- **Supabase-first with optimistic UI**: Mutations call Supabase API then update local state; errors bubble via thrown exceptions
- **Puppeteer visual tests** in `tests/` follow TL1-TL4 test levels defined in the `summer-frontend-test` skill

### Supabase Database

- Local Supabase config in `supabase/config.toml` (port 54321)
- Migrations in `supabase/migrations/`: `001_schema.sql` (tables), `002_rls.sql` (Row Level Security), `003_storage.sql` (file storage buckets)
- Edge functions in `supabase/functions/daily-reminders/`
- Seed data in `supabase/seed.sql`
- See also `supabase/` directory for all database-related code

### Docker Deployment

`docker-compose.yml` provides:
- **`web`** service: serves the production build via Nginx on port 8080
- **`tunnel`** service: Cloudflare Tunnel for public access
