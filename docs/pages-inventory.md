# 页面清单与整理

## 当前页面总览

`app.config.js` 注册了 **27 条路由**，分布在 **15 个页面目录**中。

---

## 按模块分组

### 1. 首页（TabBar）

| 路由 | 文件 | 功能 |
|------|------|------|
| `pages/index` | `index.jsx` + `index.scss` | 每日诗词画报、换一换、筛选、分享、生成海报 |

配置特殊：使用 Skyline 渲染引擎、自定义导航栏、glass-easel 组件框架。

### 2. 文库（TabBar）

| 路由 | 文件 | 功能 |
|------|------|------|
| `pages/library/index` | `library/index.jsx` | Tab 切换：分类/作品/作者 |
| `pages/library/detail` | - | 文库分类详情 |
| `pages/library/catalog` | - | 文库目录 |
| `pages/type/index` | `type/index.jsx` | 分类标签列表（从 CategoriesList 读取） |

### 3. 诗词

| 路由 | 文件 | 功能 |
|------|------|------|
| `pages/poem/index` | `poem/index.jsx` | 诗词列表（分页、筛选） |
| `pages/poem/detail` | `poem/detail.jsx` | 诗词详情 |
| `pages/poem/detail/index` | `poem/detail/index.jsx` | **重定向** → `pages/poem/detail` |
| `pages/book` | `book.jsx` | 课本诗词（按课程代码分组） |

页面内组件：`poem/components/` → FixBottom、PoemCard、PoemContent

### 4. 诗人

| 路由 | 文件 | 功能 |
|------|------|------|
| `pages/poet/index` | `poet/index.jsx` | 诗人列表（分页、朝代筛选） |
| `pages/poet/detail` | `poet/detail.jsx` | 诗人详情及作品 |

### 5. 名句

| 路由 | 文件 | 功能 |
|------|------|------|
| `pages/sentence/index` | `sentence/index.jsx` | 名句列表（分页） |
| `pages/sentence/detail` | `sentence/detail.jsx` | 名句详情 |

页面内组件：`sentence/components/` → FilterContainer（已注释未使用）

### 6. 搜索

| 路由 | 文件 | 功能 |
|------|------|------|
| `pages/search/index` | `search/index.jsx` | 诗词搜索 + 字典查询 |

页面内组件：`search/components/` → SearchRecord、RandomSearch
工具：`search/historyUtil.js`（搜索历史管理）

### 7. 个人中心（TabBar）

| 路由 | 文件 | 功能 |
|------|------|------|
| `pages/me/index` | `me/index.jsx` | 用户信息、收藏统计、学习计划入口 |
| `pages/me/collect` | `me/collect.jsx` | 收藏列表（诗词/摘录/作者） |
| `pages/me/collections` | `me/collections.jsx` | 收藏集管理 |
| `pages/me/setting` | `me/setting.jsx` | 用户设置 |
| `pages/me/qrcode_login` | `me/qrcode_login.jsx` | 二维码登录 |

### 8. 学习计划

| 路由 | 文件 | 功能 |
|------|------|------|
| `pages/schedule/index` | `schedule/index.jsx` | 计划列表 + 统计 |
| `pages/schedule/detail` | `schedule/detail.jsx` | 计划详情 |

### 9. 发现（已废弃）

| 路由 | 文件 | 功能 |
|------|------|------|
| `pages/find/index` | `find/index.jsx` | 字典 + 词牌 + 飞花令（未完成） |

TabBar 入口已注释掉。

### 10. 其他

| 路由 | 文件 | 功能 |
|------|------|------|
| `pages/post/index` | `post/index.jsx` | 静态内容页（关于我们、隐私政策） |
| `pages/dictionary/detail` | `dictionary/detail.jsx` | 字典查询结果 |

### 11. 未注册路由

| 目录 | 文件 | 说明 |
|------|------|------|
| `pages/admin/` | `AdminUsers.tsx` + `userService.ts` | 管理后台页面（未在 app.config.js 注册） |

---

## 问题清单

| # | 问题 | 位置 | 建议 |
|---|------|------|------|
| 1 | `pages/poem/detail/index.jsx` 仅做重定向 | `poem/detail/index.jsx` | 删除，统一使用 `pages/poem/detail` |
| 2 | `pages/admin/` 存在但未注册路由 | `pages/admin/` | 删除或移至独立项目 |
| 3 | `pages/find/` 已从 TabBar 注释 | `pages/find/` | 确认是否保留，若不保留则删除 |
| 4 | `pages/post/` 仅展示静态文本 | `pages/post/` | 考虑合并到 `pages/me/setting` |
| 5 | 课本页 `book.jsx` 放在 pages 根目录 | `pages/book.jsx` | 移入 `pages/book/` 目录，与其他页面一致 |
| 6 | `sentence/components/FilterContainer` 未使用 | `sentence/components/` | 删除未使用的组件 |
| 7 | config 文件命名不统一 | 各页面 | 有的用 `.config.js`，有的用 `config.js` |

---

## 页面关系图

```
TabBar
├── 首页 (pages/index)
│   ├── → 搜索 (pages/search/index)
│   ├── → 诗词列表 (pages/poem/index) [从首页筛选跳转]
│   └── → 诗词详情 (pages/poem/detail)
│
├── 文库 (pages/library/index)
│   ├── Tab: 分类 → TypeContainer → 分类列表 (pages/type/index)
│   ├── Tab: 作品 → PoemContainer → 诗词列表 (pages/poem/index)
│   ├── Tab: 作者 → PoetContainer → 诗人列表 (pages/poet/index)
│   ├── → 文库详情 (pages/library/detail)
│   └── → 文库目录 (pages/library/catalog)
│
└── 我 (pages/me/index)
    ├── → 收藏集 (pages/me/collections)
    ├── → 收藏列表 (pages/me/collect?type=poem|sentence|author)
    ├── → 设置 (pages/me/setting)
    ├── → 二维码登录 (pages/me/qrcode_login)
    ├── → 学习计划 (pages/schedule/index)
    │   └── → 计划详情 (pages/schedule/detail)
    └── → 关于我们 (pages/post/index?type=about)

诗词详情 (pages/poem/detail)
├── → 诗人详情 (pages/poet/detail)
├── → 名句详情 (pages/sentence/detail)
├── → 名句列表 (pages/sentence/index)
└── → 分类详情 (pages/type/index)

搜索 (pages/search/index)
├── → 诗词列表 (pages/poem/index)
├── → 诗人列表 (pages/poet/index)
├── → 名句列表 (pages/sentence/index)
└── → 字典详情 (pages/dictionary/detail)
```

---

## 重构建议

### 短期（保持路由不变）

1. 删除 `pages/poem/detail/index.jsx`（重定向页面）
2. 删除 `pages/admin/`（未使用）
3. 删除 `pages/sentence/components/FilterContainer/`（未使用）
4. 将 `pages/book.jsx` 移入 `pages/book/index.jsx`

### 中期（整理结构）

5. 确认 `pages/find/` 是否保留，不保留则删除
6. 将 `pages/post/` 的静态内容合并到 `pages/me/setting` 或独立组件
7. 统一所有页面的 config 文件命名（推荐 `xxx.config.js`）

### 长期（功能调整）

8. 评估 `pages/dictionary/` 是否合并到搜索模块
9. 评估 `pages/type/` 是否合并到文库模块
