# PettyCare Auth Login — Pet Companion 交互式登录界面设计

## 概述

为 PettyCare 宠物健康管理平台重新设计登录/注册界面。核心概念是将认证过程转化为一次与宠物角色的温馨互动——登录不再是冰冷的表单填写，而是与宠物角色的情感交互。

## 设计原则

1. **宠物先行** — 宠物角色是视觉主角和交互核心，每个用户操作都获得宠物的实时情感反馈
2. **温暖治愈** — 暖白色调 + Mint/Indigo 点缀，营造清晨阳光般的温暖感
3. **交互即体验** — 登录过程充满精心设计的微动效，让等待也变得有趣
4. **无缝过渡** — 登录成功到 Dashboard 的过渡自然流畅

## 配色系统

| Token | 色值 | 用途 |
|-------|------|------|
| `--auth-bg` | `#FAF8F5` | 页面暖白背景 |
| `--auth-card` | `rgba(255,255,255,0.78)` | 表单卡片毛玻璃 |
| `--auth-primary` | `#00C7BE` (Mint) | 主色调、按钮、聚焦边框 |
| `--auth-pet` | `#5856D6` (Indigo) | 宠物角色主色 |
| `--auth-accent` | `#FF9F0A` (Orange) | 点缀色、宠物鼻子/耳朵 |
| `--auth-text` | `#1C1C1E` | 暖黑色正文 |
| `--auth-text-secondary` | `#8E8E93` | 次要文字 |

深色模式自动适配项目现有的 `.dark` 类体系。

## 字体层级

沿用项目已有的 Apple HIG 字体系统（`DynamicType` 组件），主要使用：

- 品牌标识：`title1` weight 700
- Tab 标题：`title3` weight 600
- 输入框文字：`body` weight 400
- 按钮文字：`headline` weight 600
- 错误消息：`footnote` weight 400
- 底部脚注：`caption1` weight 400

## 布局结构

居中单列布局，`max-w-[400px]`，垂直排列：

```
+---------------------------------------+
|  🐾 PettyCare       (顶部品牌标识, t1)  |
|                                         |
|    🐱 互动宠物角色                     |
|    (SVG, ~160px 高度)                  |
|    ─────────────                      |
|                                         |
|  ○ Login  ● Register                   |
|  ┌────────────────────────┐            |
|  │ ✉️  email@example.com │            |
|  └────────────────────────┘            |
|  ┌────────────────────────┐            |
|  │ 🔒  password      👁   │            |
|  └────────────────────────┘            |
|                                         |
|  ┌────────────────────────┐            |
|  │    🚀  Let's Go!      │            |
|  └────────────────────────┘            |
|                                         |
|  ── or continue with ──                |
|  [Google] [Apple]                      |
+---------------------------------------+
```

## 宠物角色设计

### 视觉风格
- 极简几何风格（圆形、椭圆、三角形组合）
- 主色 Indigo `#5856D6`，耳朵/鼻子点缀 Orange `#FF9F0A`
- 纯 SVG 实现，每个身体部位独立为 Framer Motion `motion.g` 分组
- 约 15 个 `<path>` / `<circle>` 元素

### 反应动画映射

| 触发时机 | 动画行为 | Framer Motion 参数 |
|---------|---------|-------------------|
| 页面加载 | 从下方弹入 | `initial: y=40, opacity=0` → `animate: y=0, opacity=1`, spring damping=12 |
| 邮箱聚焦 | 耳朵竖起，头转 8° | `rotate: 8deg`, `scaleY: 1.1`, 200ms ease |
| 正在输入 | 尾巴左右轻摇 | `rotate: -12↔12deg`, 循环 2s/周期 |
| 密码聚焦 | 用爪遮眼（害羞） | AnimatePresence 控制 paw path 从背后移到眼前 |
| 密码显示切换 | 遮眼开/关 | 弹性过渡 |
| 点击登录 | 弹跳庆祝 3 次 | `y: -20px`, `scale: 0.9→1.05` 循环 |
| 登录成功 | 向右挥手淡出 | `x: 30px, opacity: 0`, 配合撒花粒子 |
| 登录失败 | 歪头困惑 | `rotate: -15deg`, 耳朵 `translateY: 4px`, 表情 `^_^`→`o_o` |

## 登录/注册 Tab 切换动效

使用 AppleSegmentedControl 风格的 tab 切换，联动以下动效：
1. 表单内容左右滑动过渡（Login ↔ Register）
2. Tab 下方指示器平滑滑动
3. 宠物同步转头注意
4. 按钮文字联动 ("Let's Go!" ↔ "Join Now!")

