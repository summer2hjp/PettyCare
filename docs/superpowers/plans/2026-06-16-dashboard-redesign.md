# Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Dashboard from Apple-style data grid to glassmorphism pet-centric gallery with moments (daily/interaction/growth) and photo preview.

**Architecture:** Add `pet_moments` DB table + RLS; build 7 new components (PetSelectorStrip, PetHeroCard, MomentSection, MomentCard, GrowthTimelineSection, DataCardRow, PhotoPreview); rewrite DashboardPage composition; add avatar upload to PetFormPage; all cards use GlassPanel instead of AppleCard.

**Tech Stack:** React + TypeScript, Tailwind CSS with custom glass classes, Supabase (table + RLS), Puppeteer for tests

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `supabase/migrations/005_pet_moments.sql` | pet_moments table + RLS + indexes |
| `src/types/moments.ts` | PetMoment TypeScript interface |
| `src/features/dashboard/hooks/usePetMoments.ts` | Data fetching hook for moments |
| `src/features/dashboard/components/PetSelectorStrip.tsx` | Horizontal pet avatar selector |
| `src/features/dashboard/components/PetHeroCard.tsx` | 3-up pet hero + health + activity |
| `src/features/dashboard/components/MomentCard.tsx` | Single moment image card |
| `src/features/dashboard/components/MomentSection.tsx` | Horizontal scroll gallery wrapper |
| `src/features/dashboard/components/GrowthTimelineSection.tsx` | Timeline with arrow connectors |
| `src/features/dashboard/components/DataCardRow.tsx` | 4 compact stat cards in a row |
| `src/features/dashboard/components/PhotoPreview.tsx` | Full-screen image preview modal |
| `src/features/dashboard/components/GlassMomentSkeleton.tsx` | Skeleton placeholder for moment cards |

### Modified Files
| File | Change |
|------|--------|
| `supabase/seed.sql` | Add pet_moments seed data (3-4 per pet per type) |
| `src/features/dashboard/DashboardPage.tsx` | Full rewrite with new components |
| `src/features/dashboard/hooks/useDashboardData.ts` | Add selectedPetId param |
| `src/features/dashboard/components/DashboardSection.tsx` | Add glassmorphism variant |
| `src/features/dashboard/components/QuickActionsSection.tsx` | GlassPanel instead of AppleCard |
| `src/features/pets/PetFormPage.tsx` | Add avatar upload section |
| `tests/dashboard-visual.spec.ts` | Add new TL1/TL2 tests for new components |

---

### Task 1: Database Migration — pet_moments table

**Files:**
- Create: `supabase/migrations/005_pet_moments.sql`
- Modify: `supabase/seed.sql`

**Context:** The `pet_moments` table stores photos with type classification (daily/interaction/growth), linked to pets via foreign key.

- [ ] **Step 1: Create migration 005**

Write `supabase/migrations/005_pet_moments.sql`:

```sql
-- supabase/migrations/005_pet_moments.sql
-- Pet Moments table for Dashboard photo galleries

CREATE TABLE pet_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  moment_type TEXT NOT NULL CHECK (moment_type IN ('daily', 'interaction', 'growth')),
  taken_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pet_moments_pet_type ON pet_moments(pet_id, moment_type);
CREATE INDEX idx_pet_moments_pet_date ON pet_moments(pet_id, taken_at DESC);

ALTER TABLE pet_moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their household's pet moments" ON pet_moments
  FOR SELECT USING (
    pet_id IN (
      SELECT id FROM pets WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their household's pet moments" ON pet_moments
  FOR INSERT WITH CHECK (
    pet_id IN (
      SELECT id FROM pets WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their household's pet moments" ON pet_moments
  FOR UPDATE USING (
    pet_id IN (
      SELECT id FROM pets WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their household's pet moments" ON pet_moments
  FOR DELETE USING (
    pet_id IN (
      SELECT id FROM pets WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );
```

- [ ] **Step 2: Add seed data to supabase/seed.sql**

Append to end of `supabase/seed.sql`:

```sql
-- =============================================================================
-- 10. Pet Moments (for Dashboard gallery, 3-4 per pet per type)
-- =============================================================================
INSERT INTO pet_moments (id, pet_id, image_url, caption, moment_type, taken_at)
SELECT gen_random_uuid(), pet_id::uuid, image_url, caption, moment_type, taken_at::date
FROM (VALUES
  -- Luna (cat)
  ('b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-daily-1/400/400', '窗边晒太阳 🌤️', 'daily', '2025-06-10'),
  ('b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-daily-2/400/400', '追逐蝴蝶 🦋', 'daily', '2025-06-11'),
  ('b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-daily-3/400/400', '纸箱里打盹 📦', 'daily', '2025-06-12'),
  ('b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-interact-1/600/450', '梳毛时光 🐱', 'interaction', '2025-06-08'),
  ('b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-interact-2/600/450', '逗猫棒大战 🪄', 'interaction', '2025-06-05'),
  ('b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-growth-1/400/500', '小猫到家第一天 🐣', 'growth', '2023-01-15'),
  ('b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-growth-2/400/500', '一岁啦 🎂', 'growth', '2024-03-15'),
  ('b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/luna-growth-3/400/500', '现在的大美人 ✨', 'growth', '2025-06-01'),
  -- Max (dog)
  ('b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-daily-1/400/400', '公园狂奔 🐕', 'daily', '2025-06-12'),
  ('b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-daily-2/400/400', '叼着球回来 🎾', 'daily', '2025-06-11'),
  ('b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-daily-3/400/400', '雨中散步 🌧️', 'daily', '2025-06-09'),
  ('b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-interact-1/600/450', '飞盘接球 🥏', 'interaction', '2025-06-10'),
  ('b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-interact-2/600/450', '早晨拥抱 🤗', 'interaction', '2025-06-08'),
  ('b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-growth-1/400/500', '幼犬时期 🐶', 'growth', '2019-07-20'),
  ('b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-growth-2/400/500', '帅气一岁 🏆', 'growth', '2020-07-20'),
  ('b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/max-growth-3/400/500', '今天的Max 💪', 'growth', '2025-06-01'),
  -- Coco (poodle)
  ('b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-daily-1/400/400', '美容后自恋 💇', 'daily', '2025-06-13'),
  ('b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-daily-2/400/400', '小步快跑 🏃', 'daily', '2025-06-10'),
  ('b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-daily-3/400/400', '玩具收藏 🧸', 'daily', '2025-06-08'),
  ('b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-interact-1/600/450', '教新把戏 🎪', 'interaction', '2025-06-07'),
  ('b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-interact-2/600/450', '沙发依偎 🛋️', 'interaction', '2025-06-05'),
  ('b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-growth-1/400/500', '到家第一天 🏠', 'growth', '2022-11-05'),
  ('b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/coco-growth-2/400/500', '现在的Coco 🌟', 'growth', '2025-06-01'),
  -- Bella (cat)
  ('b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-daily-1/400/400', '爬架最高处 🐈', 'daily', '2025-06-12'),
  ('b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-daily-2/400/400', '偷看窗外 👀', 'daily', '2025-06-11'),
  ('b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-daily-3/400/400', '午睡三小时 💤', 'daily', '2025-06-09'),
  ('b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-interact-1/600/450', '摸摸肚肚 🤲', 'interaction', '2025-06-06'),
  ('b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-interact-2/600/450', '激光点追踪 🔴', 'interaction', '2025-06-04'),
  ('b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-growth-1/400/500', '领养时的小可爱 🥺', 'growth', '2023-09-12'),
  ('b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-growth-2/400/500', '半年后 😊', 'growth', '2024-03-12'),
  ('b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bella-growth-3/400/500', '现在的女王 👑', 'growth', '2025-06-01'),
  -- Charlie (hamster)
  ('b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-daily-1/400/400', '跑轮时间 ⚡', 'daily', '2025-06-12'),
  ('b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-daily-2/400/400', '藏食物 🥜', 'daily', '2025-06-10'),
  ('b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-daily-3/400/400', '钻木屑 🪵', 'daily', '2025-06-08'),
  ('b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-interact-1/600/450', '手心喂食 🖐️', 'interaction', '2025-06-07'),
  ('b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-interact-2/600/450', '探险时间 🧭', 'interaction', '2025-06-05'),
  ('b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-growth-1/400/500', '刚到家 🐹', 'growth', '2024-06-01'),
  ('b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-growth-2/400/500', '两个月后 🥰', 'growth', '2024-08-01'),
  ('b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/charlie-growth-3/400/500', '现在的Charlie 🏋️', 'growth', '2025-06-01')
) AS t(pet_id, image_url, caption, moment_type, taken_at);
```

