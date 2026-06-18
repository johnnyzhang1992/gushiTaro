# 后端重构计划 — gushi_api

## 目标

将 `gushi_docker/gushi_api` 抽离为独立项目 `gushi_api`，使用 TypeScript 重写，规范化接口服务。

## 原有后端分析

### 技术栈

| 项 | 当前 |
|---|---|
| 框架 | Fastify 5.x |
| 语言 | JavaScript (ESM) |
| 数据库 | MongoDB (Mongoose 9.x) |
| 缓存 | Redis |
| 认证 | 自定义 token + Cookie |
| 日志 | Winston |
| 部署 | Docker + Nginx |

### 现有代码规模

| 类型 | 数量 |
|------|------|
| Models | 34 个 Mongoose Schema |
| Routes | 18 个路由文件 |
| Controllers | 18 个控制器文件 |

### 路由前缀总览

| 前缀 | 用途 | 状态 |
|------|------|------|
| `/api/` | 收藏/点赞基础操作 | 核心 |
| `/api/user/` | 用户信息/登录/二维码 | 核心 |
| `/api/poem/` | 诗词 CRUD | 核心 |
| `/api/sentence/` | 名句 CRUD | 核心 |
| `/api/author/` | 诗人 CRUD | 核心 |
| `/api/search/` | 搜索 | 核心 |
| `/api/collections/` | 收藏集 | 核心 |
| `/api/schedule/` | 学习计划 | 核心 |
| `/api/pinyin/` | 拼音转换 | 核心 |
| `/api/catalog/` | 分类 | 核心 |
| `/api/poemBook/` | 课本 | 核心 |
| `/api/log/` | 日志上报 | 保留 |
| `/api/stats/` | 统计 | 保留 |
| `/api/visit/` | 访问记录 | 保留 |
| `/api/tts/` | 语音合成 | 已移除小程序 |
| `/api/xinhua/` | 新华字典 | 非核心 |
| `/api/wxapp/` | 微信小程序专用 | 保留 |
| `/api/admin/` | 管理后台 | 独立模块 |

### 核心数据模型

```
User ──────────┬── Collect (收藏/点赞)
               ├── StudySchedule (学习计划)
               ├── StudyScheduleDetail (计划详情)
               └── LoginRecord (登录记录)

Poem ──────────┬── Sentence (名句)
               ├── PoemPinyin (拼音)
               ├── PoemCatalog (分类关联)
               └── PoemBook (课本关联)

Author ────────└── Poem (诗词)

Collection ────└── Collect (收藏集内容)
```

---

## 新项目结构

```
gushi_api/
├── src/
│   ├── app.ts                    # 入口
│   ├── config/
│   │   ├── index.ts              # 配置加载
│   │   ├── database.ts           # MongoDB 连接
│   │   └── redis.ts              # Redis 连接
│   ├── types/
│   │   ├── index.ts              # 公共类型
│   │   ├── models.ts             # 模型类型
│   │   └── api.ts                # API 请求/响应类型
│   ├── models/                   # Mongoose Schema (TS)
│   │   ├── user.ts
│   │   ├── poem.ts
│   │   ├── author.ts
│   │   ├── sentence.ts
│   │   ├── collect.ts
│   │   ├── collections.ts
│   │   ├── study-schedule.ts
│   │   ├── study-schedule-detail.ts
│   │   ├── poem-catalog.ts
│   │   ├── poem-book.ts
│   │   ├── search.ts
│   │   ├── login-record.ts
│   │   └── index.ts
│   ├── routes/                   # 路由定义
│   │   ├── user.ts
│   │   ├── poem.ts
│   │   ├── author.ts
│   │   ├── sentence.ts
│   │   ├── search.ts
│   │   ├── collections.ts
│   │   ├── schedule.ts
│   │   ├── pinyin.ts
│   │   ├── catalog.ts
│   │   ├── poem-book.ts
│   │   ├── collect.ts           # 收藏/点赞
│   │   ├── log.ts
│   │   ├── stats.ts
│   │   ├── wxapp.ts
│   │   └── index.ts
│   ├── controllers/              # 业务逻辑
│   │   ├── user.ts
│   │   ├── poem.ts
│   │   ├── author.ts
│   │   ├── sentence.ts
│   │   ├── search.ts
│   │   ├── collections.ts
│   │   ├── schedule.ts
│   │   ├── pinyin.ts
│   │   ├── catalog.ts
│   │   ├── collect.ts
│   │   └── index.ts
│   ├── services/                 # 数据访问层 (可选)
│   │   └── ...
│   ├── hooks/                    # Fastify hooks
│   │   ├── auth.ts               # 鉴权
│   │   ├── rate-limit.ts         # 限流
│   │   └── error-handler.ts      # 错误处理
│   ├── plugins/                  # Fastify 插件
│   │   ├── db.ts
│   │   └── redis.ts
│   └── utils/
│       ├── logger.ts
│       ├── response.ts           # 统一响应格式
│       └── crypto.ts
├── tsconfig.json
├── package.json
├── .env.example
├── Dockerfile
└── docs/
    └── api-reference.md
```

