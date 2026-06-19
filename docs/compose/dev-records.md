# 古诗文小助手 — 开发问题记录

> Taro 3.6.25 + React 18 + NutUI React Taro 3.0.20 + WeChat Mini Program

---

## 1. Skyline 渲染模式（component: true）与组件样式

### 问题
首页 `pages/index` 和文库页 `pages/library` 等启用了 Skyline 渲染（`component: true` + `styleIsolation: 'apply-shared'`），组件内部的 `import './style.scss'` 不会被编译到任何 WXSS 文件中，导致组件样式丢失。

### 迹象
- 页面渲染但组件无样式
- `dist/pages/index.wxss` 不存在
- 自定义组件（FloatLayout、FilterModal）样式缺失

### 解决方案
将组件样式移到 `src/app.scss`（全局），使其编译到 `app-origin.wxss`。Skyline 页面通过 `apply-shared` 继承全局样式。

```scss
// app.scss — 组件样式全局化
.filter-modal { ... }
.float-layout { ... }
```

### 注意
- `app-origin.wxss` 通过 `app.wxss @import` 加载，所有页面共享
- 后续新增 Skyline 页面时，其使用的组件样式也需全局化

---

## 2. @tarojs/plugin-html 版本不匹配

### 问题
安装 `@tarojs/plugin-html` 时使用了错误版本 `3.6.0-beta.4`，与项目 Taro 版本 `3.6.25` 不兼容，导致：
- 小程序渲染时报 `Template 'tmpl_0_i' not found`（`<i>` 元素模板缺失）
- 编译产物 `base.wxml` 中缺少对应模板

### 解决方案
安装与 Taro 完全一致的版本：
```bash
npm i @tarojs/plugin-html@3.6.25
```

### 检查方法
```bash
# 查看已安装版本
grep "@tarojs/plugin-html" package.json
# 查看 Taro 版本
grep "@tarojs/taro" package.json
```

---

## 3. @tarojs/plugin-html 与 Skyline 冲突

### 问题
启用 `@tarojs/plugin-html` 后，Skyline 页面（`component: true`）报 `TypeError: t.split is not a function`。
- 根因：`taro.js` 中 `g` 函数在处理 className 时，`arguments[1]` 为非字符串（`null`/`0`/`false`），`.split(" ")` 调用失败
- 该函数仅在有 Skyline 的页面中触发

### 解决方案
**不启用 `@tarojs/plugin-html`**，改用其他方式解决 HTML 元素渲染问题：
- NutUI Tabs 设置 `activeType="line"`（默认值），避免使用 `JoySmile` 图标（渲染 `<i>` 元素）
- 移除 `plugin-html` 后，需要手工处理 NutUI 图标（CheckNormal、JoySmile 等）的渲染

### 检查条件
| 方案 | 优点 | 缺点 |
|------|------|------|
| 无 plugin-html（推荐） | 无 `t.split` 崩溃 | NutUI 图标不显示（控制台警告） |
| 有 plugin-html | 图标正常 | Skyline 页面崩溃 |

---

## 4. NutUI 375 设计稿与项目 750 适配

### 问题
NutUI 使用 375 设计稿（rpx 基准），项目使用 750 设计稿。直接导入 NutUI 的 `style.scss` 后，所有组件的 px 值按 750 缩放，导致组件缩小一半。

### 根源
`@import '~@nutui/nutui-react-taro/dist/style.scss'` 在 `app.scss` 中编译时，sass-loader 合并所有 SCSS 为单一 CSS 输出。postcss/pxtransform 看到的 `input.from` 是 `app.scss`（入口文件路径），不是 NutUI 的独立文件路径。因此 `designWidth` 检测 `nutui` 失败，回退到 750。

### 解决方案
**在 `app.jsx` 中通过 JS import 导入 NutUI CSS**，而非在 `app.scss` 中 SCSS import：
```js
// app.jsx — CSS 文件路径包含 @nutui，pxtransform 能识别
import '@nutui/nutui-react-taro/dist/style.css';
import './app.scss';
```
这样 webpack 处理 CSS 文件时，`input.from` 包含 `@nutui`，`designWidth` 函数返回 375。

### 不生效的方案
- `app.scss` 中 `@import '~@nutui/.../style.scss'`：sass-loader 编译为单一 CSS，postcss 看到的 `input.from` 是 `app.scss`，不包含 `@nutui`
- `app.scss` 中 `@import '~@nutui/.../style.css'`：postcss 不识别 `~` 前缀
- 手动覆盖所有 NutUI 组件字号/间距：工作量太大，不可维护

### 配置
```js
// config/index.js — 必须保留，用于 JS import 的 CSS 文件检测
designWidth (input) {
  if (input?.file?.indexOf('nutui') > -1) return 375
  return 750
}
```

---

## 5. NutUI 图标组件在微信小程序中不可用