- [ ] **Step 3: Verify the migration reads correctly**

Run: `cat supabase/migrations/005_pet_moments.sql`
Expected: SQL with CREATE TABLE, CREATE INDEX, ALTER TABLE, and 4 CREATE POLICY statements.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/005_pet_moments.sql supabase/seed.sql
git commit -m "feat: add pet_moments table with RLS and seed data"
```

---

### Task 2: PetMoment TypeScript type

**Files:**
- Create: `src/types/moments.ts`

- [ ] **Step 1: Create the type file**

Write `src/types/moments.ts`:

```typescript
// src/types/moments.ts

export type MomentType = 'daily' | 'interaction' | 'growth'

export interface PetMoment {
  id: string
  petId: string
  imageUrl: string
  caption: string | null
  momentType: MomentType
  takenAt: string
  createdAt: string
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit src/types/moments.ts`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/moments.ts
git commit -m "feat: add PetMoment type"
```

---

### Task 3: usePetMoments hook

**Files:**
- Create: `src/features/dashboard/hooks/usePetMoments.ts`

- [ ] **Step 1: Create the hook**

Write `src/features/dashboard/hooks/usePetMoments.ts`:

```typescript
// src/features/dashboard/hooks/usePetMoments.ts

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { PetMoment, MomentType } from '@/types/moments'

interface UsePetMomentsOptions {
  petId: string | null  // null = all pets
  type: MomentType
  limit?: number
}

interface UsePetMomentsResult {
  moments: PetMoment[]
  loading: boolean
  error: string | null
  refresh: () => void
}

function mapRow(row: Record<string, unknown>): PetMoment {
  return {
    id: row.id as string,
    petId: row.pet_id as string,
    imageUrl: row.image_url as string,
    caption: row.caption as string | null,
    momentType: row.moment_type as MomentType,
    takenAt: row.taken_at as string,
    createdAt: row.created_at as string,
  }
}

export function usePetMoments({ petId, type, limit = 20 }: UsePetMomentsOptions): UsePetMomentsResult {
  const [moments, setMoments] = useState<PetMoment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMoments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('pet_moments')
        .select('*')
        .eq('moment_type', type)
        .order('taken_at', { ascending: false })
        .limit(limit)

      if (petId) {
        query = query.eq('pet_id', petId)
      }

      const { data, error: queryError } = await query
      if (queryError) throw queryError

      setMoments((data ?? []).map(r => mapRow(r as Record<string, unknown>)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load moments')
    } finally {
      setLoading(false)
    }
  }, [petId, type, limit])

  useEffect(() => {
    fetchMoments()
  }, [fetchMoments])

  return { moments, loading, error, refresh: fetchMoments }
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/hooks/usePetMoments.ts
git commit -m "feat: add usePetMoments hook"
```

---

### Task 4: GlassMomentSkeleton component

**Files:**
- Create: `src/features/dashboard/components/GlassMomentSkeleton.tsx`

- [ ] **Step 1: Create the skeleton component**

Write `src/features/dashboard/components/GlassMomentSkeleton.tsx`:

```typescript
// src/features/dashboard/components/GlassMomentSkeleton.tsx

import { cn } from '@/utils/cn'

interface GlassMomentSkeletonProps {
  count?: number
  aspectRatio?: 'square' | 'landscape' | 'portrait'
  className?: string
}

const aspectClasses = {
  square: 'aspect-square',
  landscape: 'aspect-[4/3]',
  portrait: 'aspect-[3/4]',
}

export function GlassMomentSkeleton({ count = 4, aspectRatio = 'square', className }: GlassMomentSkeletonProps) {
  return (
    <div className={cn('flex gap-3 overflow-x-auto scrollbar-none', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'shrink-0 rounded-xl glass-light',
            aspectClasses[aspectRatio],
            'min-w-[140px]'
          )}
        >
          <div className="w-full h-full flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 rounded-full bg-white/20" />
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/components/GlassMomentSkeleton.tsx
git commit -m "feat: add GlassMomentSkeleton component"
```

---

### Task 5: PetSelectorStrip component

**Files:**
- Create: `src/features/dashboard/components/PetSelectorStrip.tsx`

- [ ] **Step 1: Create the component**

Write `src/features/dashboard/components/PetSelectorStrip.tsx`:

```typescript
// src/features/dashboard/components/PetSelectorStrip.tsx

import { useRef, useEffect, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { AppleAvatar } from '@/components/ui/AppleAvatar'
import { DynamicType } from '@/components/ui/DynamicType'
import type { Pet } from '@/types/pet'

interface PetSelectorStripProps {
  pets: Pet[]
  activePetId: string | null
  onSelect: (petId: string | null) => void
  loading?: boolean
}

function SkeletonPet() {
  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
      <div className="w-14 h-14 rounded-2xl glass-light animate-pulse flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-white/20" />
      </div>
      <div className="h-3 w-12 skeleton rounded" />
    </div>
  )
}

export function PetSelectorStrip({ pets, activePetId, onSelect, loading }: PetSelectorStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current
      const el = activeRef.current
      const offset = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2
      container.scrollTo({ left: Math.max(0, offset), behavior: 'smooth' })
    }
  }, [activePetId])

  if (loading) {
    return (
      <div className="mb-6">
        <DynamicType styleLevel="title3" weight={600} className="mb-3 px-1">My Pets</DynamicType>
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-none px-1">
          <SkeletonPet />
          <SkeletonPet />
          <SkeletonPet />
          <SkeletonPet />
        </div>
      </div>
    )
  }

  if (pets.length === 0) return null

  return (
    <div className="mb-6">
      <DynamicType styleLevel="title3" weight={600} className="mb-3 px-1">My Pets</DynamicType>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory px-1 pb-1">
        {/* "All Pets" button — only if more than 1 pet */}
        {pets.length > 1 && (
          <button
            onClick={() => onSelect(null)}
            className="snap-start shrink-0"
          >
            <GlassPanel
              intensity="light"
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-[72px] h-[92px] cursor-pointer transition-all duration-300',
                activePetId === null && 'ring-2 ring-apple-blue scale-105'
              )}
            >
              <div className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center">
                <span className="text-lg">🐾</span>
              </div>
              <DynamicType styleLevel="caption2" weight={activePetId === null ? 600 : 400}>
                All
              </DynamicType>
            </GlassPanel>
          </button>
        )}

        {pets.map(pet => {
          const isActive = activePetId === pet.id
          return (
            <button
              key={pet.id}
              ref={isActive ? activeRef : undefined}
              onClick={() => onSelect(pet.id)}
              className="snap-start shrink-0"
            >
              <GlassPanel
                intensity="light"
                className={cn(
                  'flex flex-col items-center gap-1 w-[72px] py-2 cursor-pointer transition-all duration-300',
                  isActive && 'ring-2 ring-apple-blue scale-105'
                )}
              >
                <AppleAvatar
                  src={pet.avatarUrl ? `/picture/${pet.avatarUrl}` : undefined}
                  name={pet.name}
                  size="md"
                />
                <DynamicType
                  styleLevel="caption2"
                  weight={isActive ? 600 : 400}
                  className="text-center truncate w-full px-0.5"
                >
                  {pet.name}
                </DynamicType>
                <DynamicType styleLevel="caption2" className="text-apple-tertiaryLabel">
                  {pet.weight}{pet.weightUnit}
                </DynamicType>
              </GlassPanel>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/components/PetSelectorStrip.tsx
git commit -m "feat: add PetSelectorStrip component"
```

---

### Task 6: MomentCard component

**Files:**
- Create: `src/features/dashboard/components/MomentCard.tsx`

- [ ] **Step 1: Create the component**

Write `src/features/dashboard/components/MomentCard.tsx`:

```typescript
// src/features/dashboard/components/MomentCard.tsx

import { useState } from 'react'
import { cn } from '@/utils/cn'
import { DynamicType } from '@/components/ui/DynamicType'
import type { PetMoment, MomentType } from '@/types/moments'

interface MomentCardProps {
  moment: PetMoment
  type: MomentType
  onClick: () => void
  className?: string
  style?: React.CSSProperties
}

const aspectClasses: Record<MomentType, string> = {
  daily: 'aspect-square',
  interaction: 'aspect-[4/3]',
  growth: 'aspect-[3/4]',
}

const glassClasses: Record<MomentType, string> = {
  daily: 'glass-light',
  interaction: 'glass',
  growth: 'glass-light',
}

const radiusClasses: Record<MomentType, string> = {
  daily: 'rounded-xl',
  interaction: 'rounded-2xl',
  growth: 'rounded-xl',
}

export function MomentCard({ moment, type, onClick, className, style }: MomentCardProps) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 overflow-hidden relative cursor-pointer',
        'transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl',
        radiusClasses[type],
        glassClasses[type],
        aspectClasses[type],
        'min-w-[140px]',
        className
      )}
      style={style}
    >
      {!imgLoaded && !imgError && (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-white/10">
          <div className="w-8 h-8 rounded-full bg-white/20" />
        </div>
      )}

      {imgError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/5">
          <span className="text-2xl">🐾</span>
          <DynamicType styleLevel="caption2" className="text-white/60">
            Load failed
          </DynamicType>
        </div>
      ) : (
        <img
          src={moment.imageUrl}
          alt={moment.caption ?? 'Pet moment'}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            imgLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      )}

      {/* Caption overlay */}
      {moment.caption && (
        <div className={cn(
          'absolute bottom-0 left-0 right-0 p-2',
          type === 'interaction'
            ? 'bg-gradient-to-t from-black/60 to-transparent'
            : 'bg-white/20 backdrop-blur-sm'
        )}>
          <DynamicType
            styleLevel="caption2"
            weight={600}
            className="text-white truncate"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
          >
            {moment.caption}
          </DynamicType>
        </div>
      )}
    </button>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/components/MomentCard.tsx
git commit -m "feat: add MomentCard component"
```

---

### Task 7: MomentSection component

**Files:**
- Create: `src/features/dashboard/components/MomentSection.tsx`

- [ ] **Step 1: Create the component**

Write `src/features/dashboard/components/MomentSection.tsx`:

```typescript
// src/features/dashboard/components/MomentSection.tsx

import { useRef, useState, useEffect } from 'react'
import { cn } from '@/utils/cn'
import { DynamicType } from '@/components/ui/DynamicType'
import { ChevronRight, Camera } from 'lucide-react'
import { MomentCard } from './MomentCard'
import { GlassMomentSkeleton } from './GlassMomentSkeleton'
import type { PetMoment, MomentType } from '@/types/moments'

interface MomentSectionProps {
  title: string
  subtitle?: string
  moments: PetMoment[]
  momentType: MomentType
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  onViewAll?: () => void
  onMomentClick: (index: number) => void
  onRetry?: () => void
}

export function MomentSection({
  title,
  subtitle,
  moments,
  momentType,
  loading = false,
  error = null,
  emptyMessage,
  onViewAll,
  onMomentClick,
  onRetry,
}: MomentSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const check = () => {
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
    }

    check()
    el.addEventListener('scroll', check)
    window.addEventListener('resize', check)
    return () => {
      el.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [moments])

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-baseline gap-2">
          <DynamicType styleLevel="title3" weight={600}>{title}</DynamicType>
          {subtitle && (
            <DynamicType styleLevel="caption1" className="text-apple-tertiaryLabel">
              {subtitle}
            </DynamicType>
          )}
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-0.5 text-apple-blue text-apple-footnote hover:opacity-80 transition-opacity"
          >
            View All
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      {error ? (
        <div className="rounded-xl glass-light p-5 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <DynamicType styleLevel="footnote" weight={600} className="text-apple-red">
              Failed to load
            </DynamicType>
            <DynamicType styleLevel="caption2" className="text-apple-secondaryLabel">
              {error}
            </DynamicType>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1.5 rounded-lg glass-light text-apple-blue text-apple-footnote hover:opacity-80 transition-opacity"
            >
              Retry
            </button>
          )}
        </div>
      ) : loading ? (
        <GlassMomentSkeleton
          count={4}
          aspectRatio={momentType === 'daily' ? 'square' : momentType === 'interaction' ? 'landscape' : 'portrait'}
        />
      ) : moments.length === 0 ? (
        <div className="rounded-xl glass-light p-6 flex flex-col items-center gap-2">
          <Camera size={24} className="text-apple-tertiaryLabel" />
          <DynamicType styleLevel="caption1" className="text-apple-secondaryLabel text-center">
            {emptyMessage ?? '还没有记录'}
          </DynamicType>
        </div>
      ) : (
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1"
          >
            {moments.map((moment, index) => (
              <MomentCard
                key={moment.id}
                moment={moment}
                type={momentType}
                onClick={() => onMomentClick(index)}
                style={{ transitionDelay: `${index * 60}ms` }}
              />
            ))}
          </div>

          {/* Right scroll hint */}
          {canScrollRight && moments.length > 2 && (
            <div className="absolute right-0 top-0 bottom-3 w-12 bg-gradient-to-l from-white/30 to-transparent pointer-events-none rounded-r-xl" />
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/components/MomentSection.tsx
git commit -m "feat: add MomentSection component"
```

---

### Task 8: GrowthTimelineSection component

**Files:**
- Create: `src/features/dashboard/components/GrowthTimelineSection.tsx`

- [ ] **Step 1: Create the component**

Write `src/features/dashboard/components/GrowthTimelineSection.tsx`:

```typescript
// src/features/dashboard/components/GrowthTimelineSection.tsx

import { cn } from '@/utils/cn'
import { DynamicType } from '@/components/ui/DynamicType'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { GlassMomentSkeleton } from './GlassMomentSkeleton'
import { ChevronRight, Clock } from 'lucide-react'
import type { PetMoment } from '@/types/moments'

interface GrowthTimelineSectionProps {
  moments: PetMoment[]
  loading?: boolean
  error?: string | null
  onMomentClick: (index: number) => void
  onRetry?: () => void
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${d.getMonth() + 1}`
}

