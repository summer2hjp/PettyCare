# 计划：融合苹果设计哲学的宠物健康平台界面

**复杂度**: 高（大型）

## 需求重述

构建一个宠物健康管理平台的前端界面，设计语言以苹果 Human Interface Guidelines 为根基，融入以下 Apple 标志性设计特征：
- **清净简约** — 充裕留白、聚焦内容、减少视觉噪点
- **玻璃质感** — `NSVisualEffectView` 风格的毛玻璃效果、半透明层、vibrancy
- **层次与深度** — 分层递进的导航、subtle 阴影层级、Z-axis 动效
- **SF 字体体系** — 动态字体、层级字号比例、`largeTitle`→`caption` 完整层级
- **语义色彩** — 源自系统调色板的有限但精准的色彩运用
- **流畅动效** — 弹簧动画、平滑转场、手势驱动交互
- **无障碍优先** — 动态字体适配、VoiceOver 标签、高对比度支持

功能范围涵盖：
1. **宠物档案** — 多宠物管理、头像、品种、年龄、体重
2. **健康仪表盘** — 体重趋势图、活动量概览、健康评分
3. **健康记录** — 疫苗接种、兽医就诊、用药记录
4. **活动追踪** — 散步、运动、睡眠
5. **喂养计划** — 定时提醒、食物记录
6. **预约日历** — 兽医预约、日程管理
7. **提醒通知** — 用药提醒、疫苗到期、复诊通知

## 总体架构决策

> **目标平台：PC Web（桌面浏览器）**
> 设计语言融入 Apple 美学，布局与交互适配桌面端。

| 决策 | 选项 | 选择理由 |
|------|------|----------|
| 框架 | **React + TypeScript** | 通用性强、生态成熟 |
| 路由 | React Router v7 | 嵌套布局、加载状态原生支持 |
| 状态管理 | React Context + useReducer | 避免过度工程化 |
| 样式方案 | Tailwind CSS + 自定义设计令牌 | 原子化样式与 Apple 设计令牌结合 |
| 图表 | Recharts / 自绘 SVG | 轻量、可定制外观 |
| 动画 | Framer Motion | 弹簧动画、布局动效 |
| 构建 | Vite | 极速 HMR、Tree-shaking |
| 图标 | Lucide + Apple-style 自定义 SVG | 清晰、语义化图标 |
| 导航 | **macOS 风格侧边栏** | 桌面应用标配，替代移动端 TabBar |

## 模式参考

由于是全新项目，无现有代码可参考。以下是 Apple 设计规范的核心模式，将作为实现基准：

| 类别 | 来源 | 模式 |
|------|------|------|
| 色彩体系 | Apple HIG - Color | 系统红/橙/黄/绿/蓝/紫语义色，低饱和度背景 |
| 字体层级 | Apple HIG - Typography | largeTitle(34) → title1(28) → title2(22) → title3(20) → headline(17) → body(17) → callout(16) → subhead(15) → footnote(13) → caption1(12) → caption2(11) |
| 毛玻璃 | SF Symbols / Vibrancy | 多层半透明叠加，背景模糊 30-60px |
| 导航 | macOS Sidebar + Toolbar | 左侧固定侧边栏 + 顶部工具栏 |
| 列表 | NSTableView / NSCollectionView | 桌面风格列表、行悬停高亮 |
| 卡片 | NSVisualEffectView | 圆角 (12px)、毛玻璃背景、hover 抬起阴影 |

## 文件结构

