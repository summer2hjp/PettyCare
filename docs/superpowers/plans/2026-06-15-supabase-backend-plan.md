# Supabase Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all in-memory mock data with Supabase PostgreSQL backend, add multi-user auth with household-based pet sharing.

**Architecture:** React frontend communicates directly with Supabase via `@supabase/supabase-js`. 11 database tables with Row Level Security enforce household-based data isolation. Email+password auth with automatic profile+household creation on signup. Edge Function for daily reminder notifications.

**Tech Stack:** Supabase (PostgreSQL + Auth + Storage + Edge Functions), `@supabase/supabase-js`, React 19, TypeScript

---

## File Structure (New/Modified Files)

```
supabase/
├── migrations/
│   ├── 001_schema.sql           # Core tables + indexes
│   └── 002_rls.sql              # RLS policies + auth trigger
├── seed.sql                     # Demo data
├── functions/
│   └── daily-reminders/
│       └── index.ts             # Edge Function
└── config.toml                  # Supabase project config

src/
├── lib/
│   └── supabase.ts              # Supabase client singleton
├── store/
│   ├── pet-context.tsx          # REFACTOR: mock → supabase
│   └── auth-context.tsx         # NEW: auth state provider
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx        # NEW
│   │   ├── RegisterPage.tsx     # NEW
│   │   └── AuthGuard.tsx        # NEW
│   ├── health/HealthPage.tsx    # REFACTOR: mock → supabase
│   ├── activity/ActivityPage.tsx# REFACTOR: mock → supabase
│   ├── feeding/FeedingPage.tsx  # REFACTOR: mock → supabase
│   └── appointments/AppointmentsPage.tsx # REFACTOR
└── App.tsx                      # MODIFY: add auth routes
```

---

### Task 1: Install dependencies and init Supabase

**Files:**
- Create: `supabase/config.toml`
- Modify: `package.json`

- [ ] **Install dependencies**

```bash
cd /home/summer520/repo/PettyCare
npm install @supabase/supabase-js
npm install --save-dev supabase
```

- [ ] **Initialize Supabase project**

```bash
npx supabase init
```

- [ ] **Create `supabase/config.toml`**

```toml
[project]
name = "pettycare"

[auth]
enabled = true
site_url = "http://localhost:5173"
additional_redirect_urls = []

[auth.email]
enable_confirmations = false  # Dev only — skip email confirmation
enable_autoconfirm = true
```

- [ ] **Commit**

```bash
git add package.json supabase/
git commit -m "feat: init Supabase project and install dependencies"
```

---

### Task 2: Migration 001 — Core schema (11 tables + indexes)

**Files:**
- Create: `supabase/migrations/001_schema.sql`

- [ ] **Create migration file**

```sql
-- supabase/migrations/001_schema.sql
-- PettyCare Core Schema — 11 tables + indexes

-- 0. Users & Households
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(household_id, user_id)
);

-- 1. Pets
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog','cat','bird','fish','rabbit','hamster','other')),
  breed TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  birth_date DATE,
  weight DECIMAL(5,2),
  weight_unit TEXT NOT NULL DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lb')),
  color TEXT,
  microchip_id TEXT,
  notes TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Health
CREATE TABLE vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  administered_date DATE,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'overdue', 'completed')),
  vet_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vet_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT NOT NULL,
  diagnosis TEXT,
  prescription TEXT,
  vet_name TEXT NOT NULL,
  cost DECIMAL(10,2),
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Activity & Feeding
CREATE TABLE activity_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  steps INTEGER NOT NULL DEFAULT 0,
  distance DECIMAL(6,2) NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0,
  calories INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE feeding_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  meal_time TIMESTAMPTZ NOT NULL,
  food TEXT NOT NULL,
  portion TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Appointments & Reminders
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME,
  type TEXT NOT NULL,
  vet_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('medication','vaccination','checkup','feeding','grooming','custom')),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Indexes
CREATE INDEX idx_pets_household ON pets(household_id);
CREATE INDEX idx_vaccinations_pet ON vaccinations(pet_id);
CREATE INDEX idx_vet_visits_pet ON vet_visits(pet_id);
CREATE INDEX idx_medications_pet ON medications(pet_id);
CREATE INDEX idx_activity_records_pet ON activity_records(pet_id, date);
CREATE INDEX idx_feeding_records_pet ON feeding_records(pet_id, meal_time);
CREATE INDEX idx_appointments_pet ON appointments(pet_id, date);
CREATE INDEX idx_reminders_pet ON reminders(pet_id, due_date);
CREATE INDEX idx_household_members_user ON household_members(user_id);
CREATE INDEX idx_household_members_household ON household_members(household_id);
```

