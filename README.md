# PettyCare 🐾

> Take care of your pets everywhere, everywhen, everytime.

PettyCare 是一个融合 Apple 设计哲学的宠物健康管理平台前端界面。提供宠物档案、健康记录、活动追踪、喂养计划、预约日历等完整功能。

## ✨ 功能模块

| 模块 | 说明 |
|------|------|
| **Dashboard** | 健康评分概览、疫苗接种状态、即将到来的预约 |
| **Pets** | 宠物档案 CRUD、头像上传、品种管理 |
| **Health** | 疫苗接种计划、就诊历史、用药追踪 |
| **Activity** | 步数、距离、活动时间追踪，日/周/月视图 |
| **Feeding** | 每日喂食计划、食物记录、份量追踪 |
| **Appointments** | 月历视图、预约管理 |
| **Settings** | 深色模式、通知偏好、隐私控制 |

## 🖥️ 技术栈

- **框架**: React 19 + TypeScript
- **构建**: Vite 6
- **样式**: Tailwind CSS 3.4 + Apple 设计令牌
- **动画**: Framer Motion 11
- **图标**: Lucide React
- **状态管理**: React Context

## 🎨 Apple 设计哲学

- **SF 字体层级**: 11 级字号 (largeTitle → caption2)
- **语义色彩**: 系统红/橙/黄/绿/蓝/紫色板
- **毛玻璃**: 3 级背景模糊 (light/medium/heavy)
- **8pt 网格**: 一致间距韵律
- **深色模式**: CSS 变量驱动 + localStorage 持久化
- **无障碍**: Reduced motion, High contrast

## 🚀 快速开始

```bash
npm install        # 安装依赖
npm run dev        # 启动开发服务器 (http://localhost:5175)
npm run build      # 生产构建
npm run preview    # 预览构建产物
```

## 📁 项目结构

```
src/
├── components/ui/       # 原子组件 (Button/Card/Switch/Table...)
├── components/common/   # 通用组件 (Loading/Empty/Error/Toast...)
├── components/pet/      # 领域组件 (PetSelector)
├── features/            # 页面模块 (pets/health/activity/feeding/...)
├── layouts/             # 布局 (RootLayout)
├── store/               # 数据层 & Mock 数据
├── design-tokens/       # 色彩、字体、间距、阴影、动画
├── types/               # 类型定义
└── utils/               # 工具函数
```

## 📚 文档

- [前端开发经验总结](docs/frontend-experience.md) — 架构决策、模式与经验教训
- [实施计划](docs/ecc/pet-health-platform.plan.md) — 原始项目计划与里程碑
- [截图](docs/ecc/) — 各阶段界面截图

## 📄 许可证

MIT
