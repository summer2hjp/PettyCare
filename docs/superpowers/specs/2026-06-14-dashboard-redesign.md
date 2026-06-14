# Dashboard 重构设计文档

## 概述

对 PettyCare 的 Dashboard 标签页进行重构，聚焦用户体验提升。将现有的内联在 `App.tsx` 中的 Dashboard 代码提取为独立的 Feature 模块，采用 Apple HIG 风格的水平分节滚动布局，打通各 Feature 数据。

## 现状与问题

| 项目 | 现状 | 问题 |
|------|------|------|
| 位置 | 内联在 `App.tsx` 第 86-177 行 | App.tsx 达 223 行，Dashboard 部分难以维护 |
| 数据 | 独立的 `petData` 数组 | 未使用 PetContext 中的真实数据 |
| 个性化 | 静态标题 "Welcome back 👋" | 无宠物名称、无个性化内容 |
| 数据整合 | 各 Feature 数据各自封闭 | Dashboard 未引用 Health/Activity/Feeding 等数据 |
| 布局 | 简单网格排版 | 卡片无滚动效果，视觉层级单一 |
| 状态处理 | 占位性 EmptyState/ErrorState | 无实际状态覆盖，无骨架屏 |

## 架构方案

采用 **完整 Feature 模块**（方案 B），在快速交付和架构健康之间取得平衡。

### 文件结构

```
src/features/dashboard/
├── DashboardPage.tsx               # 主页面，编排所有 Section
├── components/
│   ├── DashboardSection.tsx         # 可复用水平滚动 Section 容器
│   ├── SectionHeader.tsx            # Section 标题 + "查看全部"
│   ├── ScrollIndicator.tsx         # 滚动位置指示器
│   ├── HealthSummarySection.tsx     # 健康总览
│   ├── ActivitySummarySection.tsx   # 活动摘要
│   ├── FeedingScheduleSection.tsx   # 喂养计划
│   ├── UpcomingEventsSection.tsx    # 即将到来事件
│   ├── RecentActivitySection.tsx    # 最近动态
│   ├── InsightsSection.tsx          # 数据洞察
│   └── QuickActionsSection.tsx      # 快速操作
├── hooks/
│   └── useDashboardData.ts          # 数据聚合 Hook
└── types/
    └── dashboard.ts                 # Dashboard 专属类型
```

### App.tsx 变更

- 将 `dashboard` 分支（第 86-177 行）替换为 `<DashboardPage />`
- 移除内联的 demo 数据（petData, petColumns, dashboardSegment, switchOn 状态）
- 移除不再需要的 import：GlassPanel, AppleCard, AppleSwitch, AppleBadge, AppleProgressRing, AppleTable, EmptyState, ErrorState, ContextMenu 以及部分图标
- `pageTitle` 中 dashboard 分支保持 "Welcome back 👋"

## 核心组件设计

### DashboardSection（可复用容器）

统一所有 Section 的外观和行为：

```typescript
interface DashboardSectionProps {
  title: string
  subtitle?: string            // 副标题
  action?: { label: string; onClick: () => void }  // "查看全部"
  loading?: boolean
  error?: string | null
  empty?: boolean
  emptyMessage?: string
  onRetry?: () => void
  children: ReactNode
}
```

状态渲染逻辑：
- **loading** → 渲染骨架屏卡片（`<SkeletonCard />`），3 张占位卡片
- **error** → 渲染错误提示 + 重试按钮
- **empty** → 渲染友好空状态提示
- **data** → children 内容，带水平滚动容器

### SectionHeader

```
┌──────────────────────────────────────┐
│ Section 标题             查看全部 →  │
└──────────────────────────────────────┘
```

每个 Section 的 "查看全部" 导航目标：

