# PettyCare Dashboard 测试规范

> ⚠️ 此文件已合并到项目级测试规范 [pettycare-frontend-test-spec.md](./pettycare-frontend-test-spec.md)。
> 本文件保留为 Dashboard 模块的详细测试用例参考。

基于 Test Level 分级标准，覆盖 Dashboard 标签页及其关联功能

## Test Level 定义

| Level | 定义 | 测试重点 |
|-------|------|----------|
| **TL1** | 从登录/首页直接进入的页面元素（Dashboard 标签页内所有内容） | 样式正确性（字体、色彩、布局） |
| **TL2** | 从 TL1 操作进入的新内容（弹框、表单、页面跳转） | 样式 + 功能 + 数据正确性 |
| **TL3** | 从 TL2 操作进入的新内容（更深层的弹框/编辑） | 样式 + 功能 + 数据一致性 |

---

## Test Level 1 — Dashboard 标签页

**测试关注点：** 所有元素的渲染样式正确性（字体、色彩、间距、布局）

| # | Test Path | 期望值 | 实际值 | Result |
|---|-----------|--------|--------|--------|
| 1.1 | Dashboard 标签按钮 | 标签按钮 `Dashboard` 显示在侧边栏第一位，图标为 LayoutDashboard，点击后高亮蓝色背景，页面标题显示 "Welcome back 👋" | | |
| 1.2 | 快速操作区（Quick Actions） | 5 个操作按钮水平排列：Add Pet、Log Feeding、Log Vaccination、Schedule Visit、Add Vet Visit；按钮使用 AppleCard 容器，文字使用 footnot 字重 600，支持水平滑动 | | |
| 1.3 | 快速操作按钮样式 | 每个按钮包含 emoji 图标 + 标签文字；hover 时 elevation 提升；背景色为 `bg-apple-systemBackground` | | |
| 1.4 | 健康总览 Section | 标题 "Health Overview"，副标题显示 "5 pets"（或实际宠物数），右上角 "View All" 链接（蓝色 `text-apple-blue` + ChevronRight 图标） | | |
| 1.5 | 健康评分卡片 | AppleProgressRing 进度环 + 百分比数字 + "Health Score" 标签 + 状态文字（Excellent/Good/Fair/Attention）；环颜色与状态匹配（绿色/蓝色/橙色/红色） | | |
| 1.6 | 疫苗卡片 | 注射器图标（Syringe）+ 数字 + "Vaccinations due" 标签；数字使用 title2 字重 700；若 >0 显示橙色 AppleBadge | | |
| 1.7 | 最近就诊卡片 | 听诊器图标（Stethoscope）+ 日期 + 兽医名 + "Last visit" 标签；布局居中 | | |
| 1.8 | 用药卡片 | 药丸图标（Pill）+ 数字 + "Active medications" 标签 | | |
| 1.9 | 活动摘要 Section | 标题 "Activity"，右上角 "View All"；4 个统计卡片水平排列：steps、distance、duration、calories | | |
| 1.10 | 统计卡片样式 | 每个卡片包含圆角图标容器（蓝色/绿色/橙色/红色 10% opacity）+ 标签 + 数值 + 单位；值使用 title3 字重 700 | | |
| 1.11 | 周趋势卡片 | TrendingUp（绿色）/ TrendingDown（红色）图标 + "Weekly trend" 标签 + 百分比变化值 | | |
| 1.12 | 喂养计划 Section | 标题 "Feeding Schedule"，右上角 "View All" | | |
| 1.13 | 喂养卡片状态 | 已完成餐食：绿色对勾 + "Completed"；下一餐：蓝色边框（`ring-2 ring-apple-blue`）+ "Next meal" + 倒计时；待处理：灰色半透明 | | |
| 1.14 | 即将到来事件 Section | 标题 "Upcoming Events"，右上角 "View All" | | |
| 1.15 | 事件卡片紧急度标签 | "Tomorrow"（蓝色背景）、"In 3 days"（橙色）、"Next week"（绿色）、"Later"（灰色）；标签使用 11px 字重 600 | | |
| 1.16 | 最近动态 Section | 标题 "Recent Activity"，无 "View All" | | |
| 1.17 | 动态卡片样式 | 左侧彩色圆形图标容器（按类型区分颜色：blue/amber/green/purple/rose）+ 描述 + 详情 + 相对时间 | | |
| 1.18 | 数据洞察 Section | 标题 "Insights"，无 "View All" | | |
| 1.19 | 洞察卡片类型 | Trend（趋势/柱状图）、Tip（提示）、Comparison（对比）；卡片标题 + 描述文字 | | |
| 1.20 | 水平滚动行为 | 每个 Section 内容区支持 `snap-x snap-mandatory` 水平滑动，滚动条隐藏（`scrollbar-none`），卡片间隙 12px | | |
| 1.21 | "View All" 导航按钮 | 4 个 Section 有 "View All"（Health/Activity/Feeding/Events），使用 `text-apple-blue` + ChevronRight 图标 | | |
| 1.22 | 卡片 hover 效果 | 所有 hoverable 卡片 hover 时 elevation 提升（`transition-all duration-300`） | | |
| 1.23 | 深色模式适配 | CSS 变量加载正常（`--apple-systemBackground`, `--apple-label`, `--apple-blue`），卡片使用语义色 `text-apple-secondaryLabel` 等 | | |
| 1.24 | 8pt 网格合规 | 卡片高度使用 `h-[36px]` 等固定像素值（避免 spacing 级联影响）；间距使用 gap-3（24px）、p-4（32px）等 | | |

