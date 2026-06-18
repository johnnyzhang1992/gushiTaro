# 架构总览

## 技术栈

| 层 | 技术 | 版本 |
|---|---|---|
| 跨端框架 | Taro | 3.6.25 |
| UI 框架 | React | 18.x |
| UI 组件库 | taro-ui | 3.x |
| Hooks 扩展 | taro-hooks | 2.x |
| 样式 | SCSS | - |
| 构建工具 | Webpack 5 | 5.78 |
| 语言 | JavaScript | ES6+ |

## 目录结构

```
gushiTaro/
├── config/                    # Taro 构建配置
│   ├── index.js              # 主配置（设计宽度 750，webpack5）
│   ├── dev.js                # 开发环境
│   └── prod.js               # 生产环境
├── src/
│   ├── app.config.js         # 路由 + TabBar + 全局窗口配置
│   ├── app.jsx               # 入口：登录、版本更新
│   ├── app.scss              # 全局样式
│   ├── apis/                 # HTTP 请求封装
│   │   ├── request.js        # 统一请求方法（自动带 openId/token）
│   │   └── uploadFile.js     # 文件上传
│   ├── services/             # 业务 API 层
│   │   └── global.js         # 全局 API（收藏、用户、计划、分类等）
│   ├── components/           # 41 个自定义组件
│   ├── pages/                # 页面（15 个页面模块，27 条路由）
│   ├── hooks/                # 自定义 Hook
│   │   └── useFetchList.js   # 分页列表通用 Hook
│   ├── const/                # 常量与配置
│   │   ├── config.js         # API 地址、分类数据、朝代、词牌名
│   │   ├── constants.js      # OSS 签名 key、CDN 域名
│   │   ├── color.js          # 中国传统颜色数据
│   │   └── posterConfig.js   # 海报生成配置
│   ├── utils/                # 工具函数
│   │   ├── auth.js           # 登录态判断
│   │   ├── tool.js           # 设备信息获取
│   │   ├── util.js           # 日期格式化、时间差等
│   │   └── alioss.js         # 阿里云 OSS 签名
│   ├── layout/               # 页面布局容器
│   └── images/               # 静态图片资源
└── docs/                     # 项目文档
```

## 数据流

```
用户操作
  ↓
页面组件 (pages/)
  ↓ 调用
服务层 (services/global.js + 各页面 service.js)
  ↓ 调用
请求层 (apis/request.js)
  ↓ Taro.request
后端 API (https://api.xuegushi.com/api/...)
  ↓ 返回
页面组件更新状态 → 视图渲染
```

## 状态管理

项目 **没有使用** Redux/MobX 等状态管理库，状态管理方式为：

1. **组件局部状态**：`useState` 管理页面级数据
2. **Storage 持久化**：`Taro.setStorageSync` 存储用户信息、token、搜索历史等
3. **全局 Hook**：`useFetchList` 封装分页列表的请求/加载/错误状态
4. **组件 Props 透传**：父子组件通过 props 通信

## 路由架构

### TabBar 页面（3 个）
| Tab | 路由 | 说明 |
|-----|------|------|
| 首页 | pages/index | 每日诗词画报 |
| 文库 | pages/library/index | 分类/作品/作者 Tab |
| 我 | pages/me/index | 个人中心 |

### 普通页面（24 条路由）
- **诗词**：pages/poem/index, pages/poem/detail, pages/poem/detail/index（重定向）
- **诗人**：pages/poet/index, pages/poet/detail
- **名句**：pages/sentence/index, pages/sentence/detail
- **搜索**：pages/search/index
- **文库**：pages/library/index, pages/library/detail, pages/library/catalog
- **分类**：pages/type/index
- **课本**：pages/book
- **发现**：pages/find/index（已从 TabBar 注释掉）
- **帖子**：pages/post/index
- **字典**：pages/dictionary/detail
- **学习计划**：pages/schedule/index, pages/schedule/detail
- **个人**：pages/me/index, pages/me/collect, pages/me/collections, pages/me/setting, pages/me/qrcode_login

## 全局配置

`app.config.js` 关键配置：
- 导航栏：蓝色背景 (#337ab7)，白色文字
- 下拉刷新：已启用
- 触底距离：40px
- 懒加载：requiredComponents
- 渲染引擎：Skyline（微信小程序）
