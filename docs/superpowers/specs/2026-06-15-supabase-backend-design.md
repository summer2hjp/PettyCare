# PettyCare Supabase 後端設計文檔

> 基於 Supabase 的多用戶 SaaS 後端架構，支援家庭寵物共享管理。

---

## 1. 整體架構

```
┌─────────────────────────────────────────────────┐
│                   前端 (React)                     │
│  @supabase/supabase-js 直接調用 Database/ Auth   │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│                  Supabase                         │
├─────────────────────────────────────────────────┤
│  PostgreSQL    ←  11 張表 + Row Level Security  │
│  Auth          ←  email+password 註冊登入        │
│  Storage       ←  寵物頭像 avatar 上傳           │
│  Edge Functions ←  排程通知 (Deno cron)          │
└─────────────────────────────────────────────────┘
```

## 2. 資料庫 Schema

### 2.1 用戶與家庭

```sql
-- 擴展 auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 家庭群組
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 家庭成員（多對多）
CREATE TABLE household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(household_id, user_id)
);
```

### 2.2 寵物與健康

```sql
-- 寵物（歸家庭所有）
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

-- 疫苗記錄
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

-- 就診記錄
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

-- 用藥記錄
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
```

### 2.3 活動與餵食

```sql
-- 活動記錄
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

-- 餵食記錄
CREATE TABLE feeding_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  meal_time TIMESTAMPTZ NOT NULL,
  food TEXT NOT NULL,
  portion TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.4 預約與提醒

```sql
-- 預約
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

-- 提醒
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
```

### 2.5 索引

```sql
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

## 3. Row Level Security

### 3.1 輔助函數

```sql
-- 查詢當前用戶所屬的所有家庭 ID
CREATE OR REPLACE FUNCTION auth.user_households()
RETURNS SETOF UUID
LANGUAGE sql STABLE
AS $$
  SELECT household_id FROM public.household_members WHERE user_id = auth.uid()
$$;
```

### 3.2 各表 RLS 策略

```sql
-- profiles：用戶只能看/編輯自己的資料
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can view own profile"
  ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "users can update own profile"
  ON profiles FOR UPDATE USING (id = auth.uid());

-- households：屬於該家庭的成員可查看
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can view their households"
  ON households FOR SELECT
  USING (id IN (SELECT auth.user_households()));

-- household_members：admin 可管理，member 可查看
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can view household members"
  ON household_members FOR SELECT
  USING (household_id IN (SELECT auth.user_households()));
CREATE POLICY "admins can manage household members"
  ON household_members FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
-- (UPDATE/DELETE 同理)

-- pets：家庭成員可 CRUD
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can manage household pets"
  ON pets FOR ALL
  USING (household_id IN (SELECT auth.user_households()))
  WITH CHECK (household_id IN (SELECT auth.user_households()));

-- 健康/活動/餵食/預約/提醒：透過 pet 的 household 間接隔離
-- 通用函數判斷用戶是否有權存取某個 pet_id
CREATE OR REPLACE FUNCTION auth.can_access_pet(pet_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM pets p
    WHERE p.id = pet_id
    AND p.household_id IN (SELECT auth.user_households())
  )
$$;

-- vaccinations
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can manage vaccinations"
  ON vaccinations FOR ALL
  USING (auth.can_access_pet(pet_id))
  WITH CHECK (auth.can_access_pet(pet_id));

-- (vet_visits, medications, activity_records, feeding_records, appointments, reminders 均套用相同模式)
```

## 4. Auth 流程

```typescript
// 註冊
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
})
// 註冊成功後自動建立 profile (透過 Database Trigger)

// 登入
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
})

// 註冊 trigger: 自動建立 profile + 預設家庭
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_household_id UUID;
BEGIN
  -- 建立 profile
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
  
  -- 為新用戶建立預設家庭
  INSERT INTO public.households (name)
  VALUES (NEW.email || '''s Household')
  RETURNING id INTO default_household_id;
  
  -- 將用戶加入該家庭（admin）
  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (default_household_id, NEW.id, 'admin');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 5. 遷移策略

### 5.1 第一階段：建表 + Seed 數據

```sql
-- supabase/seed.sql
-- 將現有 MOCK_PETS 和各 Feature 的 mock 數據轉為 INSERT
INSERT INTO households (id, name) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Demo Household');

INSERT INTO pets (id, household_id, name, species, breed, gender, birth_date, weight, weight_unit, color, notes)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Luna', 'cat', 'Persian', 'female', '2021-03-15', 4.2, 'kg', '#F5F0EB', 'Loves catnip'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Max', 'dog', 'Golden Retriever', 'male', '2019-07-20', 32.5, 'kg', '#D4A574', NULL);
-- ... 其餘寵物 + 健康/活動/餵食/預約數據
```

### 5.2 第二階段：前端接入

```
pet-context.tsx 改寫:
  - 不再是 useState + MOCK_PETS
  - 改為 supabase.from('pets').select('*')
  - 保持原有 usePets() 接口不變

新增頁面:
  - LoginPage (email + password)
  - RegisterPage
  - AuthGuard (未登入時重導向登入頁)

每個 Feature 的 mock 數據 → supabase 查詢:
  - HealthPage → vaccinations, vet_visits, medications
  - ActivityPage → activity_records
  - FeedingPage → feeding_records
  - AppointmentsPage → appointments
```

### 5.3 第三階段：Edge Functions

```typescript
// supabase/functions/daily-reminders/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const today = new Date().toISOString().slice(0, 10)
  
  const { data: reminders } = await supabase
    .from('reminders')
    .select('*, pets(name, household_id)')
    .eq('due_date', today)
    .eq('is_completed', false)
  
  // 透過 Supabase Email 或第三方發送通知
  for (const r of reminders ?? []) {
    console.log(`Reminder: ${r.pets?.name} - ${r.title}`)
    // 實際發送邏輯
  }
  
  return new Response(`Processed ${reminders?.length ?? 0} reminders`)
})
```

## 6. 前端組件接入對照

| 當前元件 | 當前 mock 來源 | Supabase 取代 |
|---------|---------------|--------------|
| `usePets()` | `MOCK_PETS` 陣列 | `supabase.from('pets').select('*')` |
| `mockVaccinations(petId)` | `perPetVaccinations` | `supabase.from('vaccinations').eq('pet_id', petId)` |
| `mockVisits(petId)` | `perPetVisits` | `supabase.from('vet_visits').eq('pet_id', petId)` |
| `mockMedications(petId)` | `perPetMedications` | `supabase.from('medications').eq('pet_id', petId)` |
| `mockActivity(petId)` | random gen | `supabase.from('activity_records').eq('pet_id', petId)` |
| `mockFeedingRecords(petId)` | `perPetSchedules` | `supabase.from('feeding_records').eq('pet_id', petId)` |
| `mockAppointments(petId)` | per-pet array | `supabase.from('appointments').eq('pet_id', petId)` |

## 7. 實現優先級

```
P0: 建立 Supabase 專案 + 執行 migration.sql
P0: 寫 seed.sql 導入 demo 數據
P0: 前端的登入/註冊頁面 + AuthGuard
P0: pet-context.tsx 改接 supabase
P1: HealthPage → vaccinations/vet_visits/medications
P1: ActivityPage → activity_records
P1: FeedingPage → feeding_records
P1: AppointmentsPage → appointments
P2: Edge Function: 每日提醒
P2: Storage: 寵物頭像上傳
P2: 家庭成員管理 UI
```