---

## Test Level 2 — 从 Dashboard 进入的交互

**测试关注点：** 操作的正确性 + 数据联动

| # | Test Path | 期望值 | 实际值 | Result |
|---|-----------|--------|--------|--------|
| 2.1 | Dashboard → 点击 Add Pet | 跳转到宠物表单页；侧边栏 **Pets** 高亮选中；表单包含 Name/Breed/Species/Gender/Date of Birth/Weight/Unit/Color/Microchip ID/Notes 等字段；标题 "Test Level 2: Add Pet" | | |
| 2.2 | 表单字段填充 | Name 输入框 placeholder "Pet's name"；Breed 输入框 placeholder "e.g. Golden Retriever"；Date of Birth 为 date 类型；Weight 为 number 类型 step 0.1 | | |
| 2.3 | 表单验证 | Name 为空时提交 → 显示 "Required" 错误提示；Breed 为空时提交 → 显示 "Required"；Date of Birth 为空 → 显示 "Required"；Weight ≤ 0 → "Must be positive" | | |
| 2.4 | 表单提交 — 成功 | 填写有效数据 → 点击 Save → 页面跳转到宠物列表页 → 新宠物出现在列表 | | |
| 2.5 | 提交后 Dashboard 数据更新 | 返回 Dashboard → Health Overview 宠物数量 +1；新宠物数据在相关 Section 中体现 | | |
| 2.6 | 表单取消 | 点击 Cancel → 返回上一页（宠物列表或 Dashboard），数据不变 | | |
| 2.7 | Dashboard → 点击 Log Feeding | 跳转到 Feeding 页面；侧边栏 **Feeding** 高亮选中；页面显示 "Today's Schedule" + 喂养时间线 | | |
| 2.8 | Dashboard → 点击 Log Vaccination | 跳转到 Health 页面；侧边栏 **Health** 高亮选中；默认显示 Vaccinations 标签 | | |
| 2.9 | Dashboard → 点击 Schedule Visit | 跳转到 Appointments 页面；侧边栏 **Appointments** 高亮选中；显示月历视图 | | |
| 2.10 | Dashboard → 点击 Add Vet Visit | 跳转到 Health 页面；侧边栏 **Health** 高亮选中 | | |
| 2.11 | Dashboard → View All (Health) | 跳转到 Health 页面；侧边栏 **Health** 高亮选中 | | |
| 2.12 | Dashboard → View All (Activity) | 跳转到 Activity 页面；侧边栏 **Activity** 高亮选中 | | |
| 2.13 | Dashboard → View All (Feeding) | 跳转到 Feeding 页面；侧边栏 **Feeding** 高亮选中 | | |
| 2.14 | Dashboard → View All (Events) | 跳转到 Appointments 页面；侧边栏 **Appointments** 高亮选中 | | |