| Section | "查看全部" 导航到 |
|---------|------------------|
| 健康总览 | `{ page: 'health' }` |
| 活动摘要 | `{ page: 'activity' }` |
| 喂养计划 | `{ page: 'feeding' }` |
| 即将到来事件 | `{ page: 'appointments' }` |
| 最近动态 | 无导航（仅当前页面展示全部） |
| 数据洞察 | `{ page: 'health' }`（详细趋势页） |
| 快速操作 | 无导航（直接触发内联操作） |

### ScrollIndicator

水平滚动位置的圆点指示器，位于每个 Section 右下角。

## 7 个 Section 设计

### ① 健康总览 — HealthSummarySection

| 卡片 | 内容 | 数据类型 |
|------|------|----------|
| 健康评分 | AppleProgressRing + 百分比 + "Excellent" | 综合计算 |
| 即将接种疫苗 | 图标 + 计数 + "Upcoming this month" | 从 perPetVaccinations 聚合 |
| 最近就诊 | 日期 + 兽医师 | 从 perPetVisits 取最近一条 |
| 进行中用药 | 计数 + 药名 | 从 perPetMedications 统计 |

### ② 活动摘要 — ActivitySummarySection

4 个统计卡片，每张显示今日数据 + 趋势箭头：

| 卡片 | 图标背景色 | 数据来源 |
|------|-----------|----------|
| 步数 | 蓝色 | mockActivity().steps |
| 距离 | 绿色 | mockActivity().distance |
| 时长 | 橙色 | mockActivity().duration |
| 卡路里 | 红色 | mockActivity().calories |

### ③ 喂养计划 — FeedingScheduleSection

喂养时间线卡片，水平排列：

- **已完成** → 灰显，对勾标记
- **下一餐** → 蓝色高亮边框，显示倒计时（"还有 3 小时"）
- **未记录** → 灰色提示

数据来源：`schedules[petId]` + `mockFeedingRecords(petId)`

### ④ 即将到来事件 — UpcomingEventsSection

事件卡片，带时间标签：

| 标签颜色 | 时间范围 | 内容 |
|----------|----------|------|
| 蓝色 | 明天 | 兽医预约 |
| 橙色 | 3 天内 | 过期疫苗提醒 |
| 绿色 | 下周 | 常规复诊 |
| 灰色 | 更远 | 计划性事件 |

数据来源：从 `perPetVaccinations`（status=upcoming）+ Appointments mock 合并

### ⑤ 最近动态 — RecentActivitySection

全宠物的操作时间线卡片，每张包含：
- 左侧：彩色圆形 emoji 图标（按事件类型区分颜色）
- 右侧：动作描述 + 相对时间
- 按时间倒序排列

事件类型及图标色：
| 类型 | emoji | 背景色 |
|------|-------|--------|
| 疫苗接种 | 💉 | blue-100 |
| 喂食 | 🍽 | amber-100 |
| 活动 | 🐾 | green-100 |
| 预约 | 📅 | purple-100 |
| 就诊 | 🏥 | rose-100 |

### ⑥ 数据洞察 — InsightsSection

3 种卡片交替展示：

1. **趋势卡片** — Mini 柱状图（如体重/活动度趋势）
2. **健康提示卡片** — 文字提示（如"Coco 本周活动量减少 30%"，建议增加散步）
3. **对比卡片** — 跨宠物数据对比（如步数对比）

### ⑦ 快速操作 — QuickActionsSection

5 个操作按钮水平排列，点击跳转到对应页面或表单：

| 操作 | 跳转目标 |
|------|----------|
| 添加宠物 | `{ page: 'pet-form' }` |
| 记录喂食 | `{ page: 'feeding' }` |
| 记录疫苗 | `{ page: 'health' }` |
| 安排预约 | `{ page: 'appointments' }` |
| 添加就诊 | `{ page: 'health' }` |

## 数据流

### useDashboardData Hook

