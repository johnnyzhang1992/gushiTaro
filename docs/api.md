# API 与服务层

## 请求封装

### `apis/request.js`

统一请求方法，所有 API 调用都通过此函数。

**签名**：`request(url, params, method = 'GET')`

**自动注入的参数**：
- `platform`: 'wxapp'
- `openId`: 用户 openId
- `openid`: 用户 openid
- `wx_token`: 登录 token
- `user_id`: 用户 ID
- `wxapp_version`: 小程序版本号 (6.1.5)

**特性**：
- 基础 URL：`https://api.xuegushi.com`
- 支持 `hostUrl` 参数覆盖基础 URL
- 启用请求缓存 (`enableCache: true`)
- 401 响应自动清除登录态并跳转登录页
- 503/429 响应显示"访问频繁"提示

**注意事项**：
- 请求方法和参数混合传递（method 是第 3 个参数），非标准 REST 风格
- 错误处理不完善：失败时只是 console.log，没有统一的错误回调
- 没有请求拦截器/响应拦截器机制

---

## 业务 API 清单

### `services/global.js` — 全局服务

#### 首页
| 方法 | 路径 | 说明 |
|------|------|------|
| `fetchRandomSentence` | `/api/sentence/random` | 每日一诗词 |

#### 用户
| 方法 | 路径 | 说明 |
|------|------|------|
| `fetchUserInfo` | `/api/user/userInfo` | 获取用户信息 |
| `createUser` | `/api/user/create` | 创建用户（需解密） |
| `updateUserInfo` | `/api/user/updateInfo` | 更新用户信息 |

#### 收藏
| 方法 | 路径 | 说明 |
|------|------|------|
| `fetchUserCollect` | `/api/getCollects/:user_id` | 获取用户收藏 |
| `updateUserCollect` | `/api/updateCollect` | 更新收藏状态 |
| `updateUserLike` | `/api/updateLike` | 更新点赞状态 |

#### 收藏集
| 方法 | 路径 | 说明 |
|------|------|------|
| `fetchCollections` | `/api/collections` | 获取收藏集列表 |
| `createCollection` | `/api/collections/create` | 创建收藏集 |
| `updateCollection` | `/api/collections/update` | 更新收藏集 |

#### 拼音
| 方法 | 路径 | 说明 |
|------|------|------|
| `fetchPoemPinyin` | `/api/pinyin/poem` | 获取诗词拼音 |

#### 学习计划
| 方法 | 路径 | 说明 |
|------|------|------|
| `fetchSchedules` | `/api/schedule` | 获取计划列表 |
| `createSchedule` | `/api/schedule/create` | 创建计划 |
| `updateSchedule` | `/api/schedule/update` | 更新计划 |
| `deleteSchedule` | `/api/schedule/delete` | 删除计划 |
| `fetchScheduleDetail` | `/api/schedule/detail` | 获取计划详情 |
| `fetchScheduleStats` | `/api/schedule/stats` | 获取计划统计 |
| `addPoemToSchedule` | `/api/schedule/add_poem` | 向计划添加诗词 |
| `addPoemToScheduleAgain` | `/api/schedule/add_poem_again` | 重置诗词状态 |
| `removePoemToSchedule` | `/api/schedule/remove_poem` | 从计划移除诗词 |
| `checkInPoemToSchedule` | `/api/schedule/check_in` | 诗词打卡 |

#### 分类
| 方法 | 路径 | 说明 |
|------|------|------|
| `fetchCatalogList` | `/api/catalog/list` | 获取分类列表 |
| `fetchCatalogDetail` | `/api/catalog/detail` | 获取分类详情 |

#### 日志
| 方法 | 路径 | 说明 |
|------|------|------|
| `shareReport` | `/api/log/share_report` | 分享/下载上报 |

### 页面级 Service

每个页面目录下有独立的 `service.js`，定义该页面特有的 API：

| 页面 | Service 文件 | 主要方法 |
|------|-------------|----------|
| poem | `pages/poem/service.js` | `fetchHomeData`, `fetchPoemData`, `fetchBookData` |
| poet | `pages/poet/service.js` | `fetchPoetData` |
| sentence | `pages/sentence/service.js` | `fetchSentenceData` |
| search | `pages/search/service.js` | `fetchSearch`, `fetchHotSearch` |
| me | `pages/me/service.js` | `fetchUserInfo` |

---

## Hook

### `useFetchList` — 分页列表 Hook

**签名**：`useFetchList(fetchFn, params, pgConfig)`

**参数**：
- `fetchFn`: API 请求函数
- `params`: 请求参数（含 `inited`、`requestType` 等）
- `pgConfig`: 分页配置（`page`, `size`, `last_page`）

**返回值**：
- `data`: `{ list, pagination }`
- `loading`: 加载状态
- `error`: 错误信息
- `setData`: 手动更新数据

**特性**：
- 自动处理分页加载（追加/刷新）
- 参数变化时自动重新请求
- 防重复请求
- 收藏类请求需登录态

---

## 认证机制

### 登录流程
1. App 启动 → `Taro.login()` 获取 code
2. 调用 `fetchUserInfo` 发送 code 到后端
3. 后端返回 user 对象和 wx_token
4. 存储到 Storage：`user`, `wx_token`

### Token 过期处理
- 401 响应 → 清除 Storage → 弹窗提示 → 跳转"我的"页面
- `auth.js` 的 `userIsLogin()` 检查 user_id 是否存在

### OSS 签名
- `alioss.js` 生成阿里云 OSS 访问签名
- 使用 MD5 哈希（crypto-js）
- 签名有效期 30 分钟，有本地缓存

---

## 请求参数模式

大部分 API 遵循以下模式：

```js
// GET 请求
fetchXxx('GET', { page: 1, size: 15, ...filters })

// POST 请求
fetchXxx('POST', { id: 1, user_id: 123, ...data })
```

所有请求自动附带 `openId`、`wx_token`、`platform` 等公共参数。
