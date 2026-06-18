# 组件清单

共 41 个自定义组件，位于 `src/components/`。

## 布局与容器类

| 组件 | 用途 | 使用页面 |
|------|------|----------|
| **Layout** | 页面布局容器，包裹子组件 | 首页、诗词列表 |
| **FloatLayout** | 半屏弹出层（从底部滑出） | 首页（海报配置） |
| **PageHeader** | 页面顶部导航栏 | 文库、个人中心、搜索、发现 |
| **SectionCard** | 带标题的卡片容器 | 个人中心、搜索 |

## 诗词相关

| 组件 | 用途 | 使用页面 |
|------|------|----------|
| **PoemSmallCard** | 诗词小卡片（标题+作者+朝代） | 诗词列表、搜索结果 |
| **PoemContainer** | 诗词列表容器（含分页） | 文库-作品 Tab |
| **PoemContainer** | 诗人相关诗词展示 | 诗人详情 |
| **SentenceCard** | 名句卡片 | 名句列表、搜索结果 |
| **SentenceContainer** | 名句列表容器 | 名句相关页面 |
| **LongTextCard** | 长文本展示卡片 | 诗词详情 |

## 诗人相关

| 组件 | 用途 | 使用页面 |
|------|------|----------|
| **PoetCard** | 诗人信息卡片 | 诗人列表、搜索结果 |
| **PoetContainer** | 诗人列表容器 | 文库-作者 Tab |
| **PoetSmallCard** | 诗人小卡片 | 诗人详情 |

## 交互组件

| 组件 | 用途 | 使用页面 |
|------|------|----------|
| **CollectButton** | 收藏按钮（切换收藏状态） | 诗词/诗人/名句详情 |
| **LikeButton** | 点赞按钮 | 诗词/诗人/名句详情 |
| **CopyButton** | 复制按钮 | 诗词详情 |
| **PinyinButton** | 拼音按钮（切换拼音显示） | 诗词详情 |
| **PinyinText** | 拼音文本组件 | 诗词详情 |
| **ScheduleButton** | 加入学习计划按钮 | 诗词详情 |
| **FabButton** | 浮动操作按钮 | 各页面 |
| **FilterCard** | 筛选卡片（下拉选择） | 诗词列表、诗人列表 |
| **FilterModal** | 筛选弹窗 | 首页 |

## 弹窗与模态

| 组件 | 用途 | 使用页面 |
|------|------|----------|
| **CollectionModal** | 收藏操作弹窗 | 诗词/诗人/名句详情 |
| **ScheduleModal** | 学习计划弹窗（创建/编辑） | 学习计划 |
| **SchedulePoemModal** | 计划诗词操作弹窗 | 计划详情 |
| **CollectionSmallCard** | 收藏集小卡片 | 收藏集列表 |

## 计划相关

| 组件 | 用途 | 使用页面 |
|------|------|----------|
| **ScheduleCard** | 学习计划卡片 | 计划列表 |
| **SchedulePoemCard** | 计划中的诗词卡片 | 计划详情 |

## 展示组件

| 组件 | 用途 | 使用页面 |
|------|------|----------|
| **BookCard** | 课本卡片（含诗词列表） | 课本页 |
| **BookCover** | 课本封面 | 课本页 |
| **TagsCard** | 标签列表 | 搜索结果 |
| **TypeCard** | 分类卡片 | 分类页、文库 |
| **TypeCatalogSection** | 分类目录区域 | 文库分类 |
| **TypeContainer** | 分类列表容器 | 文库-分类 Tab |
| **HomeNavs** | 首页导航入口 | 首页 |
| **FindHeader** | 发现页头部 | 发现页 |
| **Dictionary** | 字典组件（含 WordCard） | 搜索-字典 Tab、发现页 |
| **WordCell** | 字典词单元格 | 字典详情 |

## 媒体与分享

| 组件 | 用途 | 使用页面 |
|------|------|----------|
| **CdnImage** | CDN 图片（自动加签名） | 个人中心、各页面 |
| **Poster** | 海报生成 | 诗词详情 |
| **Skeleton** | 骨架屏加载 | 各列表页 |
| **HighLightText** | 高亮文本（搜索关键词） | 搜索结果 |
| **Accordion** | 手风琴折叠面板 | 各详情页 |

## 组件依赖关系图

```
首页 (index)
├── Layout
├── FloatLayout
├── PosterSnapshot → PosterLayoutConfig
└── FilterModal

文库 (library)
├── PageHeader
├── TypeContainer → TypeCard
├── PoemContainer → PoemSmallCard
└── PoetContainer → PoetCard

个人中心 (me)
├── PageHeader
├── SectionCard
└── CdnImage

搜索 (search)
├── PageHeader
├── DictionaryContainer → WordCard
├── TagsCard
├── SentenceCard
├── PoemSmallCard
├── PoetCard
└── SearchRecord, RandomSearch

诗词列表 (poem)
├── Layout
├── FilterCard
└── PoemSmallCard

计划 (schedule)
├── ScheduleCard
└── ScheduleModal
```
