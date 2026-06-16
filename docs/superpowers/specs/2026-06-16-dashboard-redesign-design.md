# Dashboard Redesign — Pet-Centric Gallery Dashboard

**Date**: 2026-06-16
**Status**: Draft
**Author**: Claude Code

## Overview

Refactor the Dashboard tab from a data-category grid to a pet-centric gallery layout. The new design centers on pet photos organized into three thematic galleries — daily life, interaction moments, and growth trajectory — while retaining key health/activity/feeding data in more compact cards.

## Scope

- New `pet_moments` database table (migration 005)
- New Dashboard components: PetSelectorStrip, PetHeroCard, MomentSection, MomentCard, GrowthTimelineSection, DataCardRow, PhotoPreview
- New hooks: `usePetMoments`
- Image upload support on PetFormPage (avatar upload + pet_moments upload)
- Seed data for demo photos
- Wire up `public/picture/` images for initial display
- Dashboard test file update

**Out of scope**: Photo editing, tagging system, social sharing, multi-user permissions.

## Database Layer

### New Table: `pet_moments`

```sql
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
```

### RLS Policy

```sql
ALTER TABLE pet_moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their household's pet moments" ON pet_moments
  FOR ALL USING (
    pet_id IN (
      SELECT id FROM pets WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
      )
    )
  );
```

## Component Architecture

```
DashboardPage
├── PetSelectorStrip            ← 新: horizontal scrollable pet avatars
├── PetHeroCard                 ← 新: 3-up card for active pet
├── DashboardSection
│   ├── MomentSection(daily)    ← 新: 1:1 square card gallery
│   ├── MomentSection(interaction) ← 新: 4:3 landscape card gallery
│   ├── GrowthTimelineSection   ← 新: timeline cards with arrow connectors
│   └── DataCardRow             ← 新: compact 4-col data cards
└── QuickActionsSection         ← 保留
```

### 1. PetSelectorStrip

**File**: `src/features/dashboard/components/PetSelectorStrip.tsx`

Props: `pets: Pet[]`, `activePetId: string | null`, `onSelect: (id: string | null) => void`

- First option is always "All Pets" (id = null)
- Each pet shown as vertical stack: AppleAvatar + name + weight
- Active item: `ring-2 ring-apple-blue` + `scale-105` + bold name
- Horizontal overflow with snap scrolling
- Smooth scroll-to-active on mount (useRef + scrollIntoView)

States:
- **Loading**: Skeleton circles in a row
- **Empty**: Hidden (if no pets, show nothing)
- **Single pet**: No "All Pets" option shown

### 2. PetHeroCard

**File**: `src/features/dashboard/components/PetHeroCard.tsx`

Props: `pet: Pet`, `health: DashboardHealthData | null`, `activity: DashboardActivityData | null`, `loading: boolean`

Three-column layout:
1. **Pet Profile Card** — Large pet photo (GlassPanel overlay with name/species/age/weight), fallback to AppleAvatar initals if no avatar
2. **Health Score Card** — AppleProgressRing with percentage + "Excellent/Good/Fair/Attention" label + vaccination count
3. **Activity Card** — Steps/Distance/Duration/Calories with trend arrow

States:
- **Loading**: Three skeleton cards
- **No data**: Show graceful fallback with dashes
- **All Pets mode**: Horizontal scroll of all pets' hero cards

### 3. MomentSection

**File**: `src/features/dashboard/components/MomentSection.tsx`

Reuses `DashboardSection` wrapper. Props: `title`, `moments`, `momentType`, `loading`, `error`, `onViewAll`, `onMomentClick`

- Horizontal scroll container with `scroll-snap-x`
- Each `MomentCard` inside, type-specific sizing (daily=1:1, interaction=4:3)
- Right-arrow scroll hint when there are more cards
- Caption displayed at card bottom (overlaid on image with dark gradient for interaction type)

