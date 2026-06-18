# 重构指南

基于对整个代码库的分析，以下列出代码问题和重构建议，按优先级排序。

---

## P0 — 必须修复的问题

### 1. request.js 返回值不一致

**问题**：`request.js` 调用 `Taro.request` 但没有返回 Promise。`Taro.request` 本身返回 Promise，但 `success` 回调中的逻辑（如 401 处理、toast）与 `.then()` 链混用，导致：
- `.then()` 拿到的是原始 `Taro.request` 的 resolve 值
- `success` 回调中的错误处理和 `fail` 回调中的错误处理不对称
- 部分调用方（如 `useFetchList`）依赖 `res.statusCode`，但 `Taro.request` 的 success 回调参数结构与 Promise resolve 不同

**建议**：将 `request.js` 重写为返回 Promise，使用 async/await 或 `.then()` 链式调用：

```js
const request = async (url, params, method = 'GET') => {
  // ... 构建 data
  const res = await Taro.request({ ... });
  if (res.statusCode === 401) { /* 处理过期 */ }
  if (res.statusCode !== 200) { /* 统一错误处理 */ }
  return res;
};
```

### 2. 状态管理混乱

**问题**：
- 用户信息分散在多处：`Storage('user')`、`Storage('wx_token')`、组件 `useState`
- 登录逻辑重复：`app.jsx` 的 `userLogin` 和 `pages/me/index` 的 `handleCreateUser` 都有登录/注册逻辑
- 没有全局状态：每个页面独立获取用户信息，造成重复请求

**建议**：
- 创建 `useUser` Hook，统一管理用户状态
- 或引入轻量状态管理（如 Zustand/Jotai）
- 将登录逻辑集中到 services 层

### 3. 无 TypeScript

**问题**：整个项目使用 JavaScript，无类型定义，props 接口不明确，重构时容易引入 bug。

**建议**：渐进式迁移 TypeScript：
1. 先从 utils/hooks/services 开始
2. 为组件定义 Props 类型
3. 最后迁移页面组件

---

## P1 — 重要改进

### 4. 组件职责不清

**问题**：
- `DictionaryContainer` 和 `WordCard` 命名不一致
- `TypeContainer`、`PoemContainer`、`PoetContainer` 三个容器组件结构相似但各自实现
- `SectionCard` 承载了过多职责（标题、样式、点击事件）

**建议**：
- 统一容器组件的接口和实现
- 将 `SectionCard` 拆分为更小的组件
- 使用更语义化的命名

### 5. useFetchList Hook 过于复杂

**问题**：
- Hook 内部使用多个 `useRef` 追踪状态（`dataRef`、`cacheParams`、`loadRef`）
- 使用 `JSON.stringify` 比较参数变化（性能差且不可靠）
- `requestType` 特殊处理（`collect` 类型需登录态）
- 大量 console.log 残留

**建议**：
- 简化参数比较逻辑
- 移除 debug 日志
- 考虑使用更成熟的列表方案（如 SWR/React Query）

### 6. 常量数据过大

**问题**：`const/config.js` 包含：
- 1253 行的 CategoriesList（分类数据）
- 1250+ 行的 CiPaiArr（词牌名）
- 1629 行的 color.js（中国传统颜色）

**建议**：
- 将大数据集移到独立 JSON 文件或后端 API
- 使用动态 import 按需加载
- 考虑从后端获取分类数据

### 7. 样式管理

**问题**：
- 每个页面/组件有独立的 scss 文件
- 全局样式在 `app.scss`
- 没有使用 CSS Modules（配置中 `cssModules.enable: false`）
- 类名命名不统一（BEM vs 驼峰 vs 简写）

**建议**：
- 统一命名规范（推荐 BEM）
- 启用 CSS Modules 避免样式冲突
- 抽取公共样式变量（颜色、间距、字号）

---

## P2 — 代码质量提升

### 8. 错误处理不统一

**问题**：
- `request.js` 的错误处理只是 console.log + toast
- 页面级错误通过 `useFetchList` 的 `error` 状态展示
- 部分页面有 try-catch，部分没有
- 401 处理在 request.js 和 auth.js 中重复

**建议**：
- 统一错误处理策略
- 创建错误边界组件
- 区分业务错误和网络错误

### 9. console.log 残留

**问题**：整个代码库有大量 `console.log` 语句，尤其在：
- `useFetchList.js`（10+ 处）
- `request.js`（请求日志）
- 各页面的生命周期钩子中

**建议**：
- 使用条件编译或 debug 开关
- 生产环境移除所有 console.log
- 使用 Taro 的环境变量控制

### 10. 组件 Props 没有默认值和校验

**问题**：
- 所有组件都没有 PropTypes 或 TypeScript 类型定义
- 部分组件直接解构 props 而不做默认值处理
- 如 `CdnImage` 的 `src` 为 undefined 时可能报错

**建议**：
- 至少添加 PropTypes（如果暂时不上 TS）
- 为所有可选 props 设置默认值
- 添加 props 校验

### 11. 定时器管理

**问题**：`pages/index.jsx` 中使用 `setTimeout`，虽然在 `handleReload` 中 `clearTimeout`，但如果组件卸载时未清理会泄漏。

**建议**：
- 使用 `useEffect` 的 cleanup 函数清理定时器
- 或使用 `useRef` 存储定时器 ID

### 12. Storage 使用不规范

**问题**：
- Storage key 随意命名：`user`、`wx_token`、`home_senetnce`（拼写错误）、`enterPath`、`sys_info`、`preLoginPath`、`showSearchTips`
- 没有统一的 Storage 管理层
- 数据结构不一致

**建议**：
- 创建 Storage 管理模块，统一 key 和数据结构
- 使用常量定义 Storage key
- 添加类型校验

---

## P3 — 架构改进

### 13. 缺少测试

**问题**：项目没有测试文件，没有测试框架配置。

**建议**：
- 引入 Jest + React Testing Library
- 为 utils/hooks/services 编写单元测试
- 为关键组件编写快照测试

### 14. 缺少代码规范强制执行

**问题**：
- `.eslintrc.js` 配置了 ESLint 但未验证是否生效
- 没有 pre-commit hook
- 没有 CI/CD 配置

**建议**：
- 配置 husky + lint-staged
- 添加 CI 流程（lint + type check + test）
- 统一代码格式（Prettier）

### 15. 图片资源管理

**问题**：
- `src/images/` 下有 SVG、PNG 等多种格式
- 部分 SVG 作为 JS 模块导入
- CDN 图片需要签名才能访问

**建议**：
- 使用雪碧图或 icon font 替代散落的 PNG
- 统一图片资源管理方式
- 考虑使用 CDN 图片组件统一处理签名

---

## 重构优先级建议

### 第一阶段（基础加固）
1. 修复 `request.js` 返回值问题
2. 统一错误处理
3. 清理 console.log
4. 添加 PropTypes

### 第二阶段（状态管理）
5. 创建 `useUser` Hook
6. 统一 Storage 管理
7. 简化 `useFetchList`

### 第三阶段（类型安全）
8. 渐进式引入 TypeScript
9. 为关键模块添加类型

### 第四阶段（架构优化）
10. 重组组件结构
11. 抽离常量数据
12. 添加测试
13. 配置 CI/CD