```
src/
├── assets/images/                       # 静态资源
├── components/
│   ├── ui/                              # 基础原子组件
│   │   ├── GlassPanel.tsx               # 毛玻璃容器
│   │   ├── AppleButton.tsx              # 系统风格按钮 (3 种样式)
│   │   ├── AppleCard.tsx                # 圆角卡片
│   │   ├── AppleSegmentedControl.tsx    # 分段控件
│   │   ├── AppleSidebar.tsx            # macOS 风格左侧导航栏
│   │   ├── AppleToolbar.tsx            # 顶部工具栏
│   │   ├── AppleList.tsx                # Inset Grouped 列表
│   │   ├── AppleSwitch.tsx              # 开关控件
│   │   ├── AppleAvatar.tsx              # 圆形头像
│   │   ├── AppleBadge.tsx               # 角标
│   │   ├── AppleProgressRing.tsx        # 活动圆环
│   │   └── DynamicType.tsx              # 动态字体组件
│   ├── pet/                             # 宠物组件
│   │   ├── PetCard.tsx
│   │   ├── PetAvatarPicker.tsx
│   │   └── PetInfoRow.tsx
│   ├── health/                          # 健康组件
│   │   ├── HealthMetricCard.tsx
│   │   ├── WeightChart.tsx
│   │   ├── VaccinationTimeline.tsx
│   │   └── ActivityRing.tsx
│   ├── reminders/                       # 提醒组件
│   │   ├── ReminderCard.tsx
│   │   └── ReminderList.tsx
│   └── common/                          # 通用组件
│       ├── EmptyState.tsx
│       ├── LoadingState.tsx
│       ├── ErrorState.tsx
│       ├── ContextMenu.tsx
│       └── Toast.tsx
├── features/                            # 功能模块 (页面)
│   ├── home/HomePage.tsx
│   ├── pets/PetListPage.tsx
│   ├── pets/PetDetailPage.tsx
│   ├── pets/PetFormPage.tsx
│   ├── health/HealthPage.tsx
│   ├── activity/ActivityPage.tsx
│   ├── feeding/FeedingPage.tsx
│   ├── appointments/AppointmentsPage.tsx
│   └── settings/SettingsPage.tsx
├── layouts/
│   ├── RootLayout.tsx                   # 根布局 (侧边栏 + 工具栏 + 主内容区)
│   └── ContentLayout.tsx                # 内容区布局 (列表/详情分栏)
├── hooks/
│   ├── useTheme.ts
│   ├── useDynamicType.ts
│   ├── useHealthData.ts
│   └── useReminders.ts
├── design-tokens/
│   ├── colors.ts                        # 色彩体系
│   ├── typography.ts                    # 字体层级
│   ├── spacing.ts                       # 8pt 网格
│   ├── shadows.ts                       # 阴影层级
│   └── animations.ts                    # 动效参数
├── types/
│   ├── pet.ts
│   ├── health.ts
│   └── reminder.ts
├── utils/
│   ├── date.ts
│   ├── format.ts
│   └── cn.ts
├── App.tsx
├── main.tsx
└── index.css
```

## 实施阶段

### 阶段 1：项目启动与设计令牌系统

**目标**: 搭建项目骨架，建立 Apple 设计风格的完整设计令牌体系

**文件**:
| 文件 | 动作 | 原因 |
|------|------|------|
| `package.json` | CREATE | 项目依赖 |
| `vite.config.ts` | CREATE | 构建配置 |
| `tsconfig.json` | CREATE | TypeScript 配置 |
| `tailwind.config.ts` | CREATE | Tailwind + 自定义设计令牌 |
| `src/index.css` | CREATE | 全局 CSS、字体引入、毛玻璃工具类 |
| `src/design-tokens/colors.ts` | CREATE | Apple 语义色彩体系 |
| `src/design-tokens/typography.ts` | CREATE | SF 字体层级 |
| `src/design-tokens/spacing.ts` | CREATE | 8pt 网格体系 |
| `src/design-tokens/shadows.ts` | CREATE | Apple 风格阴影层级 |
| `src/design-tokens/animations.ts` | CREATE | Spring 动画参数 |
| `src/utils/cn.ts` | CREATE | Tailwind class 合并工具 |

**验证**:
```bash
npm run dev  # 开发服务器正常启动
```

---

### 阶段 2：基础原子组件库

**目标**: 构建 Apple 风格的 UI 原子组件

**组件清单**:
| 组件 | Apple 设计对齐 | 状态覆盖 |
|------|---------------|----------|
| `GlassPanel` | backdrop-blur + 半透明叠加 | 默认 |
| `AppleButton` | filled / tinted / plain | 默认 / 禁用 / 加载 |
| `AppleCard` | 圆角 16px, 阴影 y=2 blur=12 | 默认 / 按下 / 禁用 |
| `AppleSidebar` | macOS 风格侧边栏，毛玻璃背景 | 选中 / 未选中 / 悬停高亮 |
| `AppleToolbar` | 顶部工具栏，搜索+操作按钮 | 常规 / 滚动折叠 |
| `AppleSegmentedControl` | 圆角胶囊形分段 | 选中 / 未选中 |
| `AppleTable` | 桌面表格列表，行悬停高亮 | 有数据 / 空 / 加载 |
| `AppleSwitch` | 绿色/灰色 弹簧动画 | 开 / 关 / 禁用 |
| `DynamicType` | 系统字体缩放的 Text | 各级字号 |
| `AppleAvatar` | 圆形裁切 + 浅阴影 | 有图 / 无图(首字母) |
| `AppleBadge` | 红色角标 | 数字 / 圆点 / 无 |
| `AppleProgressRing` | 圆形进度环 | 空 / 部分 / 完成 |
| `LoadingState` | 骨架屏 + 旋转指示器 | 加载中 |
| `EmptyState` | 插画 + 描述 + 行动按钮 | 空 |
| `ErrorState` | 错误图标 + 描述 + 重试 | 错误 |