### 问题
NutUI Radio 组件内部使用 `@nutui/icons-react-taro` 的 SVG 图标组件（`CheckChecked`、`CheckNormal`、`CheckDisabled`），Tabs 使用 `JoySmile`。这些图标在小程序中渲染失败：
- SVG → 微信小程序不支持内联 SVG
- `data:image/svg+xml;base64,...` → 非所有小程序环境支持

### 现象
- Radio/Checkbox 组件渲染空白
- Tabs 中 smile 图标不显示

### 解决方案
- **Radio/Checkbox**：替换为原生 Taro View 组件，手工实现圆形选中样式
- **Tabs**：使用默认 `activeType="line"`（不渲染 `JoySmile` 图标）
- **Button/Input/Tag** 等无图标的 NutUI 组件可正常使用

### 注意
使用 NutUI 组件前需检查其是否依赖 `@nutui/icons-react-taro` 的图标

---

## 6. NutUI 样式导入方式

### 三种方式对比
| 方式 | 配置 | 优点 | 缺点 |
|------|------|------|------|
| 全局 SCSS 导入 | `app.scss`: `@import '~...style.scss'` | 简单，所有样式一次加载 | 包体积大，375/750 适配需手动 |
| babel-plugin-import | `babel.config.js` + `style: (name) => ...` | 按需加载，包体积小 | 需要配置 `babel-plugin-import`，Skyline 下样式丢失 |
| 全局 CSS 导入 | `app.scss`: `@import '~...style.css'` | 简单 | `~` 前缀 postcss 不兼容 |

### 当前选择
全局 SCSS 导入 + 手动字号覆盖。如需优化包体积，可启用 `babel-plugin-import`：
```js
// babel.config.js
["import", {
  libraryName: "@nutui/nutui-react-taro",
  libraryDirectory: "dist/es/packages",
  style: (name) => `${name.toLowerCase()}/style/css`,
  camel2DashComponentName: false,
}, "nutui-react-taro"]
```

---

## 7. pxtransform 中 designWidth 检测限制

### 问题
`postcss-pxtransform` 的 `designWidth` 函数接收 `input` 参数，其 `file`/`from` 属性在 SCSS 多文件编译时仅指向入口文件，不包含被引用的子文件路径。

### 影响
- NutUI 的 SCSS 通过 `app.scss` 的 `@import` 加载 → pxtransform 检测不到 `nutui` → 按 750 缩放
- 单个 CSS 文件通过 JS import 加载 → pxtransform 能检测到文件路径 → 正确 375 缩放

### 变通方案
手动覆盖受影响的组件的尺寸属性。无法依赖 `designWidth` 自动检测。

---

## 8. 后端 API /api/authors 排序

### 问题
筛选弹窗的作者列表按入库顺序（`id: 1`）排序，不是按热度。

### 修复
```ts
// gushi_api/src/routes/author.ts
.sort({ id: 1 })       →  .sort({ pv_count: -1 })
```

---

## 9. 后端 API /api/sentences/random 缺少 author 字段

### 问题
名句 API 返回的数据缺少 `author` 字段，导致前端分享卡片作者信息不显示。

### 修复
后端补充 author 查询逻辑（类似已有 poem_title 的补充）：
```ts
// 通过 author_source_id 关联 authors 集合获取 author_name
const authorMap = new Map(authors.map(a => [a.id, a.author_name]))
for (const s of list) {
  if (s.author_source_id) {
    s.author = authorMap.get(s.author_source_id) || ''
  }
}
```

---

## 10. NutUI Tabs TabPane 内边距

### 问题
`.nut-tabpane` 默认 `padding: 48rpx 40rpx` 过大（375 设计稿值），在 750 下显示为 `24rpx 20rpx`。

### 修复
```scss
.nut-tabpane { padding: 0 !important; }
```

---

## 11. 依赖包安装指南

### 核心依赖
```bash
npm i @nutui/nutui-react-taro@^3.0.20
```

### 可选依赖（按需安装）
```bash
# HTML 元素支持（与 Skyline 冲突，当前不使用）
npm i @tarojs/plugin-html@3.6.25

# 按需加载 NutUI 样式（当前不使用）
npm i babel-plugin-import
```

### 预构建排除
```js
// config/index.js
compiler: {
  prebundle: {
    exclude: ['@nutui/nutui-react-taro']
  }
}
```

---

## 12. 快速检查清单

当开发中遇到样式/渲染问题时，按此清单排查：

- [ ] Skyline 页面？→ 组件样式需在 `app.scss` 全局化
- [ ] NutUI 字号太小？→ 在 `app.scss` 添加 `!important` 覆盖（翻倍）
- [ ] 组件渲染空白？→ 检查是否使用了 `@nutui/icons-react-taro` 图标
- [ ] `t.split` 报错？→ 检查是否启用了 `@tarojs/plugin-html`
- [ ] `Template not found`？→ 检查是否缺少 `@tarojs/plugin-html`
- [ ] NutUI 布局异常？→ 检查 `designWidth` 是否匹配 375
