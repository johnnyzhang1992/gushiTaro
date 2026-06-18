# 本地开发与环境配置

## 环境要求

| 项 | 要求 |
|---|---|
| Node.js | >= 12.0.0（推荐 16+） |
| 包管理器 | npm 或 yarn |
| Taro CLI | `@tarojs/cli@3.6.25`（全局安装） |

## 安装

```bash
# 克隆项目后
npm install

# 或
yarn install
```

## 配置

### 1. 常量配置

复制 `src/const/constants.js.example` 到 `src/const/constants.js`：

```js
// 阿里云 OSS URL 校验 key
export const OSS_URL_CHECK_KEY = 'your_key_here'
// CDN 域名
export const CDN_DOMAIN = 'https://assets.xuegushi.com'
```

### 2. API 地址

`src/const/config.js` 中的 `BaseUrl` 默认指向生产环境：
```js
export const BaseUrl = 'https://api.xuegushi.com'
// 本地开发可切换为：
// export const BaseUrl = 'http://127.0.0.1:3000'
```

## 开发命令

```bash
# 微信小程序开发（主要）
npm run dev:weapp

# H5 开发
npm run dev:h5

# 其他平台
npm run dev:tt      # 字节跳动
npm run dev:swan    # 百度
npm run dev:alipay  # 支付宝
npm run dev:qq      # QQ
npm run dev:jd      # 京东
```

## 构建

```bash
# 生产构建
npm run build:weapp
npm run build:h5
```

## 代码质量

```bash
# ESLint 检查
npx eslint src/

# Stylelint 检查
npx stylelint src/**/*.scss
```

## Taro 版本管理

当前版本：3.6.25

```bash
# 查看版本信息
taro info

# 更新 CLI
taro update self [版本号]

# 更新项目
taro update project [版本号]
```

### 已知问题

当 Taro 版本 >= 3.5 时，需要在 `config/index.js` 中排除 taro-ui：
```js
compiler: {
  type: 'webpack5',
  prebundle: {
    exclude: ['taro-ui']
  }
}
```

## 项目结构快速参考

```
src/
├── app.config.js    ← 路由配置（新增页面需在此注册）
├── app.jsx          ← 入口（登录逻辑在此）
├── apis/            ← 请求封装
├── services/        ← 业务 API
├── pages/           ← 页面（每个页面一个目录）
├── components/      ← 组件
├── hooks/           ← 自定义 Hook
├── const/           ← 常量
├── utils/           ← 工具函数
└── images/          ← 静态资源
```

## 新增页面步骤

1. 在 `src/pages/` 下创建目录和文件
2. 在 `src/app.config.js` 的 `pages` 数组中注册路由
3. 如需 TabBar 入口，修改 `tabBar.list`

## 新增组件步骤

1. 在 `src/components/` 下创建目录
2. 编写组件代码（index.jsx）和样式（index.scss）
3. 在页面中 import 使用
