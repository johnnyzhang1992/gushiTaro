# 古诗文小助手（微信小程序）

#### [阿里云折扣优惠券](https://promotion.aliyun.com/ntms/yunparter/invite.html?userCode=rk77qloy)
![阿里云限量红包](https://images.gitee.com/uploads/images/2019/0109/114755_88127e0f_744475.jpeg "1000_90.jpg")

[学古诗](https://xuegushi.com) 网站微信小程序。

该小程序的目的是为了大家更方便简洁的学习中国传统古诗文，同时通过这些代码更多的学习使用小程序。

> 该项目为 Taro 重构版，[原版本](https://github.com/johnnyzhang1992/gushi_lite) 在项目上线后会不再维护。

> 项目当前第一版已于 2023 年 12 月 4 日上线。

> 移除诗词朗读功能。（官方解释：小程序服务内容涉及【有声读物】，属个人主体尚未开放服务类目

## 主要页面与组件

### 页面

`app.config.js` 当前注册 43 条路由，按模块划分：

| 模块 | 路径 | 说明 |
|------|------|------|
| 首页 | `pages/index` | 每日诗词、农历/公历、学习计划概览、随机推荐 |
| 文库 | `pages/library/index` | 作品 / 摘录 / 作者 / 诗单 / 典故 5 个 TAB |
| 文库 | `pages/library/detail`、`catalog`、`allusion-detail`、`collection-group`、`collection-detail` | 分类、目录、典故、诗单详情 |
| 诗词 | `pages/poem/index`、`pages/poem/detail` | 列表（搜索范围 + 类型 + 朝代筛选）、详情 |
| 课本 | `pages/book` | 按课本分组的诗词 |
| 诗人 | `pages/poet/index`、`pages/poet/detail` | 列表（朝代筛选）、详情 |
| 名句 | `pages/sentence/index`、`pages/sentence/detail` | 列表（主题 → 类型联动）、详情 |
| 搜索/字典 | `pages/search/index`、`pages/dictionary/index`、`detail`、`list` | 搜索、字典查询 |
| 发现 | `pages/find/index`、`today`、`feihua`、`feihua-detail`、`cipai`、`story-map`、`story-detail` | 今日、飞花令、词牌、诗人足迹 |
| 学习计划 | `pages/study/index`、`detail`、`stats` | 我的/推荐计划、复习、学习统计 |
| 旧背诵页 | `pages/schedule/index`、`detail` | 兼容保留，入口已由 `pages/study` 替代 |
| 个人中心 | `pages/me/index`、`collect`、`collections`、`collections/playlist-detail`、`setting`、`qrcode_login` | 我的、收藏、诗单、设置、扫码登录 |
| 其他 | `pages/post/index`、`pages/type/index`、`pages/poem/detail/index` | 静态内容、分类入口、旧详情重定向 |

### 核心组件

| 组件 | 说明 |
|------|------|
| `FilterCard` | 横向滚动 pill chip 筛选卡片（全部选项自动加分类前缀：`朝代：全部`、`类型：全部` 等） |
| `LibrarySearchBar` | 文库搜索栏（含搜索输入 + 朝代/类型/主题 筛选项；摘录 TAB 使用主题→类型层级联动） |
| `PoemSmallCard` | 诗词小卡片（content 字号 28px） |
| `PoemPlaylistCard` | 诗单卡片 |
| `SentenceCard` | 名句卡片 |

## 筛选体系设计要点

- **全部选项显示分类前缀**：`朝代：全部`、`类型：全部`、`范围：全部`、`主题：全部` —— 仅渲染层变化，内部值保持 `'全部'` 以兼容后端 11 处 `!== '全部'` 守卫逻辑
- **主题→类型层级联动**：选中主题时类型自动重置为全部，类型列表随主题动态变化；未选主题时仅显示"全部"
- **搜索范围精确匹配**：`_type=title|author|tag|content` 对应单字段正则，`_type=poem` 或缺省为标题+内容 `$or` 全文检索
- **FilterCard 默认选中兜底**：当初始 params 不含某筛选 key 时，`|| '全部'` 确保首 chip 高亮（已修复三处遗漏：mount effect、poem type row、poem dynasty row）

## 拼音转换

使用的是这个库：[pinyin-pro](https://github.com/zh-lx/pinyin-pro)

## 关于 Taro

[Taro](https://taro-docs.jd.com/) 是一个开放式跨端跨框架解决方案，支持使用 React/Vue/Nerv 等框架来开发 微信 / 京东 / 百度 / 支付宝 / 字节跳动 / QQ / 飞书 小程序 / H5 / RN 等应用。

## 接口约定

- 所有请求统一走 `src/apis/request.js`，resolve 的是后端响应体 `{ status, data, errmsg }`。
- 业务层统一用 `src/apis/response.js` 判断与解包：

  ```js
  // 按当前文件层级调整相对路径，例如页面为 ../../apis/response
  import { isApiSuccess, getApiData } from '../../apis/response';

  const apiData = getApiData(res);
  if (isApiSuccess(res) && apiData) { ... }
  ```

  不再在页面里散写 `res.status || res.statusCode === 200`、`res.data?.data || res.data`。
- 学习计划接口统一维护在 `src/services/study.js`，遵循 REST 语义：创建/新增 `POST`、更新 `PUT`、删除 `DELETE`。小程序 `wx.request` 支持 `PUT` / `DELETE`，后端 CORS 已放行，无需用 `POST` 模拟。

## 本地联调

1. 启动本地 API（依赖本机 MongoDB / Redis，默认 3000 端口）：

   ```bash
   cd ../gushi_api
   pnpm dev
   ```

2. 小程序 dev 环境默认请求 `http://localhost:3000`（见 `src/const/config.js` 的 `DEV_BASE_URL`）。真机预览时改成电脑局域网 IP，例如 `http://192.168.31.139:3000`。

3. 启动小程序 watch 构建，微信开发者工具导入项目根目录（`miniprogramRoot` 为 `dist/`）：

   ```bash
   pnpm dev:weapp
   ```

## 配置项

`src/const/constants.js` 文件存在几个配置项，可以根据需要进行修改。主要是请求 CDN 资源（图片等）加了限制，链接后面需要加 `auth_key` 才可以正常访问。

复制 `src/const/constants.js.example` 代码到 `src/const/constants.js` 文件中（该文件已加入 `.gitignore`，不会提交）。

```js
// 阿里云 oss url 校验 key 
export const OSS_URL_CHECK_KEY = ''
// CDN 域名
export const CDN_DOMAIN = ''
```

### Taro 版本更新

当前版本 3.6.25，升级后出现打包失败问题。

`taro info` 查看当前 cli 和项目的版本。 使用 `taro update self [版本号]` 和 `taro update project [版本号]` 来更新 cli 和项目的 taro 版本。

当taro版本>=3.5时，taro项目使用taro-ui的正确的配置方式是在config/index.js文件中排除taro-ui

```js
// config/index.js 
module.exports = {
  framework: 'react',
  compiler: {
    type: 'webpack5',
    prebundle: {
      exclude: ['taro-ui']
    }
  },
}
```

## 文件目录

- `apis`

  请求封装：`request.js`（统一请求）、`response.js`（响应判断/解包）、`uploadFile.js`

- `components`

  此目录是自定义业务组件

- `const`

  此目录是常用变量（朝代、分类、筛选等），`constants.js` 需从 `constants.js.example` 复制

- `images`

  此目录下是小程序所用的一些图标，可以的话可以改为雪碧图。

- `hooks`

  此目录下是一些自定义 hook

- `layout`

  页面布局壳组件

- `pages`

  此目录下为小程序主要内容，各页面 View 和 js 文件

- `services`

  API 请求实例：`global.js`（跨页通用）、`study.js`（学习计划，唯一实现）、`storyMap.js`（诗人足迹）。页面相关接口在相应目录下的 `service.js` 各自维护。

- `utils`

  自己封装的一些工具函数

## 作者

👤 **johnnyzhang1992**

- Website: [johnnyzhang.cn](https://xuegushi.com)
- Github: [@johnnyzhang1992](https://github.com/johnnyzhang1992)

## Show your support

Give a ⭐️ if this project helped you!

## License

Copyright © 2024 [johnnyzhang1992](https://github.com/johnnyzhang1992).

---

## 注意事项

- API 请求返回的数据尽量简洁
- 使用定时器时，当退出当前页面时应该注销（onHide,onUnload）
- 多页面引入相同的组件时，引入顺序要保存一致。
- scss 编写，尽量使用嵌套，否则会出现覆盖问题。（common.css 和 app-origin.css）

## API 使用指南

- API Get 类的方法可以正常使用，POST 类的请求需要用户 openid 不建议使用（例如：收藏以及个人中心相关接口。
- 用户创建失败的问题。创建用户的逻辑涉及后端解密(和项目的 appid 有关,不同的项目 appid 不同)，会导致解密失败，从而导致用户创建失败。

## 小程序二维码

![古诗文小助手](./src/images/xcx.jpg)
