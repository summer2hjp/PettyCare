# PettyCare 前端开发经验总结

## 项目概述

PettyCare 是一个融合 Apple 设计哲学的宠物健康管理平台前端界面。基于 React + TypeScript + Tailwind CSS 构建，覆盖宠物档案、健康记录、活动追踪、喂养计划、预约日历等完整功能模块。

## 技术选型

| 决策 | 选择 | 理由 |
|------|------|------|
| 框架 | React 19 + TypeScript | 生态成熟、类型安全 |
| 构建 | Vite 6 | 极速 HMR、Tree-shaking |
| 样式 | Tailwind CSS 3.4 | 原子化样式、设计令牌集成 |
| 动画 | Framer Motion 11 | 弹簧动画、布局动效 |
| 状态管理 | React Context + useState | 避免过度工程化 |
| 图标 | Lucide React | 轻量、Tree-shakable |

## 设计系统

### Apple HIG 色彩体系

在 `tailwind.config.ts` 中通过 `extend.theme.colors.apple` 注入 Apple 语义色。

**经验**：使用 CSS 变量驱动暗色模式比 Tailwind `dark:` 前缀更可靠。但由于 Tailwind JIT 编译静态值，需要额外添加 `.dark .text-apple-label { color: #FFFFFF }` 覆盖层。

### 8pt 网格系统

**关键教训**：覆写 Tailwind 默认间距比例会级联影响所有尺寸类（如 `h-10` 从 40px 变为 80px）。推荐使用固定像素值 `h-[36px]` 避免自定义间距的级联影响。

### 毛玻璃效果

```css
.glass { background: rgba(255,255,255,0.72); backdrop-filter: blur(40px); }
```
三级厚度（light/medium/heavy）对应不同透明度 + 模糊值。

## 组件架构

### 分层设计

```
design-tokens/ → 色彩、字体、间距、阴影、动画
components/ui/ → 原子组件 (Button/Card/Switch/Table...)
components/common/ → 通用组件 (LoadingState/EmptyState/ErrorState...)
components/pet/ → 领域组件 (PetSelector)
features/ → 页面模块 (pets/health/activity/feeding/appointments/settings)
layouts/ → 布局 (RootLayout)
```

### 组件设计模式

**状态覆盖**：每个数据组件覆盖 loading / empty / error / data 四种状态。\
**hover 统一**：所有记录行使用 `group-hover:text-apple-blue` 模式。\
**卡片文字**：AppleCard 内 DynamicType 统一不传 color prop，使用默认值 `text-apple-label`（浅色=黑，深色=白）。

## 深色模式

1. **CSS 变量驱动**：`--apple-*` 在 `:root` 和 `.dark` 中定义不同值
2. **类名切换**：useTheme hook 在 `<html>` 上添加/移除 `.dark` 类
3. **持久化**：localStorage 存储用户偏好
4. **系统检测**：首次加载检测 `prefers-color-scheme: dark`

## 常见问题

### 1. 自定义 Spacing 的级联影响
**解决**：使用 `h-[36px]` 固定像素值。

### 2. 深色模式下的边框闪烁
**解决**：保持 DOM 元素始终存在，用 CSS opacity/width 控制显隐，避免条件渲染。

### 3. `peer-checked` 对嵌套子元素无效
**解决**：使用 React 的 `checked` prop 直接条件应用类名，而非 Tailwind peer。

### 4. Segmented Control 多选项溢出
**解决**：`flex-nowrap + overflow-x-auto + scrollbar-none`。

## 性能优化

- `scrollbar-none` 隐藏滚动条保持滚动功能
- 图片 avatar 使用 `onError` 回退到首字母/emoji
- Context 方法使用 `useCallback` 避免不必要重渲染

## 无障碍

- `prefers-reduced-motion: reduce` → 禁用动画
- `prefers-contrast: more` → 增强对比度
- 语义化 ARIA 标签
