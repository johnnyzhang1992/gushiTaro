# 组件设计与使用

## 规范与约定
- 组件应放在 components 子目录下，按功能域拆分，例如 components/Button、components/Card。
- 每个组件目录应包含 index.jsx/index.tsx、index.less、README.md（可选）等。
- 使用 BEM 风格的类名，样式采用 LESS 变量，支持主题切换。

## Props 与类型
- 优先使用 TypeScript 定义 Props 接口并在组件中应用。
- 对必填项标注，并提供合理的默认值。
- 对外暴露的 API 尽量简洁且向后兼容。

## 风格与主题
- 组件应具备对主题的适配能力，尽量通过 CSS 变量实现切换。
- 提供一个可覆盖的主题入口，确保暗黑模式等主题切换的可用性。

## 可维护性与测试
- 将复杂逻辑抽离为自定义 Hooks，减少组件耦合。
- 提供基本的单元测试覆盖组件行为，确保回归可控。
- 在组件 README 中给出用法示例与 Props 说明。

## 新建组件的工作流程
1) 在 components 目录中新建组件文件夹，例如 components/MyWidget
2) 实现 UI（index.jsx/tsx）与样式（index.less）
3) 编写 README.md 说明 Props、用法、示例
4) 在需要的页面中导入并使用该组件

## 示例
```jsx
// components/MyButton/index.jsx
import React from 'react'
import './index.less'

export default function MyButton({ label, onClick, type = 'default' }) {
  return (
    <button className={`mybtn mybtn--${type}`} onClick={onClick}>
      {label}
    </button>
  )
}
```

```less
/* components/MyButton/index.less */
.mybtn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  &--primary { background: #1e90ff; color: #fff; }
  &--default { background: #eee; color: #333; }
}
```