## 状态覆盖

### 1. 初始加载（AuthGuard）
- 宠物 Skeleton 轮廓（浅灰线条 + 3 个呼吸脉冲点）
- "Checking your session..." 文字
- 不显示完整表单

### 2. 正常就绪
- 宠物开心表情 `^_^`，耳朵竖起
- 表单可交互
- 社交登录按钮可见

### 3. 输入进行中
- 聚焦输入框边框变 Mint 色
- 宠物对应反应（耳朵/尾巴/遮眼）
- 左侧图标变色

### 4. 提交中（Loading）
- 按钮文字变为 "Logging in..." + loading dots
- 按钮宽度不变，opacity 降至 0.8
- 禁止重复点击
- 宠物持续跳跃

### 5. 错误状态

| 场景 | 宠物反应 | 提示文案 | UI 反馈 |
|------|---------|---------|---------|
| 邮箱格式错误 | 歪头 o_o | "Hmm, that doesn't look like an email" | 橙色震动边框 |
| 密码 < 6 位 | 摇头 | "Password needs at least 6 characters" | 橙色边框 |
| 密码错误 | 困或表情 | "Wrong password — want to reset it?" | 显示 Forgot link |
| 服务器错误 | 耳朵下垂 | "Couldn't reach PettyCare servers" | 按钮变为 Retry |
| 邮箱已注册 | 耸肩 | "This email is already registered" | 自动切到 Login tab |

### 6. 成功状态（登录）
- 宠物跳起挥手 + 撒花粒子动画
- 按钮变为绿色 ✓ 对号
- 800ms 确认窗口后过渡到 Dashboard

### 7. 成功状态（注册）
- 更多庆祝粒子 + "Account Created!" 消息
- "Please check your email to verify" 引导
- 确认按钮返回登录

### 8. 深色模式
- 宠物主色从 Indigo 切换为 Mint（深色背景上更显眼）
- 卡片背景变为 `rgba(44,44,46,0.85)`
- 输入框深色样式
- 其他自动适配 `.dark` 类

## 技术实现

### 文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/features/auth/AuthPage.tsx` | **重写** | 全新登录页容器 + 表单 + 宠物角色 |
| `src/features/auth/PetBackground.tsx` | **保留但调整** | 去掉旋转背景，改为纯色背景 |
| `src/features/auth/PetCharacter.tsx` | **新建** | 宠物 SVG + Framer Motion 动画组件 |
| `src/features/auth/AuthGuard.tsx` | 不变 | 继续使用现有认证守卫 |
| `src/store/auth-context.tsx` | 不变 | 继续使用现有认证上下文 |

### 依赖
- 现有：`framer-motion` (已安装), `lucide-react` (已安装), `@/components/ui/DynamicType`
- 无新增依赖

### PetCharacter 组件接口

```typescript
interface PetCharacterProps {
  // 宠物情感状态
  mood: 'idle' | 'happy' | 'curious' | 'shy' | 'confused' | 'excited' | 'sad'
  // 是否在打字输入中
  isTyping?: boolean
  // 当前聚焦的输入框
  activeField?: 'email' | 'password' | null
  // 是否显示密码（遮眼逻辑）
  passwordVisible?: boolean
  // 是否在加载中
  isLoading?: boolean
  // 是否成功
  isSuccess?: boolean
}
```

### 宠物 SVG 结构

```svg
<svg viewBox="0 0 120 140">
  <!-- 身体 (大椭圆) -->
  <ellipse cx="60" cy="100" rx="30" ry="25" />
  <!-- 头部 (圆形) -->
  <circle cx="60" cy="50" r="28" />
  <!-- 左耳 (三角形) -->
  <polygon points="40,30 32,8 48,22" />
  <!-- 右耳 (三角形) -->
  <polygon points="80,30 88,8 72,22" />
  <!-- 左眼 -->
  <circle cx="50" cy="46" r="4" />
  <!-- 右眼 -->
  <circle cx="70" cy="46" r="4" />
  <!-- 瞳孔 (左右移动实现视线跟随) -->
  <circle cx="52" cy="46" r="2" />
  <!-- 鼻子 (小三角形/椭圆) -->
  <ellipse cx="60" cy="56" rx="3" ry="2" />
  <!-- 尾巴 (路径) -->
  <path d="M90,100 Q110,90 105,70" />
  <!-- 前爪 (遮眼用) -->
  <path d="M55,65 Q50,55 55,45" opacity="0" />
</svg>
```
