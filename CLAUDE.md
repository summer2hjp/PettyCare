# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm install            # Install dependencies
npm run dev            # Start dev server (port 5173)
npm run build          # tsc -b && vite build
npm run lint           # ESLint
npm run preview        # Preview production build
npx tsc -b              # Type-check all project references (root tsconfig.json uses
                        #   project references; each sub-config has "noEmit": true)

# Tests (Puppeteer visual tests — dev server must be running on :5173)
npx tsx tests/chrome-visual.spec.ts       # Sidebar + toolbar chrome
npx tsx tests/auth-visual.spec.ts         # Auth (login/register) module
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
npx supabase start       # Start local Supabase (port 54321)
npx supabase stop        # Stop local Supabase
npx supabase status      # Check local Supabase status
npx supabase db reset    # Reset local database (applies all migrations + seed)
npx supabase db diff     # Generate a new migration from schema changes
npx supabase functions serve daily-reminders  # Serve edge function locally
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

**Pets CRUD** (`src/store/pet-context.tsx`): `PetProvider` fetches from Supabase (`pets` table), provides `{ pets, loading, error, getPet, addPet, updatePet, deletePet }`. All mutations call Supabase REST API then update local state optimistically; errors bubble via thrown exceptions.

**Env vars required**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — define in `.env` at project root. Loaded at startup; missing either throws.

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
├── types/            # TypeScript interfaces: pet.ts, health.ts, reminder.ts, moments.ts
├── hooks/            # useTheme (dark/light mode, localStorage + matchMedia)
├── lib/              # Supabase client singleton
└── utils/            # cn, toSnakeCase/toCamelCase, date formatters, format helpers
```

### TypeScript Types (`src/types/`)

- **pet.ts** — `Pet`, `PetFormData`, `PetSpecies`, `PetGender`, `PetListState` (union: 'loading' | 'empty' | 'data' | 'error')
- **health.ts** — `Vaccination`, `VetVisit`, `Medication`, `WeightRecord`, `HealthOverview`
- **reminder.ts** — `Reminder`, `ReminderGroup`, `ReminderType`, `ReminderPriority`
- **moments.ts** — `PetMoment`, `MomentType` (daily/interaction/growth)

### Utilities (`src/utils/`)

- **cn.ts** — `clsx` + `tailwind-merge` for conflict-free conditional class merging
- **case.ts** — `toSnakeCase()` / `toCamelCase()` for Supabase key conversion (camelCase ↔ snake_case)
- **date.ts** — `formatDate()`, `calculateAge()`, `relativeTime()`, `isToday()`, `isOverdue()`
- **format.ts** — `formatWeight()`, `formatHealthScore()`, `formatCurrency()`, `truncate()`

### Design System — MiniMax

The entire light mode has been refactored from Apple HIG to MiniMax design language (per `DESIGN.md`).

**CSS variable driven**: `tailwind.config.ts` maps MiniMax semantic colors to `var(--mm-*)` CSS vars. The `.dark` class on `<html>` switches variables for dark mode. See `src/index.css` for the full variable definitions.

**Typography**: Multi-font system — DM Sans (UI, 70% of text), Outfit (display headings), Poppins (mid-tier), Roboto (data). Use `<DynamicType>` with MiniMax style levels: `hero`, `section`, `cardTitle`, `subheading`, `body`, `caption`, `small`, `button`, `feature`, etc. Defined in `tailwind.config.ts` as `text-mm-*` utilities.

**Color palette**: Pure white (`#ffffff`) backgrounds, near-black text (`#222222`, `#18181b`), brand blue (`#1456f0` / `#3b82f6`), secondary text (`#45515e`), muted (`#8e8e93`). Semantic tokens via `text-[var(--mm-label)]`, `bg-[var(--mm-background)]`.