- [ ] **Apply migration**

```bash
npx supabase migration up
```

- [ ] **Commit**

```bash
git add supabase/migrations/001_schema.sql
git commit -m "feat: add core database schema with 11 tables"
```

---

### Task 3: Migration 002 — RLS policies + auth trigger

**Files:**
- Create: `supabase/migrations/002_rls.sql`

- [ ] **Create migration file**

```sql
-- supabase/migrations/002_rls.sql
-- Row Level Security policies + auto-create on signup

-- 0. Helper functions
CREATE OR REPLACE FUNCTION auth.user_households()
RETURNS SETOF UUID
LANGUAGE sql STABLE
AS $$
  SELECT household_id FROM public.household_members WHERE user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION auth.can_access_pet(check_pet_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pets p
    WHERE p.id = check_pet_id
    AND p.household_id IN (SELECT auth.user_households())
  )
$$;

-- 1. Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can view own profile"
  ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "users can update own profile"
  ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- 2. Households
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can view their households"
  ON households FOR SELECT
  USING (id IN (SELECT auth.user_households()));
CREATE POLICY "members can create households"
  ON households FOR INSERT
  WITH CHECK (true);  -- Any authenticated user can create a household

-- 3. Household members
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can view household members"
  ON household_members FOR SELECT
  USING (household_id IN (SELECT auth.user_households()));
CREATE POLICY "admins can insert members"
  ON household_members FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "admins can update members"
  ON household_members FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "admins can delete members"
  ON household_members FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Pets
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can manage household pets"
  ON pets FOR ALL
  USING (household_id IN (SELECT auth.user_households()))
  WITH CHECK (household_id IN (SELECT auth.user_households()));

-- 5-11. Health records, activity, feeding, appointments, reminders
-- All use the same pattern: check pet access via auth.can_access_pet()

ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can manage vaccinations"
  ON vaccinations FOR ALL
  USING (auth.can_access_pet(pet_id))
  WITH CHECK (auth.can_access_pet(pet_id));

ALTER TABLE vet_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can manage vet_visits"
  ON vet_visits FOR ALL
  USING (auth.can_access_pet(pet_id))
  WITH CHECK (auth.can_access_pet(pet_id));

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can manage medications"
  ON medications FOR ALL
  USING (auth.can_access_pet(pet_id))
  WITH CHECK (auth.can_access_pet(pet_id));

ALTER TABLE activity_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can manage activity_records"
  ON activity_records FOR ALL
  USING (auth.can_access_pet(pet_id))
  WITH CHECK (auth.can_access_pet(pet_id));

ALTER TABLE feeding_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can manage feeding_records"
  ON feeding_records FOR ALL
  USING (auth.can_access_pet(pet_id))
  WITH CHECK (auth.can_access_pet(pet_id));

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can manage appointments"
  ON appointments FOR ALL
  USING (auth.can_access_pet(pet_id))
  WITH CHECK (auth.can_access_pet(pet_id));

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can manage reminders"
  ON reminders FOR ALL
  USING (auth.can_access_pet(pet_id))
  WITH CHECK (auth.can_access_pet(pet_id));

-- 12. Auth trigger: auto-create profile + default household on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  default_household_id UUID;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));

  -- Create default household
  INSERT INTO public.households (name)
  VALUES (COALESCE(NEW.email, 'User') || '''s Household')
  RETURNING id INTO default_household_id;

  -- Add user as admin of their household
  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (default_household_id, NEW.id, 'admin');

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

- [ ] **Apply migration**

```bash
npx supabase migration up
```

- [ ] **Commit**

```bash
git add supabase/migrations/002_rls.sql
git commit -m "feat: add RLS policies and auth trigger"
```

---

### Task 4: Seed demo data

**Files:**
- Create: `supabase/seed.sql`

- [ ] **Create seed file**

This migrates the existing MOCK_PETS + perFeature mock data into the database.

```sql
-- supabase/seed.sql
-- Demo household + 5 pets with health/activity/feeding/appointment data