---

## TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 分阶段实施计划

### 阶段一：项目初始化（1 天）

1. 创建 `gushi_api` 项目目录
2. 初始化 `package.json`，安装依赖
3. 配置 TypeScript、ESLint、Prettier
4. 创建基础目录结构
5. 配置环境变量（`.env.example`）

**依赖清单**：

```json
{
  "dependencies": {
    "fastify": "^5.6.0",
    "@fastify/cors": "^11.1.0",
    "@fastify/compress": "^8.3.0",
    "@fastify/cookie": "^11.0.2",
    "@fastify/formbody": "^8.0.2",
    "@fastify/multipart": "^9.3.0",
    "@fastify/rate-limit": "^10.3.0",
    "@fastify/redis": "^7.1.0",
    "@fastify/static": "^8.3.0",
    "@fastify/swagger": "^9.6.1",
    "@fastify/swagger-ui": "^5.2.3",
    "mongoose": "^9.0.0",
    "redis": "^5.10.0",
    "dayjs": "^1.11.19",
    "dotenv": "^17.2.3",
    "winston": "^3.18.3",
    "crypto-js": "^4.2.0",
    "pinyin-pro": "^3.27.0",
    "ali-oss": "^6.23.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0",
    "nodemon": "^3.1.0",
    "eslint": "^9.39.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "prettier": "^3.4.0"
  }
}
```

### 阶段二：核心类型定义（2 天）

为所有数据模型定义 TypeScript 接口：

```typescript
// src/types/models.ts

export interface IUser {
  id: number;
  uid?: number;
  name: string;
  email?: string;
  avatar?: string;
  about?: string;
  domain?: string;
  like_count: number;
  collect_count: number;
  pv_count: number;
  openid?: string;
  wx_token?: string;
  remember_token?: string;
  platform: 'wxapp' | 'web' | 'webapp';
  last_login_ip?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface IPoem {
  id: number;
  source_id?: number;
  title: string;
  dynasty?: string;
  tags?: string;
  background?: string;
  content: any;
  type: string;          // 诗/词/曲/文言文
  poem_type?: string;    // 五言绝句/七言律诗等
  intro?: string;
  source?: string;
  period?: string;
  author?: string;
  author_id?: number;
  author_source_id?: number;
  creator_id: number;
  collect_count: number;
  like_count: number;
  pv_count: number;
  text_content: string;
  created_at: Date;
  updated_at: Date;
}

export interface IAuthor {
  id: number;
  source_id?: number;
  dynasty?: string;
  author_name: string;
  title?: string;
  describe?: string;
  styled?: string;
  avatar?: string;
  profile?: string;
  creator_id: number;
  collect_count: number;
  like_count: number;
  pv_count: number;
  more_infos?: any;
  created_at: Date;
  updated_at: Date;
}

export interface ISentence {
  id: number;
  source_id?: number;
  target_id?: number;
  target_source_id?: number;
  author_id?: number;
  author_source_id?: number;
  title: string;
  theme?: string;
  type?: string;
  origin?: string;
  content: string;
  yi?: string;
  creator_id: number;
  collect_count: number;
  like_count: number;
  pv_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface ICollect {
  user_id: number;
  collection_id?: string;
  like_id: number;
  type: 'poem' | 'author' | 'sentence' | 'post';
  status: 'active' | 'inactive' | 'delete';
  ip?: string;
  date: string;
  created_at: Date;
  updated_at: Date;
}

export interface IStudySchedule {
  name: string;
  origin: 'catalog' | 'schedule';
  origin_id?: string;
  creator_id: number;
  poem_count: number;
  date: string;
  created_at: Date;
  updated_at: Date;
}

export interface IStudyScheduleDetail {
  schedule_id: string;
  schedule_name?: string;
  user_id: number;
  status: 0 | 1;
  check_count: number;
  poem_id: number;
  date: string;
  created_at: Date;
  updated_at: Date;
}
```