**Buttons**: `AppleButton` supports variants: `primary` (blue fill), `secondary` (light fill), `pill` (full pill radius, `#181e25` dark), `plain` (link-like), `dark` (`#181e25` background). Default radius is 8px (`rounded-mm-sm`), pill variant uses `rounded-mm-pill` (9999px).

**Cards**: White background (`var(--mm-card)`), subtle shadow (`mm-subtle`), `rounded-mm-xl` (20px) default radius. Hover elevates with `mm-card` shadow. The `.mm-card` CSS class in `index.css` provides base card styling.

**Spacing**: 8px base grid. Be aware the customized Tailwind spacing means `h-9` ≠ 36px — use `h-[36px]` for precise heights.

**Glass/panels**: `.glass`/`.glass-light`/`.glass-heavy` classes repurposed as light background panels with borders and subtle fills (no backdrop-filter). `GlassPanel` component works with these.

**Theme transition**: `.theme-transitioning` CSS class on `<html>` applied by `useTheme()` during dark/light toggles. Smoothly interpolates colors over 350ms. Debounced.

**State coverage pattern**: Each data-type component renders one of: `LoadingState` / `EmptyState` / `ErrorState` / data view. See `components/common/`.

### Key Patterns

- **`cn()` utility** (`src/utils/cn.ts`): wraps `clsx` + `tailwind-merge` for conflict-free conditional classes
- **`group-hover:text-[var(--mm-link)]`**: Unified hover highlight across all clickable rows/cards (brand blue)
- **Theme**: `useTheme()` hook reads localStorage → `prefers-color-scheme`, toggles `.dark` class, follows OS changes via matchMedia listener. Smooth transition via `.theme-transitioning` CSS class.
- **Immutable state updates**: All pet mutations create new arrays/objects (`prev.map(...)`, `prev.filter(...)`), never mutate in-place
- **Supabase key conversion**: Use `toSnakeCase()` from `src/utils/case.ts` when sending data to Supabase (JS camelCase → DB snake_case). The Supabase client returns snake_case which must be manually mapped — no automatic casing transform.
- **Puppeteer visual tests**: in `tests/` follow TL1-TL4 test levels defined in the `summer-frontend-test` skill. Dev server must be running before executing tests.
- **Framer Motion**: Used for animations on cards, modals, and transitions. Spring animations via `transition={{ type: 'spring', stiffness: ..., damping: ... }}`.

### Supabase Database

- Local Supabase config in `supabase/config.toml` (port 54321)
- Migrations in `supabase/migrations/`:
  - `001_schema.sql` — 11 tables (profiles, households, household_members, pets, vaccinations, vet_visits, medications, activity_records, feeding_records, appointments, reminders) + indexes
  - `002_rls.sql` — Row Level Security policies + auto-create profile/household on signup trigger
  - `003_storage.sql` — Storage bucket for pet avatars
  - `004_fix_rls_recursion.sql` — Fix for recursive RLS policy
  - `005_pet_moments.sql` — Pet moments table
- Edge function: `supabase/functions/daily-reminders/` — scheduled reminder delivery
- Seed data: `supabase/seed.sql`
- Auth trigger: auto-creates profile, household, and household_membership on signup (`handle_new_user()` function)

### TypeScript Configuration

Root `tsconfig.json` uses **project references** pointing to `tsconfig.app.json` (app code) and `tsconfig.node.json` (Vite config). Both have `"noEmit": true`. Always use `tsc -b` (build mode) to type-check all references — plain `tsc` on the root config checks nothing because `"files": []`.

### Docker Deployment

`docker-compose.yml` provides:
- **`web`** service: serves the production build via Nginx on port 8080 (Dockerfile at `docker/web/Dockerfile`)
- **`tunnel`** service: Cloudflare Tunnel for public access (env file at `docker/cloudflared/.env`)

### Additional Documentation

- `docs/frontend-experience.md` — architecture decisions, design system rationale, common pitfalls (custom spacing cascade, dark mode border flicker, `peer-checked` limitations), and performance patterns
- `README.md` — feature overview, tech stack, quick start