-- Fixed UUIDs for demo data
INSERT INTO households (id, name) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Demo Family');

INSERT INTO pets (id, household_id, name, species, breed, gender, birth_date, weight, weight_unit, color, notes)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Luna', 'cat', 'Persian', 'female', '2021-03-15', 4.2, 'kg', '#F5F0EB', 'Loves catnip'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Max', 'dog', 'Golden Retriever', 'male', '2019-07-20', 32.5, 'kg', '#D4A574', NULL),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Coco', 'dog', 'Poodle', 'female', '2022-11-05', 6.8, 'kg', '#FFFFFF', NULL),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Bella', 'cat', 'Siamese', 'female', '2020-09-12', 3.8, 'kg', '#F5F0EB', 'Indoor only'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Charlie', 'hamster', 'Syrian', 'male', '2024-06-01', 0.15, 'kg', NULL, NULL);

-- Vaccinations (Luna)
INSERT INTO vaccinations (pet_id, name, scheduled_date, administered_date, status, vet_name)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'FVRCP', '2025-04-10', '2024-04-10', 'completed', 'Dr. Smith'),
  ('b0000000-0000-0000-0000-000000000001', 'Rabies', '2025-08-15', NULL, 'upcoming', NULL),
  ('b0000000-0000-0000-0000-000000000001', 'Feline Leukemia', '2025-11-01', NULL, 'upcoming', NULL);

-- Vaccinations (Max)
INSERT INTO vaccinations (pet_id, name, scheduled_date, administered_date, status, vet_name)
VALUES
  ('b0000000-0000-0000-0000-000000000002', 'Rabies', '2025-03-10', '2024-03-10', 'completed', 'Dr. Smith'),
  ('b0000000-0000-0000-0000-000000000002', 'DHPP', '2025-06-15', NULL, 'overdue', NULL),
  ('b0000000-0000-0000-0000-000000000002', 'Bordetella', '2025-09-01', NULL, 'upcoming', NULL),
  ('b0000000-0000-0000-0000-000000000002', 'Leptospirosis', '2025-12-01', NULL, 'upcoming', NULL);

-- ... continue with remaining pets' vaccinations, vet_visits, medications,
--     activity_records, feeding_records, appointments
```

- [ ] **Apply seed**

```bash
npx supabase db reset  # Also applies migrations + seed
```

- [ ] **Commit**

```bash
git add supabase/seed.sql
git commit -m "feat: add demo seed data"
```

---

### Task 5: Create Supabase client + auth context

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/store/auth-context.tsx`

- [ ] **Create Supabase client**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Create `.env.local`**

```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<your-local-anon-key>
```

- [ ] **Create auth context**

```typescript
// src/store/auth-context.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }

  const signUp = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({ email, password })
    return error?.message ?? null
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

- [ ] **Commit**

```bash
git add src/lib/supabase.ts src/store/auth-context.tsx
git commit -m "feat: add Supabase client and auth context"
```

---

### Task 6: Login/Register pages + AuthGuard

**Files:**
- Create: `src/features/auth/LoginPage.tsx`
- Create: `src/features/auth/RegisterPage.tsx`
- Create: `src/features/auth/AuthGuard.tsx`

- [ ] **Create LoginPage**

```tsx
// src/features/auth/LoginPage.tsx
import { useState } from 'react'
import { useAuth } from '@/store/auth-context'
import { AppleCard } from '@/components/ui/AppleCard'
import { AppleButton } from '@/components/ui/AppleButton'
import { DynamicType } from '@/components/ui/DynamicType'

interface LoginPageProps {
  onRegister: () => void
}

