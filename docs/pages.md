# 页面清单

## 首页 (pages/index)

**文件**：`src/pages/index.jsx` + `index.scss` + `index.config.js`

**功能**：
- 展示每日一诗词画报
- 支持换一换（重新获取随机诗词）
- 支持分享（微信好友/朋友圈）
- 支持筛选（作者/主题）
- 支持生成海报图片并保存到相册
- 使用 Snapshot 组件截取画报内容

**核心依赖**：
- 组件：FloatLayout, PosterLayoutConfig, PosterSnapshot, FilterModal
- 服务：`fetchRandomSentence`, `shareReport`
- 常量：`initConfig`（海报配置）
- 工具：`Utils.formatDate`

**数据流**：
- 首次加载检查 Storage 缓存，有则使用缓存
- 无缓存则调用 `fetchRandomSentence` 获取随机名句
- 海报生成通过 Snapshot API 截取 → 保存到用户目录 → 保存到相册

---

## 课本 (pages/book)

**文件**：`src/pages/book.jsx` + `index.scss`

**功能**：
- 根据课程代码（xiaoxue/chuzhong/gaozhong 等）加载课本诗词
- 按 book 字段分组展示
- 支持下拉刷新和分享

**核心依赖**：
- 组件：BookCard
- 服务：`fetchBookData`（来自 pages/poem/service）

---

## 文库 (pages/library/index)

**文件**：`src/pages/library/index.jsx` + `style.scss`

**功能**：
- Tab 切换：分类 / 作品 / 作者
- 分类 Tab：展示 CategoriesList 中的主题/写景/节日等分类
- 作品 Tab：诗词列表（支持朝代筛选）
- 作者 Tab：诗人列表

**核心依赖**：
- 组件：PageHeader, TypeContainer, PoemContainer, PoetContainer
- UI：AtTabs, AtTabsPane

---

## 个人中心 (pages/me/index)

**文件**：`src/pages/me/index.jsx` + `style.scss`

**功能**：
- 用户登录/注册（getUserProfile + createUser）
- 显示用户收藏统计（作品/摘录/作者数量）
- 学习计划统计（学习诗词数/连续打卡/总打卡）
- 扫码功能
- 关于我们入口
- 二维码展示

**核心依赖**：
- 组件：PageHeader, SectionCard, CdnImage
- 服务：`fetchUserInfo`, `createUser`, `fetchScheduleStats`
- 页面服务：`./service`（fetchUserInfo）

**登录流程**：
1. 调用 `Taro.getUserProfile` 获取用户信息
2. 调用 `Taro.login` 获取 code
3. 调用 `createUser` 发送到后端解密
4. 存储 user 和 wx_token 到 Storage

---

## 搜索 (pages/search/index)

**文件**：`src/pages/search/index.jsx` + `style.scss`

**功能**：
- 诗词搜索和字典查询两种模式
- 搜索热词展示
- 搜索记录（本地存储）
- 搜索结果分组展示：分类/诗人/名句/诗词
- 搜索词高亮

**核心依赖**：
- 组件：PageHeader, DictionaryContainer, SectionCard, SentenceCard, PoemSmallCard, TagsCard, PoetCard
- 子组件：SearchRecord, RandomSearch
- 服务：`fetchSearch`, `fetchHotSearch`
- 工具：`addKey`（搜索历史）

**搜索限制**：关键词最长 9 字符

---

## 诗词列表 (pages/poem/index)

**文件**：`src/pages/poem/index.jsx` + `style.scss`

**功能**：
- 展示诗词列表（分页加载）
- 支持多种入口：首页筛选、导航、标签、搜索
- 筛选：朝代、形式（诗/词/曲/文言文）
- 筛选维度：标题/诗词/标签/作者
- 支持分享

**核心依赖**：
- 组件：Layout, FilterCard, PoemSmallCard
- Hook：`useFetchList`
- 服务：`fetchHomeData`, `fetchPoemData`
- 常量：`PoemTypes`, `DynastyArr`

---

## 诗人列表 (pages/poet/index)

**文件**：`src/pages/poet/index.jsx` + `style.scss`

**功能**：
- 诗人列表分页展示
- 按朝代筛选
- 支持关键词搜索结果展示

**核心依赖**：
- 组件：FilterCard, PoetCard
- Hook：`useFetchList`
- 服务：`fetchPoetData`
- 常量：`DynastyArr`

---

## 名句列表 (pages/sentence/index)

**文件**：`src/pages/sentence/index.jsx` + `style.scss`

**功能**：
- 名句分页列表
- 支持按主题/类型筛选
- 支持按作者/关键词筛选

**核心依赖**：
- 组件：SentenceCard
- Hook：`useFetchList`
- 服务：`fetchSentenceData`

---

## 学习计划 (pages/schedule/index)

**文件**：`src/pages/schedule/index.jsx` + `style.scss`

**功能**：
- 计划列表展示
- 学习统计（学习诗词数/连续打卡/总打卡）
- 创建/编辑/删除计划
- 弹窗表单操作

**核心依赖**：
- 组件：ScheduleCard, ScheduleModal
- 服务：`fetchSchedules`, `fetchScheduleStats`

---

## 发现 (pages/find/index) — 已从 TabBar 注释

**文件**：`src/pages/find/index.jsx` + `style.scss`

**功能**：
- 字典查询
- 词牌名入口
- 飞花令入口

**状态**：功能未完成，TabBar 入口已注释

---

## 分类 (pages/type/index)

**文件**：`src/pages/type/index.jsx` + `style.scss`

**功能**：
- 根据标题从 CategoriesList 中查找分类
- 展示该分类下的所有标签卡片

**核心依赖**：
- 组件：TypeCard
- 常量：`CategoriesList`

---

## 其他页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 诗词详情 | pages/poem/detail | 诗词详情页 |
| 诗人详情 | pages/poet/detail | 诗人信息及作品 |
| 名句详情 | pages/sentence/detail | 名句详情 |
| 文库详情 | pages/library/detail | 文库分类详情 |
| 文库目录 | pages/library/catalog | 文库目录 |
| 字典详情 | pages/dictionary/detail | 字典查询结果 |
| 计划详情 | pages/schedule/detail | 学习计划详情 |
| 帖子 | pages/post/index | 关于我们等静态页 |
| 收藏 | pages/me/collect | 用户收藏列表 |
| 收藏集 | pages/me/collections | 收藏集管理 |
| 设置 | pages/me/setting | 用户设置 |
| 二维码登录 | pages/me/qrcode_login | 二维码登录 |