```
                    ┌─────────────────┐
                    │  usePets()      │── pets[]
                    └────────┬────────┘
                             │
┌──────────────────────────────────────────────┐
│             useDashboardData()              │
│                                              │
│  health:   combine vaccinations + visits    │
│  activity: call mockActivity(petId)         │
│  feeding:  call schedules + mockFeeding     │
│  events:   merge vaccines + appointments    │
│  timeline: compose from all sources         │
│  insights: compute trends & tips            │
│  actions:  static action items              │
└──────────────────────────────────────────────┘
                             │
     ┌─────────┬─────────┬──┴──┬─────────┬────┐
     ↓         ↓         ↓     ↓         ↓    ↓
  Health   Activity  Feeding Events  Timeline  Insights
```

### 数据加载策略

- **loading** 状态：`useDashboardData` 使用 `Promise.resolve().then(...)` 模拟微任务延迟，确保组件挂载后有一次渲染帧来展示骨架屏
- **error** 状态：通过 try/catch 包裹聚合逻辑，捕获并设置 `error: string`，每个 Section 独立捕获
- **empty** 状态：每个数据字段独立检查空数组/null/undefined，通过 `empty` prop 传递给 `DashboardSection`
- **数据隔离**：各 Section 的数据互相独立，一个 Section 的 loading/error 不影响其他 Section 的渲染
- **加载粒度**：整个 `useDashboardData` 一次加载完成所有数据。如果后续引入后端 API，可拆分为按需或懒加载

## 状态覆盖

### loading 状态

每个 `DashboardSection` 独立渲染 3 张骨架屏卡片：

```
┌──────────┐ ┌──────────┐ ┌──────────┐
│ ░░░░░░░░ │ │ ░░░░░░░░ │ │ ░░░░░░░░ │
│ ░░░░░░░░ │ │ ░░░░░░░░ │ │ ░░░░░░░░ │
│ ░░░░░░░░ │ │ ░░░░░░░░ │ │ ░░░░░░░░ │
└──────────┘ └──────────┘ └──────────┘
```

使用 Tailwind 的 `animate-pulse` + 圆角占位块。

### empty 状态

每个 Section 在无数据时显示友好的空状态提示：

> 📭 还没有健康记录，快去添加吧！
> 📭 今天还没有活动记录，带宠物出去散步吧！

### error 状态

Section 级别的错误提示，仅影响出错的部分：

```
┌─────────────────────────┐
│ ⚠️ 数据加载失败          │
│ 无法获取健康数据，请重试  │
│ [重试]                   │
└─────────────────────────┘
```

## 测试策略

| 类型 | 覆盖范围 |
|------|----------|
| 单元测试 | useDashboardData hook（mock 数据源，验证聚合逻辑） |
| 组件测试 | DashboardSection（loading/empty/error/data 四种状态渲染） |
| 组件测试 | 每个 Section 组件独立渲染测试 |
| 集成测试 | DashboardPage 整体渲染测试 |

## 实现顺序

1. 创建类型定义 `types/dashboard.ts`
2. 实现 `DashboardSection` + `SectionHeader` + `ScrollIndicator`
3. 实现 `useDashboardData` hook
4. 按依赖无关性顺序实现各 Section 组件（QuickActions → HealthSummary → ActivitySummary → FeedingSchedule → UpcomingEvents → RecentActivity → Insights）
5. 实现 `DashboardPage` 组装所有 Section
6. 修改 `App.tsx` — 内联代码 → `<DashboardPage />`，清理无用 imports/state
7. 验证构建通过（`npm run build`）

## 样式约定

- 使用 `h-[36px]` 固定像素值控制卡片高度（避免 8pt 网格级联影响）
- 卡片使用 `rounded-apple`（10px）圆角
- 水平滚动使用 `overflow-x-auto` + `snap-x snap-mandatory` + `scrollbar-none`
- 深色模式：所有卡片自动适配，使用 `text-apple-label` 等语义色
- 动画：Framer Motion 弹簧动画控制卡片入场 + 滚动位置切换