export function LoginPage({ onRegister }: LoginPageProps) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const err = await signIn(email, password)
    if (err) setError(err)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--apple-secondarySystemBackground)]">
      <AppleCard padding="lg" className="w-full max-w-sm">
        <DynamicType styleLevel="title2" weight={700} className="mb-6 text-center">
          Sign in to PettyCare
        </DynamicType>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <DynamicType styleLevel="footnote" weight={600} className="mb-1">Email</DynamicType>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full h-9 px-3 rounded-apple bg-apple-systemBackground text-apple-label border border-apple-separator"
              placeholder="your@email.com" required />
          </div>
          <div>
            <DynamicType styleLevel="footnote" weight={600} className="mb-1">Password</DynamicType>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full h-9 px-3 rounded-apple bg-apple-systemBackground text-apple-label border border-apple-separator"
              placeholder="••••••••" required />
          </div>
          {error && <DynamicType styleLevel="caption1" className="text-apple-red">{error}</DynamicType>}
          <AppleButton type="submit" disabled={loading} className="w-full justify-center">
            {loading ? 'Signing in...' : 'Sign In'}
          </AppleButton>
        </form>
        <button onClick={onRegister} className="w-full text-center mt-4 text-apple-blue text-apple-footnote">
          Don't have an account? Register
        </button>
      </AppleCard>
    </div>
  )
}
```

- [ ] **Create RegisterPage**

```tsx
// src/features/auth/RegisterPage.tsx
import { useState } from 'react'
import { useAuth } from '@/store/auth-context'
import { AppleCard } from '@/components/ui/AppleCard'
import { AppleButton } from '@/components/ui/AppleButton'
import { DynamicType } from '@/components/ui/DynamicType'

interface RegisterPageProps {
  onLogin: () => void
}

export function RegisterPage({ onLogin }: RegisterPageProps) {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const err = await signUp(email, password)
    if (err) { setError(err) } else { setSuccess(true) }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--apple-secondarySystemBackground)]">
        <AppleCard padding="lg" className="w-full max-w-sm text-center">
          <DynamicType styleLevel="title2" weight={700} className="mb-3">Registration successful!</DynamicType>
          <DynamicType styleLevel="body" className="mb-4">You can now sign in with your email and password.</DynamicType>
          <AppleButton onClick={onLogin}>Go to Sign In</AppleButton>
        </AppleCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--apple-secondarySystemBackground)]">
      <AppleCard padding="lg" className="w-full max-w-sm">
        <DynamicType styleLevel="title2" weight={700} className="mb-6 text-center">
          Create Account
        </DynamicType>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <DynamicType styleLevel="footnote" weight={600} className="mb-1">Email</DynamicType>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full h-9 px-3 rounded-apple bg-apple-systemBackground text-apple-label border border-apple-separator" required />
          </div>
          <div>
            <DynamicType styleLevel="footnote" weight={600} className="mb-1">Password</DynamicType>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full h-9 px-3 rounded-apple bg-apple-systemBackground text-apple-label border border-apple-separator"
              minLength={6} required />
          </div>
          {error && <DynamicType styleLevel="caption1" className="text-apple-red">{error}</DynamicType>}
          <AppleButton type="submit" disabled={loading} className="w-full justify-center">
            {loading ? 'Creating account...' : 'Register'}
          </AppleButton>
        </form>
        <button onClick={onLogin} className="w-full text-center mt-4 text-apple-blue text-apple-footnote">
          Already have an account? Sign In
        </button>
      </AppleCard>
    </div>
  )
}
```

- [ ] **Create AuthGuard**

```tsx
// src/features/auth/AuthGuard.tsx
import { type ReactNode } from 'react'
import { useAuth } from '@/store/auth-context'
import { LoginPage } from './LoginPage'
import { RegisterPage } from './RegisterPage'
import { LoadingState } from '@/components/common/LoadingState'
import { useState } from 'react'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  if (loading) return <LoadingState message="Loading..." />
  if (!user) {
    return showRegister
      ? <RegisterPage onLogin={() => setShowRegister(false)} />
      : <LoginPage onRegister={() => setShowRegister(true)} />
  }
  return <>{children}</>
}
```

- [ ] **Commit**

```bash
git add src/features/auth/
git commit -m "feat: add login/register pages and auth guard"
```

---

### Task 7: Refactor pet-context to use Supabase

**Files:**
- Modify: `src/store/pet-context.tsx`

- [ ] **Rewrite pet-context.tsx**

Replace the in-memory `MOCK_PETS` with Supabase queries.

```typescript
// src/store/pet-context.tsx (refactored)
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Pet, PetFormData } from '@/types/pet'

