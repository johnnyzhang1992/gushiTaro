# 架构总览

本项目为一个基于 Taro 的微信小程序（多端跨平台框架），使用 React 作为前端框架，并面向多端打包。代码组织和依赖旨在实现快速开发、组件化复用以及跨平台能力。

## 技术栈要点
- 运行时/框架：Taro（多端构建），React
- UI 组件：Taro-UI
- 生态工具：taro-hooks、eslint、stylelint、postcss、typescript（可选）
- 构建目标：微信小程序、H5、以及其它 taro 支持的平台（如 alipay、jd、qq、swan、tt、rn、quickapp 等，依据 package.json 的脚本）
- 语言与类型：JavaScript 为主，TypeScript 作为可选依赖（devDependencies 中包含 typescript）

## 项目结构与职责
- apis：统一的 API 请求入口与封装，负责与后端接口交互。
- component：自定义组件集合，供页面复用。
- const：全局或常量数据（如朝代、分类等数据源）。
- images：静态资源，对应图标等资源图片。
- hooks：自定义 React hooks，封装公共逻辑。
- pages：小程序各页面及路由对应的实现。
- services：请求实例与页面相关的服务层封装，便于集中管理。
- utils：工具函数集合，提供通用方法。
- 其它：config、scripts、样式等资源按 taro 的项目约定组织。

以上目录结构摘自 README 的描述，是当前代码的核心分布，后续你如有新增模块也应遵循类似分层。

## 架构视角的工作流
- 数据流：页面 -> 服务/接口 -> 数据模型 -> 页面渲染。网络请求集中在 apis/services 目录，页面直接消费封装好的接口。
- 组件化：component 目录下的自定义组件在多页面间复用，减少重复代码。
- 状态与副作用：基于 React 的组合式编程，优先使用自定义 hooks 来封装副作用和公共逻辑。
- 构建目标：通过 npm 脚本提供多端构建能力，例如 build:weapp、build:h5、build:rn 等，dev:* 脚本用于本地开发监听与热更新。

## 构建与开发
- 主要构建命令（在 package.json 中定义）
  - build:weapp, build:h5, build:rn, build:tt, build:swan, build:alipay, build:qq, build:jd, build:quickapp
- 本地开发以 watch 模式运行：dev:weapp 等
- Node 版本要求：>= 12.0.0（package.json中的 engines 字段）
- 依赖环境：nvm/npx/yarn/npm 均可，确保 taro 相关全局依赖正确安装

## 演进与扩展建议
- 如要引入类型系统，确认现有代码对 TypeScript 的支持程度；可逐步迁移到 TS，添加 .tsx/.ts 文件，并在 tsconfig.json 中做相应配置。
- 建立 docs 子文档，覆盖组件设计规范、路由/导航约束、网络请求错误处理、数据模型等。
- 增加单元测试与端到端测试脚本，增强稳定性。

## 现状与注意点
- 该仓库为一个 Taro-based 小程序多端解决方案，当前 README 已描述目录分布，结合 package.json 的依赖可确定核心技术栈。
- README 提供的目录结构示例是参考基线，实际开发中请以 project 的实际实现为准。

如需，我可以进一步补充更多子文档，例如：
- docs/development-guidelines.md
- docs/api.md
- docs/component-library.md
- docs/setup.md