States:
- **Loading**: 4 skeleton cards matching their type aspect ratio
- **Empty**: Centered camera icon + "还没有 {theme} 记录" + action button to upload
- **Error**: Error card with retry

### 4. MomentCard

**File**: `src/features/dashboard/components/MomentCard.tsx`

Props: `moment: PetMoment`, `type: 'daily' | 'interaction' | 'growth'`, `onClick: () => void`

- `object-fit: cover` on image
- Aspect ratio variants (see card styles above)
- Hover: `scale(1.02)` + `shadow-apple-lg` + `-translate-y-0.5`
- Image error fallback: gradient placeholder with paw emoji
- Caption text with `text-shadow` for readability on light images
- Staggered entry animation on mount

### 5. GrowthTimelineSection

**File**: `src/features/dashboard/components/GrowthTimelineSection.tsx`

Props: `moments: PetMoment[]`, `loading`, `error`, `onMomentClick`

- Horizontal timeline with arrow connectors (`→`) between cards
- Cards sorted by `taken_at` ascending
- Each card shows image + date label
- First card labeled "🐣 {date}" (earliest), last card labeled "现在" if most recent
- Small dots timeline below cards

States:
- **Loading**: 3 skeleton timeline cards
- **Empty**: "还没有成长记录，每月拍一张对比照吧"
- **Single item**: No arrows, just the card

### 6. DataCardRow

**File**: `src/features/dashboard/components/DataCardRow.tsx`

Props: `health`, `feeding`, `events`, `insights`, `loading`

Four compact cards in a `grid grid-cols-4 gap-3`:
1. **HealthSummaryCard** — Score + upcoming vaccinations count + last visit
2. **FeedingSummaryCard** — Today's meals count + next meal time
3. **EventsSummaryCard** — Upcoming events count + nearest event info
4. **InsightsCard** — Latest insight tip

Each card:
- Dynamic icon + 2-3 key metrics
- `AppleCard padding="sm"` — compact, no horizontal scroll
- Labels in `caption2` (11px), values in `body` (15px) weight 600
- Clickable: navigate to respective page

States:
- **Loading**: 4 small skeleton cards
- **Empty for a section**: Grayed out with "No data"
- **Error**: Affected card shows error state, others unaffected

### 7. PhotoPreview

**File**: `src/features/dashboard/components/PhotoPreview.tsx`

Props: `moments: PetMoment[]`, `initialIndex: number`, `onClose: () => void`

- Full-screen modal overlay with `backdrop-blur-xl` dark background
- Central large image display
- Left/right navigation arrows (on image edges)
- Keyboard support: Escape=close, ArrowLeft/Right=navigate
- Bottom caption bar: caption text + date + pet name + moment type label
- Bottom thumbnail strip: scrollable preview of all photos in the same moment type, current highlighted
- Enter/exit animations: scale + opacity (250ms in, 200ms out)

States:
- **Image loading**: Centered skeleton pulse in image area
- **Image error**: "图片加载失败" with retry button
- **Edge navigation**: At first image, left arrow hidden; at last, right arrow hidden
- **No images**: Not rendered (caller checks length)

### Component Hierarchy

```
DashboardPage
├── PetSelectorStrip (new)
│   └── AppleAvatar[]
├── PetHeroCard (new)
│   ├── GlassPanel (pet photo + info)
│   ├── AppleProgressRing (health score)
│   └── Activity stat display
├── DashboardSection
│   ├── MomentSection 'daily' (new)
│   │   └── MomentCard[] (1:1)
│   ├── MomentSection 'interaction' (new)
│   │   └── MomentCard[] (4:3)
│   ├── GrowthTimelineSection (new)
│   │   └── MomentCard[] (timeline)
│   └── DataCardRow (new)
│       └── AppleCard[] (4 compact cards)
├── QuickActionsSection (existing, kept)
└── PhotoPreview (new, full-screen modal)
```

## Data Flow

### New Hook: `usePetMoments`