interface PetContextType {
  pets: Pet[]
  loading: boolean
  error: string | null
  getPet: (id: string) => Pet | undefined
  addPet: (data: PetFormData) => Promise<void>
  updatePet: (id: string, data: Partial<PetFormData>) => Promise<void>
  deletePet: (id: string) => Promise<void>
}

const PetContext = createContext<PetContextType | null>(null)

export function PetProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load pets on mount
  useEffect(() => {
    let cancelled = false
    supabase.from('pets').select('*').then(({ data, error: err }) => {
      if (cancelled) return
      if (err) { setError(err.message) }
      else { setPets(data as Pet[]) }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const getPet = useCallback((id: string) => pets.find(p => p.id === id), [pets])

  const addPet = useCallback(async (data: PetFormData) => {
    // Get user's first household
    const { data: members } = await supabase
      .from('household_members')
      .select('household_id')
      .limit(1)
      .single()
    if (!members) throw new Error('No household found')

    const { data: newPet, error: err } = await supabase
      .from('pets')
      .insert({ ...data, household_id: members.household_id })
      .select()
      .single()
    if (err) throw err
    setPets(prev => [newPet as Pet, ...prev])
  }, [])

  const updatePet = useCallback(async (id: string, data: Partial<PetFormData>) => {
    const { error: err } = await supabase
      .from('pets')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (err) throw err
    setPets(prev => prev.map(p => p.id === id ? { ...p, ...data } as Pet : p))
  }, [])

  const deletePet = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('pets').delete().eq('id', id)
    if (err) throw err
    setPets(prev => prev.filter(p => p.id !== id))
  }, [])

  return (
    <PetContext.Provider value={{ pets, loading, error, getPet, addPet, updatePet, deletePet }}>
      {children}
    </PetContext.Provider>
  )
}

export function usePets() {
  const ctx = useContext(PetContext)
  if (!ctx) throw new Error('usePets must be used within PetProvider')
  return ctx
}
```

- [ ] **Commit**

```bash
git add src/store/pet-context.tsx
git commit -m "feat: refactor pet-context to use Supabase"
```

---

### Task 8: Update App.tsx with auth

**Files:**
- Modify: `src/App.tsx`

- [ ] **Wrap app with AuthProvider + AuthGuard**

```typescript
// In App.tsx, add imports:
import { AuthProvider } from '@/store/auth-context'
import { AuthGuard } from '@/features/auth/AuthGuard'

// Replace the existing export default:
export default function App() {
  const { getPet } = usePets()
  // ... existing state ...

  return (
    <AuthProvider>
      <AuthGuard>
        <RootLayout ...>
          {/* existing page routing */}
        </RootLayout>
      </AuthGuard>
    </AuthProvider>
  )
}
```

- [ ] **Commit**

```bash
git add src/App.tsx
git commit -m "feat: add auth wrapper to app root"
```

---

### Task 9: Refactor HealthPage

**Files:**
- Modify: `src/features/health/HealthPage.tsx`

- [ ] **Replace mock data calls with Supabase queries**

```typescript
// Before (mock):
// const vaccinations = mockVaccinations(selectedPetId)

// After (supabase):
const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
useEffect(() => {
  supabase.from('vaccinations')
    .select('*')
    .eq('pet_id', selectedPetId)
    .then(({ data }) => setVaccinations(data as Vaccination[] ?? []))
}, [selectedPetId])
```

Apply the same pattern to `vet_visits` and `medications`.

- [ ] **Clean up unused mock imports**

Remove imports of `mockVaccinations`, `mockVisits`, `mockMedications` (they were exported in the Dashboard refactor).

- [ ] **Commit**

```bash
git add src/features/health/HealthPage.tsx
git commit -m "feat: refactor HealthPage to use Supabase"
```

---

### Task 10: Refactor ActivityPage

**Files:**
- Modify: `src/features/activity/ActivityPage.tsx`

- [ ] **Replace mock activity with Supabase queries**

```typescript
const [records, setRecords] = useState<ActivityRecord[]>([])
useEffect(() => {
  supabase.from('activity_records')
    .select('*')
    .eq('pet_id', selectedPetId)
    .order('date', { ascending: true })
    .then(({ data }) => setRecords(data as ActivityRecord[] ?? []))
}, [selectedPetId])
```

- [ ] **Clean up unused imports**

Remove `mockActivity` import.

- [ ] **Commit**

```bash
git add src/features/activity/ActivityPage.tsx
git commit -m "feat: refactor ActivityPage to use Supabase"
```

---

### Task 11: Refactor FeedingPage

**Files:**
- Modify: `src/features/feeding/FeedingPage.tsx`

- [ ] **Replace mock feeding with Supabase queries**

```typescript
const [records, setRecords] = useState<FeedingRecord[]>([])
useEffect(() => {
  const today = new Date().toISOString().slice(0, 10)
  supabase.from('feeding_records')
    .select('*')
    .eq('pet_id', selectedPetId)
    .gte('meal_time', today)
    .order('meal_time', { ascending: true })
    .then(({ data }) => setRecords(data as FeedingRecord[] ?? []))
}, [selectedPetId])
```

- [ ] **Clean up unused imports**

Remove `schedules`, `mockFeedingRecords` imports.

- [ ] **Commit**

```bash
git add src/features/feeding/FeedingPage.tsx
git commit -m "feat: refactor FeedingPage to use Supabase"
```

---

### Task 12: Refactor AppointmentsPage

**Files:**
- Modify: `src/features/appointments/AppointmentsPage.tsx`

- [ ] **Replace mock appointments with Supabase queries**

```typescript
const [appointments, setAppointments] = useState<Appointment[]>([])
useEffect(() => {
  supabase.from('appointments')
    .select('*')
    .eq('pet_id', selectedPetId)
    .order('date', { ascending: true })
    .then(({ data }) => setAppointments(data as Appointment[] ?? []))
}, [selectedPetId])
```

- [ ] **Clean up unused imports**

Remove `mockAppointments` import.

- [ ] **Commit**

```bash
git add src/features/appointments/AppointmentsPage.tsx
git commit -m "feat: refactor AppointmentsPage to use Supabase"
```

---

### Task 13: Edge Function — daily reminders

**Files:**
- Create: `supabase/functions/daily-reminders/index.ts`

- [ ] **Create Edge Function**

```typescript
// supabase/functions/daily-reminders/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const today = new Date().toISOString().slice(0, 10)

  const { data: reminders, error } = await supabase
    .from('reminders')
    .select('*, pets!inner(name)')
    .eq('due_date', today)
    .eq('is_completed', false)

  if (error) {
    console.error('Error fetching reminders:', error)
    return new Response('Error', { status: 500 })
  }

  for (const r of reminders ?? []) {
    console.log(`📅 Reminder: ${r.pets?.name} - ${r.title}`)
    // Future: send email via Resend / Supabase built-in email
  }

  return new Response(`Processed ${reminders?.length ?? 0} reminders`)
})
```

- [ ] **Deploy**

```bash
npx supabase functions deploy daily-reminders
```

- [ ] **Add cron schedule (via SQL)**

```sql
SELECT cron.schedule(
  'daily-reminders',
  '0 8 * * *',
  'https://<project>.functions.supabase.co/daily-reminders'
);
```

- [ ] **Commit**

```bash
git add supabase/functions/daily-reminders/
git commit -m "feat: add daily reminders edge function"
```

---

### Task 14: Avatar storage

- [ ] **Create Storage bucket for avatars**

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

CREATE POLICY "anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
```

- [ ] **Add avatar upload UI to Settings page**

```bash
git add supabase/migrations/003_storage.sql
git commit -m "feat: add avatar storage bucket"
```

---

### Task 15: Household member management UI

- [ ] **Add household management to Settings page**

Allow household admins to:
- View current members
- Invite new members by email (Edge Function or simple insert)

```bash
git commit -m "feat: add household member management to settings"
```

---

### Task 16: Build verification

- [ ] **Verify build**

```bash
npm run build
```

Expected: `tsc -b && vite build` completes with no errors.

- [ ] **Push**

```bash
git push origin main
```
