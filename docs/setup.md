# 本地开发与环境配置

## 本地环境与版本管理
- Node.js 版本建议使用 >=12 但更推荐使用 16+，以获得更好的兼容性与性能。
- 使用 nvm（Node Version Manager）进行版本切换，确保与项目 engines 要求一致。
- 包管理器可选：npm 或 yarn，建议锁定版本以避免依赖波动。

## 本地工作流
- 安装依赖：`npm install` 或 `yarn install`。
- 清理缓存（如有问题）：`npm cache clean --force` 或 `yarn cache clean`。
- 启动开发服务器（多端同构，监听改动）：
  - `npm run dev:weapp`
  - `npm run dev:h5`
  根据需要选择目标端。

## 代码质量与提交
- 运行 lint/格式化（若项目配置了 pre-commit 钩子，可在提交时自动执行）
- 提交信息推荐使用 conventional commits 风格，如 `feat: add new widget`、`fix: resolve build issue`。