```typescript
// src/features/dashboard/hooks/usePetMoments.ts

interface UsePetMomentsOptions {
  petId: string | null     // null = all pets
  type: 'daily' | 'interaction' | 'growth'
  limit?: number           // default 20
}

interface UsePetMomentsResult {
  moments: PetMoment[]
  loading: boolean
  error: string | null
  refresh: () => void
}
```

### Hook: `useDashboardData` (updated)

- Remove `timeline` and `insights` (they were empty stubs) — replaced by moment data
- Add `selectedPetId` awareness (currently queries all pets; when a specific pet is selected, scope queries)
- Keep `health`, `activity`, `feeding`, `events` as-is

## Card Styles

| Component | Border Radius | Shadow | Background | Hover |
|-----------|--------------|--------|------------|-------|
| PetSelector item | `rounded-apple-xl` | none | `--apple-fill` | active blue ring |
| PetHeroCard pet photo | `rounded-apple-xl` | `shadow-apple-md` | `GlassPanel` overlay | none |
| PetHeroCard stat card | `rounded-apple-xl` | `shadow-apple-md` | `--apple-systemBackground` | none |
| MomentCard (daily) | `rounded-apple` | `shadow-apple-sm` | transparent | scale+shadow |
| MomentCard (interaction) | `rounded-apple-xl` | `shadow-apple-md` | transparent | scale+shadow |
| GrowthCard | `rounded-apple` | `shadow-apple-md` | `--apple-systemBackground` | scale+shadow |
| DataCardRow card | `rounded-apple-lg` | `shadow-apple-sm` | `--apple-systemBackground` | cursor-pointer |
| PhotoPreview backdrop | n/a | n/a | `rgba(0,0,0,0.6)` blurred | n/a |

## Image Handling

### srcStore
- **Local images**: `public/picture/{pet-name}-{index}.jpeg` (e.g. `larry-1.jpeg`, `larry-2.jpeg`)
- **Registration**: After upload, save path to `pet_moments.image_url` as `/picture/{filename}`
- **External**: `picsum.photos/seed/{pet-name}-{type}/{width}/{height}` for seed/demo data

### Fallback Chain
1. Try `image_url` from DB
2. Try `Pet.avatarUrl`
3. Try `public/picture/{pet-name}-*.jpeg` (local)
4. Fallback to initials/emoji in `AppleAvatar`

## Interaction Details

### Scroll & Entry Animations
- **Scroll-snap**: Each MomentSection uses `scroll-snap-type: x mandatory`, cards use `scroll-snap-align: start`
- **Staggered entry**: Cards fade in + slide up on mount (`transition-delay: ${index * 60}ms`)
- **Smooth scroll**: `scroll-behavior: smooth` on all scrollable containers

### Photo Preview (PhotoPreview)
- Click MomentCard → open fullscreen PhotoPreview at that image's index
- Navigate via arrow buttons, keyboard, or thumbnail strip
- At image edges, navigation button hides (not disables)

## State Matrix

| Component | Loading | Empty | Error | Data |
|-----------|---------|-------|-------|------|
| PetSelectorStrip | Skeleton circles | Hidden | Hidden | Pet avatars row |
| PetHeroCard | 3 skeleton cards | Fallback dashes | Error toast | 3-column layout |
| MomentSection (daily) | 4 skeleton squares | Camera icon + msg | Retry card | 1:1 cards scroll |
| MomentSection (interaction) | 4 skeleton rects | Camera icon + msg | Retry card | 4:3 cards scroll |
| GrowthTimeline | 3 skeleton cards | Empty msg | Retry card | Timeline arrows |
| DataCardRow | 4 skeleton cards | Gray "No data" | Per-card error | Compact stats |
| PhotoPreview | Pulse skeleton | (not rendered) | Retry | Full image |

## Seed Data

Insert 3-4 moments per pet per type into `pet_moments`:

```
Luna (cat):
  daily: "窗边晒太阳 🌤️", "追逐蝴蝶 🦋", "纸箱里打盹 📦"
  interaction: "梳毛时光 🐱", "逗猫棒大战 🪄"
  growth: "小猫到家 → 6个月 → 现在"

Max (dog):
  daily: "公园狂奔 🐕", "叼着球回来 🎾", "雨中散步 🌧️"
  interaction: "飞盘接球 🥏", "早晨拥抱 🤗"
  growth: "幼犬期 → 1岁 → 现在"

Coco (poodle):
  daily: "美容后自恋 💇", "小步快跑 🏃", "玩具收藏 🧸"
  interaction: "教新把戏 🎪", "沙发依偎 🛋️"
  growth: "到家第一天 → 现在"

Bella (cat):
  daily: "爬架最高处 🐈", "偷看窗外 👀", "午睡三小时 💤"
  interaction: "摸摸肚肚 🤲", "激光点追踪 🔴"
  growth: "领养时 → 半年后 → 现在"

Charlie (hamster):
  daily: "跑轮时间 ⚡", "藏食物 🥜", "钻木屑 🪵"
  interaction: "手心喂食 🖐️", "探险时间 🧭"
  growth: "刚到家 → 两个月后 → 现在"
```

Captions are stored in `pet_moments.caption`, images point to `picsum.photos/seed/{slug}/{width}/{height}` for demo.

## PetFormPage Update

Add avatar upload section:
1. At the top of the form, show current avatar (or placeholder)
2. "Upload Photo" button opens file picker (accept="image/*")
3. After upload: preview locally, save path to `Pet.avatarUrl`
4. For MVP: save to `public/picture/` directory; long-term: Supabase Storage `avatars` bucket

## Test Plan

### Dashboard Tests Update (`tests/dashboard-visual.spec.ts`)

| Level | Test | Assertions |
|-------|------|------------|
| TL1 | PetSelectorStrip renders with correct pet count | 5 avatars visible |
| TL1 | PetHeroCard shows active pet info | Name, weight displayed |
| TL1 | MomentSection cards render | Card count > 0 per type |
| TL1 | GrowthTimeline cards in date order | First < last date |
| TL1 | DataCardRow 4 cards visible | 4 AppleCard elements |
| TL1 | PhotoPreview opens on click | Overlay appears |
| TL1 | PhotoPreview navigation works | Image changes on click |
| TL2 | PetSelector switch updates PetHeroCard | Name changes |
| TL2 | PetSelector switch updates galleries | Cards re-render |
| TL2 | PhotoPreview arrow navigation | Next/prev image shows |
| TL2 | PhotoPreview keyboard navigation | ArrowLeft/Right works |
| TL2 | PhotoPreview closes on Escape | Overlay disappears |
| TL4 | Active pet ID consistent across all sections | Same pet data shown |

## Migration Plan

Phase 1 (DB & Seed):
1. Create migration 005: `pet_moments` table + RLS + indexes
2. Add seed data for demo moments
3. Create TypeScript `PetMoment` type

Phase 2 (Components):
4. Implement `usePetMoments` hook
5. Build `PetSelectorStrip`, `PetHeroCard`, `MomentCard`, `MomentSection`
6. Build `GrowthTimelineSection`, `DataCardRow`
7. Build `PhotoPreview` modal
8. Rewrite `DashboardPage` composition

Phase 3 (Integration):
9. Wire up `public/picture/` image paths
10. Add avatar upload to `PetFormPage`
11. Update dashboard test file
12. Verify existing tests still pass

## Design Principles Applied

- **Pet-first**: Photos drive the layout, not data categories
- **Apple HIG**: SF-aligned typography, 8pt spacing, frosted glass, semantic colors
- **Progressive disclosure**: Photos above data, smooth transitions
- **Consistent state coverage**: loading/empty/error/data for every component
- **Type-specific imagery**: Each pet species gets a unique visual treatment
- **Responsive scroll**: Horizontal galleries on desktop, full-width on mobile