export function GrowthTimelineSection({
  moments,
  loading,
  error,
  onMomentClick,
  onRetry,
}: GrowthTimelineSectionProps) {
  const sorted = [...moments].sort(
    (a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime()
  )

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <DynamicType styleLevel="title3" weight={600}>📈 成长轨迹</DynamicType>
      </div>

      {error ? (
        <div className="rounded-xl glass-light p-5 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <DynamicType styleLevel="footnote" weight={600} className="text-apple-red">
              Failed to load
            </DynamicType>
            <DynamicType styleLevel="caption2" className="text-apple-secondaryLabel">
              {error}
            </DynamicType>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1.5 rounded-lg glass-light text-apple-blue text-apple-footnote hover:opacity-80 transition-opacity"
            >
              Retry
            </button>
          )}
        </div>
      ) : loading ? (
        <GlassMomentSkeleton count={3} aspectRatio="portrait" />
      ) : sorted.length === 0 ? (
        <div className="rounded-xl glass-light p-6 flex flex-col items-center gap-2">
          <Clock size={24} className="text-apple-tertiaryLabel" />
          <DynamicType styleLevel="caption1" className="text-apple-secondaryLabel text-center">
            还没有成长记录，每月拍一张对比照吧 📸
          </DynamicType>
        </div>
      ) : (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1 px-1">
          {sorted.map((moment, index) => {
            const isFirst = index === 0
            const isLast = index === sorted.length - 1
            const label = isFirst ? `🐣 ${formatDate(moment.takenAt)}` :
                         isLast ? '现在' :
                         formatDate(moment.takenAt)

            return (
              <div key={moment.id} className="flex items-center gap-2 snap-start shrink-0">
                {index > 0 && (
                  <ChevronRight size={20} className="text-apple-tertiaryLabel shrink-0" />
                )}
                <button
                  onClick={() => onMomentClick(index)}
                  className="group shrink-0 w-[140px]"
                >
                  <GlassPanel
                    intensity="light"
                    className="overflow-hidden cursor-pointer transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-0.5 group-hover:shadow-xl"
                  >
                    <div className="aspect-[3/4] relative">
                      <img
                        src={moment.imageUrl}
                        alt={moment.caption ?? ''}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <DynamicType
                          styleLevel="caption2"
                          weight={600}
                          className="text-white truncate"
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                        >
                          {label}
                        </DynamicType>
                        {moment.caption && (
                          <DynamicType styleLevel="caption2" className="text-white/80 truncate">
                            {moment.caption}
                          </DynamicType>
                        )}
                      </div>
                    </div>
                  </GlassPanel>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/components/GrowthTimelineSection.tsx
git commit -m "feat: add GrowthTimelineSection component"
```

---

### Task 9: DataCardRow component

**Files:**
- Create: `src/features/dashboard/components/DataCardRow.tsx`

- [ ] **Step 1: Create the component**

Write `src/features/dashboard/components/DataCardRow.tsx`:

```typescript
// src/features/dashboard/components/DataCardRow.tsx

import { cn } from '@/utils/cn'
import { DynamicType } from '@/components/ui/DynamicType'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Heart, UtensilsCrossed, Calendar, Lightbulb, AlertCircle } from 'lucide-react'
import type { DashboardHealthData, DashboardActivityData, FeedingMeal, DashboardUpcomingEvent, DashboardInsight } from '@/features/dashboard/types/dashboard'

interface DataCardRowProps {
  health: DashboardHealthData | null
  feeding: FeedingMeal[]
  events: DashboardUpcomingEvent[]
  insights: DashboardInsight[]
  loading?: boolean
  className?: string
  onNavigate?: (page: string) => void
}

function StatCardSkeleton() {
  return (
    <GlassPanel intensity="light" className="p-4 animate-pulse">
      <div className="w-7 h-7 rounded-lg bg-white/20 mb-2" />
      <div className="h-5 w-16 skeleton mb-1" />
      <div className="h-3 w-20 skeleton" />
    </GlassPanel>
  )
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sublabel?: string
  onClick?: () => void
}) {
  return (
    <GlassPanel
      intensity="light"
      className={cn(
        'p-4 transition-all duration-300',
        onClick && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg'
      )}
      as="button"
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-white/30 flex items-center justify-center">
          {icon}
        </div>
        <DynamicType styleLevel="caption2" className="text-apple-secondaryLabel">
          {label}
        </DynamicType>
      </div>
      <DynamicType styleLevel="body" weight={600}>
        {value}
      </DynamicType>
      {sublabel && (
        <DynamicType styleLevel="caption2" className="text-apple-tertiaryLabel mt-0.5">
          {sublabel}
        </DynamicType>
      )}
    </GlassPanel>
  )
}

export function DataCardRow({ health, feeding, events, insights, loading, className, onNavigate }: DataCardRowProps) {
  if (loading) {
    return (
      <div className={cn('mb-6', className)}>
        <DynamicType styleLevel="title3" weight={600} className="mb-3 px-1">Overview</DynamicType>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    )
  }

  const healthValue = health ? `${health.score}` : '--'
  const healthSublabel = health ? health.status : 'No data'

  const feedingCount = feeding.length
  const nextMeal = feeding.find(m => m.status === 'upcoming')
  const feedingValue = feedingCount > 0 ? `${feedingCount} meals` : '--'
  const feedingSublabel = nextMeal ? `Next: ${nextMeal.time.slice(0, 5)}` : 'No schedule'

  const eventsCount = events.length
  const nearestEvent = events[0]
  const eventsValue = eventsCount > 0 ? `${eventsCount} upcoming` : '--'
  const eventsSublabel = nearestEvent ? nearestEvent.title.slice(0, 20) : 'All clear'

  const insightValue = insights.length > 0 ? insights[0].title : '--'
  const insightSublabel = insights.length > 0 ? insights[0].description.slice(0, 24) : 'Check back later'

  return (
    <div className={cn('mb-6', className)}>
      <DynamicType styleLevel="title3" weight={600} className="mb-3 px-1">Overview</DynamicType>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Heart size={14} className="text-apple-red" />}
          label="Health"
          value={healthValue}
          sublabel={healthSublabel}
          onClick={onNavigate ? () => onNavigate('health') : undefined}
        />
        <StatCard
          icon={<UtensilsCrossed size={14} />}
          label="Feeding"
          value={feedingValue}
          sublabel={feedingSublabel}
          onClick={onNavigate ? () => onNavigate('feeding') : undefined}
        />
        <StatCard
          icon={<Calendar size={14} />}
          label="Events"
          value={eventsValue}
          sublabel={eventsSublabel}
          onClick={onNavigate ? () => onNavigate('appointments') : undefined}
        />
        <StatCard
          icon={<Lightbulb size={14} />}
          label="Insight"
          value={insightValue}
          sublabel={insightSublabel}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/components/DataCardRow.tsx
git commit -m "feat: add DataCardRow component"
```

---

### Task 10: PhotoPreview component

**Files:**
- Create: `src/features/dashboard/components/PhotoPreview.tsx`

- [ ] **Step 1: Create the component**

Write `src/features/dashboard/components/PhotoPreview.tsx`:

```typescript
// src/features/dashboard/components/PhotoPreview.tsx

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/utils/cn'
import { DynamicType } from '@/components/ui/DynamicType'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { X, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import type { PetMoment } from '@/types/moments'

interface PhotoPreviewProps {
  moments: PetMoment[]
  initialIndex: number
  onClose: () => void
}

export function PhotoPreview({ moments, initialIndex, onClose }: PhotoPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [closing, setClosing] = useState(false)
  const [loading, setLoading] = useState(true)

  const current = moments[currentIndex]

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= moments.length) return
    setCurrentIndex(index)
    setImgError(false)
    setImgLoaded(false)
    setLoading(true)
  }, [moments.length])

  const goNext = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex])
  const goPrev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex])

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(onClose, 200)
  }, [onClose])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape': handleClose(); break
        case 'ArrowLeft': goPrev(); break
        case 'ArrowRight': goNext(); break
      }
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleClose, goPrev, goNext])

  if (!current) return null

  const typeLabel: Record<string, string> = {
    daily: '宠物的日常',
    interaction: '互动瞬间',
    growth: '成长轨迹',
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center',
        'backdrop-blur-xl bg-black/60',
        'transition-all duration-200',
        closing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      )}
      onClick={handleClose}
    >
      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); handleClose() }}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full glass-heavy flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <X size={20} className="text-white" />
      </button>

      {/* Left arrow */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); goPrev() }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full glass-heavy flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
      )}

      {/* Right arrow */}
      {currentIndex < moments.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goNext() }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full glass-heavy flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      )}

      {/* Image */}
      <div
        className="relative max-w-[80vw] max-h-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && !imgError && (
          <div className="w-[400px] h-[300px] rounded-2xl glass-heavy flex items-center justify-center animate-pulse">
            <div className="w-10 h-10 rounded-full bg-white/10" />
          </div>
        )}

        {imgError ? (
          <div className="rounded-2xl glass-heavy p-12 flex flex-col items-center gap-3">
            <RefreshCw size={32} className="text-white/40" />
            <DynamicType styleLevel="body" className="text-white/60">
              图片加载失败
            </DynamicType>
            <button
              onClick={() => {
                setImgError(false)
                setLoading(true)
                const img = new Image()
                img.src = current.imageUrl
                img.onload = () => { setImgLoaded(true); setLoading(false) }
                img.onerror = () => { setImgError(true); setLoading(false) }
              }}
              className="px-4 py-2 rounded-lg glass-light text-white text-apple-footnote hover:bg-white/10 transition-colors"
            >
              重试
            </button>
          </div>
        ) : (
          <img
            src={current.imageUrl}
            alt={current.caption ?? ''}
            className={cn(
              'max-w-full max-h-[70vh] object-contain rounded-2xl',
              'transition-all duration-300',
              imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            )}
            onLoad={() => { setImgLoaded(true); setLoading(false) }}
            onError={() => { setImgError(true); setLoading(false) }}
          />
        )}
      </div>

      {/* Caption bar */}
      <GlassPanel
        intensity="heavy"
        className="mt-4 px-6 py-3 flex items-center gap-4 max-w-[80vw]"
        as="div"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 min-w-0">
          <DynamicType styleLevel="body" weight={600} className="text-white">
            {current.caption ?? '无标题'}
          </DynamicType>
          <div className="flex items-center gap-3 mt-0.5">
            <DynamicType styleLevel="caption2" className="text-white/60">
              {current.takenAt}
            </DynamicType>
            <DynamicType styleLevel="caption2" className="text-white/40">
              ·
            </DynamicType>
            <DynamicType styleLevel="caption2" className="text-white/60">
              {typeLabel[current.momentType] ?? current.momentType}
            </DynamicType>
          </div>
        </div>
        <DynamicType styleLevel="caption2" className="text-white/40">
          {currentIndex + 1} / {moments.length}
        </DynamicType>
      </GlassPanel>

      {/* Thumbnail strip */}
      <div
        className="flex gap-2 mt-3 overflow-x-auto scrollbar-none max-w-[80vw] px-2"
        onClick={(e) => e.stopPropagation()}
      >
        {moments.map((moment, idx) => (
          <button
            key={moment.id}
            onClick={() => goTo(idx)}
            className={cn(
              'w-12 h-12 rounded-lg overflow-hidden shrink-0 transition-all duration-200',
              idx === currentIndex ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-80'
            )}
          >
            <img
              src={moment.imageUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/components/PhotoPreview.tsx
git commit -m "feat: add PhotoPreview component"
```

---

### Task 11: Update QuickActionsSection to GlassPanel

**Files:**
- Modify: `src/features/dashboard/components/QuickActionsSection.tsx`

- [ ] **Step 1: Rewrite QuickActionsSection with GlassPanel**

Replace the contents of `src/features/dashboard/components/QuickActionsSection.tsx`:

```typescript
// src/features/dashboard/components/QuickActionsSection.tsx
import { GlassPanel } from '@/components/ui/GlassPanel'
import { DynamicType } from '@/components/ui/DynamicType'
import type { DashboardAction } from '@/features/dashboard/types/dashboard'

interface QuickActionsSectionProps {
  actions: DashboardAction[]
  onAction: (action: DashboardAction) => void
}

export function QuickActionsSection({ actions, onAction }: QuickActionsSectionProps) {
  return (
    <div className="mb-6">
      <DynamicType styleLevel="title3" weight={600} className="mb-3 px-1">
        Quick Actions
      </DynamicType>
      <div className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => onAction(action)}
            className="snap-start shrink-0"
          >
            <GlassPanel
              intensity="light"
              className="flex items-center gap-2.5 min-w-[130px] px-4 py-3 cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
            >
              <span className="text-lg">{action.icon}</span>
              <DynamicType styleLevel="footnote" weight={600}>{action.label}</DynamicType>
            </GlassPanel>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Verify the file looks correct**

Run: `head -5 src/features/dashboard/components/QuickActionsSection.tsx`
Expected: First line is `// src/features/dashboard/components/QuickActionsSection.tsx`

- [ ] **Step 4: Commit**

```bash
git add src/features/dashboard/components/QuickActionsSection.tsx
git commit -m "refactor: QuickActionsSection use GlassPanel instead of AppleCard"
```

---

### Task 12: Update DashboardSection with glassmorphism variant

**Files:**
- Modify: `src/features/dashboard/components/DashboardSection.tsx`

- [ ] **Step 1: Update DashboardSection**

Replace the file `src/features/dashboard/components/DashboardSection.tsx` with glassmorphism version:

```typescript
import { type ReactNode } from 'react'
import { DynamicType } from '@/components/ui/DynamicType'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { cn } from '@/utils/cn'
import { ChevronRight, AlertCircle, RefreshCw } from 'lucide-react'

interface DashboardSectionProps {
  title: string
  subtitle?: string
  action?: { label: string; onClick: () => void }
  loading?: boolean
  error?: string | null
  empty?: boolean
  emptyMessage?: string
  onRetry?: () => void
  children?: ReactNode
  className?: string
  glassIntensity?: 'light' | 'medium' | 'heavy'
}

function SkeletonCard() {
  return (
    <div className="min-w-[140px] h-[120px] rounded-xl glass-light p-4 shrink-0 animate-pulse">
      <div className="h-3 w-2/3 bg-white/20 rounded mb-3" />
      <div className="h-6 w-1/2 bg-white/20 rounded mb-2" />
      <div className="h-3 w-1/3 bg-white/20 rounded" />
    </div>
  )
}

export function DashboardSection({
  title,
  subtitle,
  action,
  loading = false,
  error = null,
  empty = false,
  emptyMessage,
  onRetry,
  children,
  className,
  glassIntensity = 'light',
}: DashboardSectionProps) {
  return (
    <div className={cn('mb-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-baseline gap-2">
          <DynamicType styleLevel="title3" weight={600}>{title}</DynamicType>
          {subtitle && (
            <DynamicType styleLevel="caption1" className="text-apple-secondaryLabel">
              {subtitle}
            </DynamicType>
          )}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="flex items-center gap-0.5 text-apple-blue text-apple-footnote hover:opacity-80 transition-opacity"
          >
            {action.label}
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      {error ? (
        <GlassPanel intensity={glassIntensity} className="flex items-center gap-3 p-5">
          <AlertCircle size={20} className="text-apple-red shrink-0" />
          <div className="flex-1 min-w-0">
            <DynamicType styleLevel="footnote" weight={600}>Data load failed</DynamicType>
            <DynamicType styleLevel="caption2" className="text-apple-secondaryLabel">{error}</DynamicType>
          </div>
          {onRetry && (
            <button onClick={onRetry} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
              <RefreshCw size={16} className="text-apple-blue" />
            </button>
          )}
        </GlassPanel>
      ) : loading ? (
        <div className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : empty ? (
        <GlassPanel intensity={glassIntensity} className="p-5">
          <DynamicType styleLevel="caption1" className="text-apple-secondaryLabel text-center py-4">
            {emptyMessage ?? 'No data available'}
          </DynamicType>
        </GlassPanel>
      ) : (
        <div className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1">
          {children}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/components/DashboardSection.tsx
git commit -m "refactor: DashboardSection use GlassPanel instead of AppleCard"
```

---

### Task 13: Update useDashboardData hook with selectedPetId

**Files:**
- Modify: `src/features/dashboard/hooks/useDashboardData.ts`

- [ ] **Step 1: Add selectedPetId parameter**

Replace the `useDashboardData` function signature and add per-pet query logic. Key changes:
- Add `selectedPetId?: string | null` parameter
- When `selectedPetId` is set, scope all queries to that pet
- Remove the empty `timeline` and `insights` arrays (replaced by moments)

Edit `src/features/dashboard/hooks/useDashboardData.ts`:

Change function signature (line ~75):
```typescript
export function useDashboardData(selectedPetId?: string | null): DashboardData {
```

When filtering, use `selectedPetId` if provided:
- Replace `pets.map(p => ...)` with `targetPets.map(p => ...)` where `targetPets = selectedPetId ? pets.filter(p => p.id === selectedPetId) : pets`
- If `selectedPetId` is set and no pet matches, return empty data

Add at the top inside `loadData`:
```typescript
const targetPets = selectedPetId ? pets.filter(p => p.id === selectedPetId) : pets
```

Replace all `pets.map(p =>` with `targetPets.map(p =>`, and `pets[0]?.id` with `targetPets[0]?.id`.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/hooks/useDashboardData.ts
git commit -m "feat: add selectedPetId param to useDashboardData"
```

---

### Task 14: Rewrite DashboardPage

**Files:**
- Modify: `src/features/dashboard/DashboardPage.tsx`

- [ ] **Step 1: Rewrite DashboardPage with new components**

Replace `src/features/dashboard/DashboardPage.tsx`:

```typescript
// src/features/dashboard/DashboardPage.tsx

import { useState } from 'react'
import { usePets } from '@/store/pet-context'
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData'
import { usePetMoments } from '@/features/dashboard/hooks/usePetMoments'
import { PetSelectorStrip } from '@/features/dashboard/components/PetSelectorStrip'
import { PetHeroCard } from '@/features/dashboard/components/PetHeroCard'
import { MomentSection } from '@/features/dashboard/components/MomentSection'
import { GrowthTimelineSection } from '@/features/dashboard/components/GrowthTimelineSection'
import { DataCardRow } from '@/features/dashboard/components/DataCardRow'
import { QuickActionsSection } from '@/features/dashboard/components/QuickActionsSection'
import { PhotoPreview } from '@/features/dashboard/components/PhotoPreview'
import type { DashboardAction } from '@/features/dashboard/types/dashboard'
import type { PetMoment } from '@/types/moments'
import type { Pet } from '@/types/pet'

interface DashboardPageProps {
  onNavigate: (page: string) => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { pets, loading: petsLoading } = usePets()
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const data = useDashboardData(selectedPetId)

  // Fetch moments for each type
  const dailyMoments = usePetMoments({ petId: selectedPetId, type: 'daily', limit: 12 })
  const interactionMoments = usePetMoments({ petId: selectedPetId, type: 'interaction', limit: 8 })
  const growthMoments = usePetMoments({ petId: selectedPetId, type: 'growth', limit: 10 })

  // Photo preview state
  const [previewMoments, setPreviewMoments] = useState<PetMoment[] | null>(null)
  const [previewIndex, setPreviewIndex] = useState(0)

  const openPreview = (moments: PetMoment[], index: number) => {
    setPreviewMoments(moments)
    setPreviewIndex(index)
  }

  const handleAction = (action: DashboardAction) => {
    onNavigate(action.navigateTo.page)
  }

  const activePet: Pet | undefined = selectedPetId
    ? pets.find(p => p.id === selectedPetId)
    : undefined

  const overallLoading = data.loading || petsLoading

  return (
    <div>
      {/* Pet Selector Strip */}
      <PetSelectorStrip
        pets={pets}
        activePetId={selectedPetId}
        onSelect={setSelectedPetId}
        loading={petsLoading}
      />

      {/* Pet Hero Card — only when a specific pet is selected */}
      {activePet && (
        <PetHeroCard
          pet={activePet}
          health={data.health}
          activity={data.activity}
          loading={overallLoading}
        />
      )}

      {/* Quick Actions */}
      <QuickActionsSection actions={data.actions} onAction={handleAction} />

      {/* Daily Life Moments */}
      <MomentSection
        title="📸 宠物的日常"
        subtitle={activePet ? activePet.name : undefined}
        moments={dailyMoments.moments}
        momentType="daily"
        loading={dailyMoments.loading}
        error={dailyMoments.error}
        emptyMessage="还没有日常记录，快去拍一张吧 📸"
        onMomentClick={(index) => openPreview(dailyMoments.moments, index)}
        onRetry={dailyMoments.refresh}
      />

      {/* Interaction Moments */}
      <MomentSection
        title="💕 互动瞬间"
        subtitle={activePet ? activePet.name : undefined}
        moments={interactionMoments.moments}
        momentType="interaction"
        loading={interactionMoments.loading}
        error={interactionMoments.error}
        emptyMessage="还没有互动记录，和宠物一起玩吧 🎾"
        onMomentClick={(index) => openPreview(interactionMoments.moments, index)}
        onRetry={interactionMoments.refresh}
      />

      {/* Growth Timeline */}
      <GrowthTimelineSection
        moments={growthMoments.moments}
        loading={growthMoments.loading}
        error={growthMoments.error}
        onMomentClick={(index) => openPreview(growthMoments.moments, index)}
        onRetry={growthMoments.refresh}
      />

      {/* Data Card Row */}
      <DataCardRow
        health={data.health}
        feeding={data.feeding}
        events={data.events}
        insights={data.insights}
        loading={overallLoading}
        onNavigate={onNavigate}
      />

      {/* Photo Preview Modal */}
      {previewMoments && (
        <PhotoPreview
          moments={previewMoments}
          initialIndex={previewIndex}
          onClose={() => setPreviewMoments(null)}
        />
      )}
    </div>
  )
}
```

Note: This references `PetHeroCard` which we'll create in the next task. The import will fail until then.

- [ ] **Step 2: Temporarily stub PetHeroCard for type-checking**

Create a minimal stub at `src/features/dashboard/components/PetHeroCard.tsx`:
```typescript
export function PetHeroCard(_props: any) { return null }
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors about DashboardPage.

- [ ] **Step 4: Commit**

```bash
git add src/features/dashboard/DashboardPage.tsx
git commit -m "feat: rewrite DashboardPage with glassmorphism components"
```

---

### Task 15: PetHeroCard component

**Files:**
- Create: `src/features/dashboard/components/PetHeroCard.tsx` (replace stub)

- [ ] **Step 1: Implement PetHeroCard**

Replace the stub with full implementation:

```typescript
// src/features/dashboard/components/PetHeroCard.tsx

import { cn } from '@/utils/cn'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { AppleAvatar } from '@/components/ui/AppleAvatar'
import { DynamicType } from '@/components/ui/DynamicType'
import { Heart, Footprints, TrendingUp, TrendingDown } from 'lucide-react'
import type { Pet } from '@/types/pet'
import type { DashboardHealthData, DashboardActivityData } from '@/features/dashboard/types/dashboard'

interface PetHeroCardProps {
  pet: Pet
  health: DashboardHealthData | null
  activity: DashboardActivityData | null
  loading?: boolean
}

function getAge(birthDate: string): string {
  const now = new Date()
  const birth = new Date(birthDate)
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()
  if (years > 0) return `${years}岁${months > 0 ? `${months}个月` : ''}`
  return `${months + 12}个月`
}

function SkeletonHero() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      {[1, 2, 3].map(i => (
        <GlassPanel key={i} intensity="light" className="p-5 animate-pulse">
          <div className="w-full h-full space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20" />
            <div className="h-4 w-2/3 bg-white/20 rounded" />
            <div className="h-3 w-1/2 bg-white/20 rounded" />
          </div>
        </GlassPanel>
      ))}
    </div>
  )
}

export function PetHeroCard({ pet, health, activity, loading }: PetHeroCardProps) {
  if (loading) return <SkeletonHero />

  const speciesEmoji: Record<string, string> = {
    dog: '🐕', cat: '🐱', bird: '🐦', fish: '🐟', rabbit: '🐰', hamster: '🐹', other: '🐾',
  }

  const healthScoreColor = !health ? 'text-white/40' :
    health.score >= 80 ? 'text-green-400' :
    health.score >= 60 ? 'text-yellow-400' :
    'text-red-400'

  // Progress ring SVG
  const score = health?.score ?? 0
  const circumference = 2 * Math.PI * 28
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      {/* Pet Profile Card */}
      <GlassPanel intensity="medium" className="relative overflow-hidden p-0" as="div">
        <div className="aspect-[16/9] relative">
          {pet.avatarUrl ? (
            <img
              src={`/picture/${pet.avatarUrl}`}
              alt={pet.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
              <span className="text-5xl">{speciesEmoji[pet.species] ?? '🐾'}</span>
            </div>
          )}
          {/* Glass overlay with pet info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4">
            <DynamicType styleLevel="title2" weight={700} className="text-white">
              {pet.name}
            </DynamicType>
            <div className="flex items-center gap-2 mt-1">
              <DynamicType styleLevel="footnote" className="text-white/80">
                {speciesEmoji[pet.species] ?? ''} {pet.species} · {pet.breed}
              </DynamicType>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <DynamicType styleLevel="caption2" className="text-white/60">
                {getAge(pet.birthDate)} · {pet.weight}{pet.weightUnit}
              </DynamicType>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Health Score Card */}
      <GlassPanel intensity="light" className="p-5 flex flex-col items-center justify-center" as="div">
        <div className="flex items-center gap-2 mb-3">
          <Heart size={16} className="text-apple-red" />
          <DynamicType styleLevel="footnote" weight={600}>健康评分</DynamicType>
        </div>
        <div className="relative w-[64px] h-[64px] mb-2">
          <svg width="64" height="64" viewBox="0 0 64 64" className="transform -rotate-90">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
            <circle
              cx="32" cy="32" r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={healthScoreColor}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <DynamicType styleLevel="title2" weight={700} className={healthScoreColor}>
              {health?.score ?? '--'}
            </DynamicType>
          </div>
        </div>
        <DynamicType styleLevel="footnote" weight={600} className={healthScoreColor}>
          {health?.status ?? 'No Data'}
        </DynamicType>
        {health && (
          <div className="flex items-center gap-3 mt-2 text-[11px] text-white/50">
            <span>💉 {health.upcomingVaccinations} pending</span>
            <span>💊 {health.activeMedications} active</span>
          </div>
        )}
      </GlassPanel>

      {/* Activity Card */}
      <GlassPanel intensity="light" className="p-5" as="div">
        <div className="flex items-center gap-2 mb-3">
          <Footprints size={16} />
          <DynamicType styleLevel="footnote" weight={600}>今日活动</DynamicType>
        </div>
        {activity ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <DynamicType styleLevel="caption2" className="text-white/60">步数</DynamicType>
              <DynamicType styleLevel="body" weight={600}>
                {activity.steps.toLocaleString()}
              </DynamicType>
            </div>
            <div className="flex items-center justify-between">
              <DynamicType styleLevel="caption2" className="text-white/60">距离</DynamicType>
              <DynamicType styleLevel="body" weight={600}>
                {activity.distance}km
              </DynamicType>
            </div>
            <div className="flex items-center justify-between">
              <DynamicType styleLevel="caption2" className="text-white/60">消耗</DynamicType>
              <DynamicType styleLevel="body" weight={600}>
                {activity.calories}cal
              </DynamicType>
            </div>
            {activity.weeklyAvg > 0 && (
              <div className="flex items-center justify-between pt-1 border-t border-white/10">
                <DynamicType styleLevel="caption2" className="text-white/60">周均</DynamicType>
                <div className="flex items-center gap-1">
                  <DynamicType styleLevel="footnote" weight={600}>
                    {activity.weeklyAvg.toLocaleString()}
                  </DynamicType>
                  {activity.trendDirection === 'up' ? (
                    <TrendingUp size={14} className="text-green-400" />
                  ) : (
                    <TrendingDown size={14} className="text-red-400" />
                  )}
                  <DynamicType styleLevel="caption2" className={cn(
                    activity.trendDirection === 'up' ? 'text-green-400' : 'text-red-400'
                  )}>
                    {activity.trendPercent}%
                  </DynamicType>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[100px]">
            <DynamicType styleLevel="caption1" className="text-white/40">
              暂无活动数据
            </DynamicType>
          </div>
        )}
      </GlassPanel>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Run build to verify**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds (or only pre-existing warnings).

- [ ] **Step 4: Commit**

```bash
git add src/features/dashboard/components/PetHeroCard.tsx
git commit -m "feat: add PetHeroCard component with health ring and activity stats"
```

---

### Task 16: Add avatar upload to PetFormPage

**Files:**
- Modify: `src/features/pets/PetFormPage.tsx`

- [ ] **Step 1: Add image upload section to PetFormPage**

Add an avatar upload section at the top of the form (after the header actions, before saveError). Insert inside the `AppleCard`:

```typescript
// Image upload section — add after the Cancel/Save buttons (after line ~79)
{/* Avatar Upload */}
<div className="flex items-center gap-4 mb-4">
  <div className="relative w-20 h-20 rounded-2xl overflow-hidden glass-light flex items-center justify-center">
    {previewUrl ? (
      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
    ) : (
      <span className="text-3xl">🐾</span>
    )}
  </div>
  <div className="flex-1">
    <DynamicType styleLevel="footnote" weight={600}>Pet Photo</DynamicType>
    <DynamicType styleLevel="caption2" className="text-apple-secondaryLabel mb-2 block">
      Upload a photo of your pet
    </DynamicType>
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={handleFileSelect}
    />
    <AppleButton variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
      {previewUrl ? 'Change Photo' : 'Upload Photo'}
    </AppleButton>
  </div>
</div>
```

Also add these state variables and refs at the top of the component (after `const [saveError, setSaveError]`):
```typescript
const [previewUrl, setPreviewUrl] = useState<string | null>(null)
const fileInputRef = useRef<HTMLInputElement>(null)

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  // Create local preview
  const url = URL.createObjectURL(file)
  setPreviewUrl(url)

  // For MVP: save to state, actual upload to public/picture/ happens on form submit
  // Store the file for later upload
  setPendingAvatarFile(file)
}
```

And update the form state:
```typescript
const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null)
```

In `handleSubmit`, after addPet/updatePet succeeds, add avatar file handling:
```typescript
// If there's a pending avatar file, copy it to public/picture/
if (pendingAvatarFile && !isEdit) {
  // For development: save avatarUrl as the filename
  // In production this goes to Supabase Storage
  const filename = `${pendingAvatarFile.name}`
  setForm(prev => ({ ...prev }))
}
```

Also import:
```typescript
import { useRef, useState, useEffect } from 'react'  // already imported, add useRef
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/pets/PetFormPage.tsx
git commit -m "feat: add avatar upload section to PetFormPage"
```

---

### Task 17: Update dashboard tests

**Files:**
- Modify: `tests/dashboard-visual.spec.ts`

- [ ] **Step 1: Add tests for new components

Add these tests to `tests/dashboard-visual.spec.ts`:

```typescript
// Add after existing TL1 tests:

// TL1: PetSelectorStrip renders
test('TL1 | PetSelectorStrip shows pets', 'PetSelectorStrip visible with pet avatars', 'Pet selector items > 0', 'TL1')

// TL1: Photo galleries render
test('TL1 | MomentSection daily gallery renders', 'Daily moments section visible with cards', 'Daily moment cards rendered', 'TL1')
test('TL1 | MomentSection interaction gallery renders', 'Interaction moments section visible with cards', 'Interaction moment cards rendered', 'TL1')
test('TL1 | GrowthTimelineSection renders', 'Growth timeline section visible with timeline cards', 'Growth timeline cards rendered', 'TL1')
test('TL1 | DataCardRow shows 4 cards', 'DataCardRow section visible with 4 glass cards', '4 data stat cards visible', 'TL1')

// TL1: Glassmorphism styling
test('TL1 | GlassPanel class present on cards', 'GlassPanel glass-light class found on cards', 'glass-light or glass class present', 'TL1')

// TL2: PetSelector interaction
test('TL2 | PetSelector click changes hero card', 'After clicking a pet in selector, hero card shows that pet name', 'Pet hero card updates with selected pet name', 'TL2')

// TL2: PhotoPreview
test('TL2 | MomentCard click opens PhotoPreview', 'After clicking a moment card, PhotoPreview overlay appears', 'PhotoPreview visible with navigation', 'TL2')
test('TL2 | PhotoPreview closes on Escape', 'After pressing Escape, PhotoPreview overlay disappears', 'PhotoPreview removed from DOM', 'TL2')

// TL2: PetSelector toggles back to All
test('TL2 | PetSelector All Pets resets view', 'After clicking All Pets, hero card hides and overview shows', 'Hero card hidden, data cards visible', 'TL2')
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npx tsx tests/dashboard-visual.spec.ts 2>&1 | tail -20`
Expected: All tests pass (or only expected failures for non-implemented features).

- [ ] **Step 3: Commit**

```bash
git add tests/dashboard-visual.spec.ts
git commit -m "test: add Dashboard redesign component tests"
```

---

### Task 18: Final type-check and build verification

**Files:** None (verification only)

- [ ] **Step 1: Full TypeScript check**

Run: `npx tsc --noEmit`
Expected: Zero errors.

- [ ] **Step 2: Full build**

Run: `npm run build 2>&1`
Expected: Build succeeds, output in `dist/`.

- [ ] **Step 3: Summary of changes**

Run: `git diff --stat main`
Expected: Shows all new and modified files.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Dashboard glassmorphism redesign with photo galleries"
```
