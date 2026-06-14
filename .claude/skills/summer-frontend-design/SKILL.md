---
name: summer-frontend-design
description: Apple 设计哲学的前端开发模式 — React + TypeScript + Tailwind CSS，包含设计令牌系统、组件架构、深色模式策略和常见问题解决方案
---

# Summer Frontend Design Skill

Apple 设计哲学的前端开发指南，基于 PettyCare 项目实战经验提炼。

## 设计令牌系统

### Apple 语义色彩

```ts
// tailwind.config.ts
colors: {
  apple: {
    label: 'var(--apple-label)',
    secondaryLabel: 'var(--apple-secondaryLabel)',
    tertiaryLabel: 'var(--apple-tertiaryLabel)',
    systemBackground: 'var(--apple-systemBackground)',
    secondarySystemBackground: 'var(--apple-secondarySystemBackground)',
    fill: 'var(--apple-fill)',
    red: '#FF3B30', orange: '#FF9500', yellow: '#FFCC00',
    green: '#34C759', blue: '#007AFF', indigo: '#5856D6',
    purple: '#AF52DE', pink: '#FF2D55',
  }
}
```

### SF 字体层级

```ts
fontSize: {
  'apple-large-title': ['34px', { lineHeight: '41px', fontWeight: '700' }],
  'apple-title-1': ['28px', { lineHeight: '34px', fontWeight: '700' }],
  'apple-title-2': ['22px', { lineHeight: '28px', fontWeight: '700' }],
  'apple-title-3': ['20px', { lineHeight: '25px', fontWeight: '600' }],
  'apple-headline': ['17px', { lineHeight: '22px', fontWeight: '600' }],
  'apple-body': ['17px', { lineHeight: '22px', fontWeight: '400' }],
  'apple-callout': ['16px', { lineHeight: '21px', fontWeight: '400' }],
  'apple-subhead': ['15px', { lineHeight: '20px', fontWeight: '400' }],
  'apple-footnote': ['13px', { lineHeight: '18px', fontWeight: '400' }],
  'apple-caption-1': ['12px', { lineHeight: '16px', fontWeight: '400' }],
  'apple-caption-2': ['11px', { lineHeight: '13px', fontWeight: '400' }],
}
```

### 关键教训：8pt 网格与 Tailwind 间距

⚠️ **不要覆写 Tailwind 默认 spacing 的数字键**，否则 `h-10`/`w-10`/`p-10` 等类会被放大。

```ts
// ❌ 危险：h-10 从 40px 变为 80px
spacing: { '1': '8px', '2': '16px', ..., '10': '80px' }

// ✅ 安全：使用固定像素值
h-[36px]  w-[44px]  p-[16px]

// ✅ 安全：使用语义化命名
spacing: { xs: 8, sm: 16, md: 24, lg: 32, xl: 48 }
```

### 毛玻璃

```css
.glass { background: rgba(255,255,255,0.72); backdrop-filter: blur(40px); }
.glass-light { background: rgba(255,255,255,0.48); backdrop-filter: blur(20px); }
.glass-heavy { background: rgba(255,255,255,0.85); backdrop-filter: blur(60px); }
```

## 组件架构

### 分层结构

```
design-tokens/ → 色彩、字体、间距、阴影、动画参数
components/ui/ → 原子组件 (Button/Card/Switch/Table/Sidebar/Toolbar...)
components/common/ → 通用组件 (Loading/Empty/Error/Toast/ContextMenu)
components/{domain}/ → 领域组件 (PetSelector)
features/{module}/ → 页面模块
layouts/ → 布局 (RootLayout)
store/ → 数据层 (Context Provider)
types/ → 类型定义
utils/ → 工具函数 (cn/date/format)
```

### 原子组件模式

```tsx
// 受控 Props + 默认值
interface Props { variant?: 'a' | 'b'; size?: 'sm' | 'md' | 'lg' }

// 状态三件套
<LoadingState lines={4} card />
<EmptyState icon="..." title="..." description="..." action={<Button>...</Button>} />
<ErrorState title="..." message="..." onRetry={handleRetry} />

// 记录行 hover
<div className="group...">
  <span className="group-hover:text-apple-blue">{text}</span>
</div>
```

### AppleCard 文字规则

```
主要文字 → text-apple-label (浅色黑/深色白)
标签/单位 → text-apple-secondaryLabel (灰色)
```

## 深色模式

### 双重覆盖

```css
/* Layer 1: CSS 变量 */
:root { --apple-label: #000000; }
.dark  { --apple-label: #FFFFFF; }

/* Layer 2: 静态类覆盖 */
.dark .text-apple-label { color: #FFFFFF; }
.dark .bg-apple-systemBackground { background-color: #000000; }
.dark .apple-card { background-color: #2C2C2E; }
```

### 暗色背景层次

```
systemBackground: #000000
secondarySystemBackground: #1C1C1E
secondarySystemGroupedBackground: #2C2C2E (卡片)
tertiarySystemGroupedBackground: #3A3A3C
```

## 常见问题

### 1. 条件渲染边框闪烁
**解决**：DOM 始终存在，用 CSS opacity/width 控制显隐。

### 2. peer-checked 嵌套失效
**解决**：用 React 状态直接控制，而非 Tailwind peer。

### 3. 分组列表换行
**解决**：`flex-nowrap overflow-x-auto scrollbar-none`

### 4. 自定义间距级联
**解决**：使用固定像素值 `h-[36px]` 或语义化命名。