### 阶段三：核心模块重写（5-7 天）

按优先级顺序重写：

| 优先级 | 模块 | 路由前缀 | 工作量 |
|--------|------|----------|--------|
| P0 | 鉴权 + 用户 | `/api/user/` | 2 天 |
| P0 | 诗词 | `/api/poem/` | 1 天 |
| P0 | 名句 | `/api/sentence/` | 0.5 天 |
| P0 | 诗人 | `/api/author/` | 0.5 天 |
| P0 | 搜索 | `/api/search/` | 0.5 天 |
| P1 | 收藏/点赞 | `/api/` | 0.5 天 |
| P1 | 收藏集 | `/api/collections/` | 0.5 天 |
| P1 | 学习计划 | `/api/schedule/` | 1 天 |
| P1 | 分类 | `/api/catalog/` | 0.5 天 |
| P1 | 课本 | `/api/poemBook/` | 0.5 天 |
| P2 | 拼音 | `/api/pinyin/` | 0.5 天 |
| P2 | 日志上报 | `/api/log/` | 0.5 天 |
| P2 | 统计 | `/api/stats/` | 0.5 天 |
| P3 | 微信小程序 | `/api/wxapp/` | 0.5 天 |
| P3 | 管理后台 | `/api/admin/` | 后续 |

### 阶段四：前端适配（2 天）

1. 确保新 API 与前端 `services/global.js` 兼容
2. 响应格式统一（见下方）
3. 联调测试

---

## 统一响应格式

```typescript
// 成功响应
interface SuccessResponse<T = any> {
  status: true;
  data: T;
}

// 错误响应
interface ErrorResponse {
  status: false;
  msg: string;
  errmsg: string;
  error_code: number;
}

// 分页响应
interface PaginatedResponse<T> {
  status: true;
  list: T[];
  current_page: number;
  last_page: number;
  total: number;
  page: number;
  size: number;
}
```

---

## 鉴权方案

保持原有微信小程序登录方式，增加规范化：

```
小程序启动
  ↓ Taro.login() 获取 code
  ↓
POST /api/user/userInfo?code=xxx
  ↓ 后端用 code 换 openId
  ↓ 查找/创建用户
  ↓ 返回 { user_id, wx_token, ... }
  ↓
前端存储 user + wx_token
  ↓
后续请求 Header:
  Authorization: Bearer <wx_token>
```

---

## 部署方案

```yaml
# docker-compose.yml (简化)
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/gushi
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
```

---

## 与旧项目的区别

| 项 | 旧 (gushi_docker/gushi_api) | 新 (gushi_api) |
|---|---|---|
| 语言 | JavaScript | TypeScript |
| 目录结构 | 平铺 | 按职责分层 |
| 类型安全 | 无 | 严格模式 |
| 错误处理 | try-catch + reply.send | 统一错误处理中间件 |
| 响应格式 | 不统一 | 统一 SuccessResponse/ErrorResponse |
| 鉴权 | 全局 preHandler | 独立 auth 插件 |
| 路由组织 | app.js 中手动注册 | 自动扫描注册 |
| 配置管理 | 硬编码 + .env | 类型安全的配置模块 |
| 测试 | 无 | 预留测试目录 |

---

## 待移除/降级的功能

| 功能 | 原因 | 处理 |
|------|------|------|
| TTS 语音合成 | 小程序已移除朗读功能 | 移除 |
| 新华字典 | 非核心，使用频率低 | 降级为可选模块 |
| 管理后台 API | 独立系统 | 独立项目或后期添加 |