---

### 阶段 3：宠物档案模块

**页面**:
| 页面 | 功能 | 状态覆盖 |
|------|------|----------|
| `PetListPage` | 横向宠物卡片轮播 + 添加按钮 | 加载 / 空 / 有数据 / 错误 |
| `PetDetailPage` | 宠物信息、健康概览 | 加载 / 有数据 / 错误 |
| `PetFormPage` | 创建/编辑表单 | 创建模式 / 编辑模式 / 提交中 / 验证错误 |

---

### 阶段 4：健康仪表盘

**页面**: `HomePage` — 今日概览（宠物卡片、健康评分、临近提醒、体重趋势）

**组件**: HealthScoreCard / WeightChart / ActivityRing / ReminderCard

**状态覆盖**: 加载骨架屏 / 空状态引导 / 错误重试

---

### 阶段 5-9：功能模块（可并行）

| 阶段 | 模块 | 页面 | 关键组件 |
|------|------|------|----------|
| 5 | 健康记录 | `HealthPage` | VaccinationTimeline / VisitCard / MedicationList |
| 6 | 活动追踪 | `ActivityPage` | 活动环组 / 步数距离指标 / 日周视图切换 |
| 7 | 喂养计划 | `FeedingPage` | 每日喂养时间线 / 食物标签 / 份量记录 |
| 8 | 预约日历 | `AppointmentsPage` | 月视图日历 / 预约卡片 / 新建浮层 |
| 9 | 提醒通知 | (全局组件) | ReminderList / 类型分组 / 开关控制 |

---

### 阶段 10：深色模式与无障碍

| 任务 | 说明 |
|------|------|
| 深色模式 | 所有 CSS 变量适配 `prefers-color-scheme: dark` |
| 动态字体 | 所有文本通过 `DynamicType` 使用系统缩放 |
| VoiceOver | 交互元素添加 `aria-label`、`role` |
| 高对比度 | 支持 `prefers-contrast: more` |
| 动画适减 | 支持 `prefers-reduced-motion: reduce` |

---

### 阶段 11：动效与微交互

| 动效 | 技术实现 | 触发场景 |
|------|---------|----------|
| 页面转场 | Framer Motion `AnimatePresence` fade + slide | 路由切换 |
| 列表项出现 | 交错弹簧动画 staggerChildren: 0.05 | 列表加载 |
| 侧边栏高亮 | 平滑背景色过渡 200ms | 导航项 hover/选中 |
| 按钮点击 | 弹性缩放 scale: 0.97 → 1.0 | 点击操作 |
| 卡片悬停 | y: -2, 阴影加深 | 鼠标 hover |
| Tooltip 浮现 | fade + slide-up 150ms | 图标/按钮 hover |
| 数字动画 | 计数器滚动效果 | 健康评分变化 |

## 依赖关系

```
阶段 1 (设计令牌) → 阶段 2 (组件库) → 阶段 3-4 (核心页面) → 阶段 5-9 (功能模块)
                                                    ↓
                                      阶段 10 (深色模式 + 无障碍)
                                                    ↓
                                         阶段 11 (动效打磨)
```

- 阶段 1-2 必须串行
- 阶段 3-9 可按任意顺序并行推进
- 阶段 10-11 为全局收官

## 风险与缓解

| 风险 | 可能性 | 缓解方案 |
|------|--------|----------|
| 毛玻璃在低端设备掉帧 | 中 | `@supports (backdrop-filter)` 降级为纯色半透明 |
| SF 字体 Web 许可限制 | 低 | 使用 `-apple-system` 系统字体回退栈 |
| 动态字体导致布局崩坏 | 中 | 容器使用 `min-h` + 弹性布局，避免固定高度 |
| 深色模式维护成本高 | 中 | 通过 CSS 变量驱动，而非 JS 运行时切换 |
| 动效过多导致性能问题 | 低 | `will-change` 精准标注、GPU 合成层控制 |

## 验证

```bash
npm run dev          # 开发服务器
npm run build        # 构建无报错
npm run lint         # ESLint
npm run typecheck    # TypeScript 类型检查
npx lighthouse       # 性能 + 无障碍审计
```

## 验收标准

- [ ] 所有页面和组件已实现
- [ ] 加载/空/错误/成功状态全覆盖
- [ ] 深色模式实时切换，无闪白或断裂
- [ ] 动态字体平滑缩放，无布局溢出
- [ ] 动画流畅，60fps 无卡顿
- [ ] Lighthouse Accessibility 评分 ≥ 95
- [ ] 代码整洁，遵循不可变性原则
- [ ] 无硬编码值 — 所有设计值纳入令牌系统
