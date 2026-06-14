---
name: frontend-test-spec
description: Test Level 分级标准（TL1-TL4）用于前端自动化测试，包含用例格式、断言模板和 PettyCare 项目实践参考
metadata:
  type: reference
---

# Frontend Test Specification (Test Level)

基于导航深度的前端测试分级标准，可适用于任何前端项目。

## Test Level 定义

| Level | 定义 | 测试重点 |
|-------|------|----------|
| **TL1** | 从导航直接进入的页面元素 | 样式正确性（字体、色彩、间距、布局），**不修改状态** |
| **TL2** | 从 TL1 操作进入的新内容（弹框、表单、页面跳转） | 样式 + 功能 + 数据正确性 |
| **TL3** | 从 TL2 操作进入的更深层交互（编辑已保存数据、删除确认） | 样式 + 功能 + 数据一致性 |
| **TL4** | 跨页面数据一致性 | 数据联动 + CRUD 闭环 + 状态同步 |

## 测试用例格式

每条用例由 4 部分组成：

```
Test Level | Test Path | 期望值 | 实际值 | Test Result
```

## 各 Level 测试指南

### TL1 — UI 渲染验证
- 只断言样式/渲染，不修改状态
- 验证元素存在、文本正确、样式类应用
- 检查 CSS 变量加载、暗色模式适配
- 适合快照测试、视觉回归测试

### TL2+ — 交互与功能验证
- 遵循 **Arrange → Act → Assert** 模式：
  1. **Arrange**: 导航到起始页面
  2. **Act**: 执行操作（点击、填写、提交）
  3. **Assert**: 验证结果（新内容样式 + 数据正确性 + 关联组件状态）
- 每个 TL2+ 测试须在操作前后验证数据一致性

## 断言代码模板

```typescript
// TL1 — 只检查样式/渲染
assert(elem.exists, 'Element renders correctly', 'TL1')

// TL2 — 交互 + 数据验证
await performAction()
assert(result.visible, 'Action result visible', 'TL2')
assert(data.updated, 'Data persisted correctly', 'TL2')

// TL3 — 编辑已保存数据
await editSavedData()
assert(data.changed, 'Edit applied correctly', 'TL3')

// TL4 — 跨页面数据一致性
await navigateToSectionA()
const countA = getCount()
await navigateToSectionB()
const countB = getCount()
assert(countA === countB, 'Data consistent across pages', 'TL4')
```

## 测试文件结构

```
tests/
├── chrome-visual.spec.ts       # 全局 UI（侧边栏、工具栏、布局）
├── dashboard-visual.spec.ts    # Dashboard / 首页
├── <module>-visual.spec.ts     # 每个功能模块一个文件
└── e2e-workflow.spec.ts        # 端到端全流程
```

## 前端测试注意事项

### Puppeteer 常见问题
- **React 状态更新**: 使用 `page.evaluate` 设置 input value 时需用 `nativeInputValueSetter` + 触发 `input`/`change` 事件
- **弹框/下拉菜单**: 外部点击关闭模式（`mousedown` 监听）可能导致 `page.evaluate` 超时，操作后需等待动画完成（`sleep(400-800)`)
- **CSS 变量检测**: 用 `getComputedStyle(document.documentElement).getPropertyValue('--var-name')` 而非直接读取样式
- **暗色模式验证**: 检查 `<html>` 的 `class` 属性是否包含 `dark`

### 选择器最佳实践
- 优先使用文本匹配 (`textContent?.includes`) 而不是 CSS 类名匹配
- 对于带图标的按钮，结合 `textContent` + `querySelector('svg')` 定位
- 下拉菜单项通常 **不** 含 SVG，而触发器通常 **含** SVG
- 使用 `!b.closest('nav')` 排除侧边栏按钮，避免误触

### 状态管理测试
- Context/Store 数据在页面刷新后会重置（mock 数据重新初始化）
- 测试间需要隔离状态时，使用 `page.goto(BASE_URL)` 重新加载
- CRUD 测试遵循：创建 → 验证存在 → 编辑 → 验证更新 → 删除 → 验证移除

## 参考实现

完整测试规范文档：`docs/testing/pettycare-frontend-test-spec.md`（PettyCare 项目）