---

## Test Level 3 — 从 TL2 进入的更深层交互

| # | Test Path | 期望值 | 实际值 | Result |
|---|-----------|--------|--------|--------|
| 3.1 | Dashboard → Add Pet → Save → Pets 列表 → 点击新宠物 → Pet Profile | 新宠物详情页加载正确：名称、品种、性别、出生日期、体重等信息与填写一致 | | |
| 3.2 | Pet Profile → 点击 Edit → 编辑弹框 | 编辑表单预填了已保存的数据；修改名称 → Save → 名称更新成功；返回 Pets 列表 → 名称已更新 | | |
| 3.3 | Pets → 宠物详情 → Health Tab | 显示该宠物的疫苗接种记录、就诊记录、用药记录 | | |
| 3.4 | Pets → 宠物详情 → Edit → 删除宠物 | 删除操作确认后 → 宠物从列表移除 → Dashboard 宠物数量相应减少 | | |
| 3.5 | Health → 添加就诊记录 → 返回 Dashboard | Dashboard 健康总览中 "Last visit" 信息更新为最新就诊记录 | | |
| 3.6 | Feeding → 记录喂食 → 返回 Dashboard | Dashboard 喂养计划 Section 中显示对应的喂食记录 | | |

---

## Test Level 4 — 跨页面数据一致性

| # | Test Path | 期望值 | 实际值 | Result |
|---|-----------|--------|--------|--------|
| 4.1 | 多页面数据一致性 | 宠物名称在 Dashboard（健康/喂养/事件/动态）/Pets 列表/Pet Profile 中保持一致 | | |
| 4.2 | 健康数据一致性 | Health Page 中的疫苗接种状态同步到 Dashboard 的 "Vaccinations due" 和 "Upcoming Events" | | |
| 4.3 | 预约数据一致性 | Appointments Page 中的预约同步到 Dashboard 的 "Upcoming Events" 和 "Recent Activity" | | |
| 4.4 | Activity 数据一致性 | Activity Page 中的活动数据同步到 Dashboard 的 Activity Summary 和 Insights | | |
| 4.5 | 宠物数量一致性 | 所有涉及宠物计数的位置（Dashboard 副标题、Pets 列表计数等）显示相同的数量 | | |

---

## 自动化测试映射

| Test Level | 自动化测试文件 | 覆盖范围 |
|-----------|---------------|----------|
| TL1 | `tests/dashboard-visual.spec.ts` (Tests 1-12) | 页面加载、所有 Section 渲染、滚动容器、深色模式 CSS |
| TL2 | `tests/dashboard-visual.spec.ts` (Tests 13-17, 20-22) | 导航跳转、表单字段、数据提交、数据联动 |
| TL3 | 待扩展 | 更深层编辑/删除、数据回溯验证 |
| TL4 | `tests/dashboard-visual.spec.ts` (Tests 18-19, 22) | 跨 Section 宠物名称一致性、数据联动 |

---

## 执行指南

```
运行 TL1 测试: npx tsx tests/dashboard-visual.spec.ts
预期结果: 39/39 passed (当前覆盖 TL1 + TL2 部分 + TL4 部分)
```

### 新增测试开发规范

1. 每个测试用例须标注 `Test Level` 标签（用注释 `// TL1`、`// TL2` 等）
2. TL1 测试只断言样式/渲染，不修改状态
3. TL2+ 测试须包含 Arrange → Act → Assert 模式：
   - **Arrange**: 导航到起始页面
   - **Act**: 执行操作（点击、填写、提交）
   - **Assert**: 验证结果（新内容样式 + 数据正确性 + 关联组件状态）
4. 每个 TL2+ 测试用例须在操作前后验证数据一致性
