# 古诗文小助手（微信小程序）

这个是[学古诗](https://xuegushi.com) 网站的微信小程序。

该小程序的目的是为了大家更方便简洁的学习中国传统古诗文，同时通过这些代码更多的学习使用小程序。

> 该项目为 Taro 重构版，[原版本](https://github.com/johnnyzhang1992/gushi_lite) 在项目上线后会不再维护。

> 项目当前第一版已于2023年12月4日上线。
> 移除诗词朗读功能。（官方解释：小程序服务内容涉及【有声读物】，属个人主体尚未开放服务类目

## 拼音转换

使用的是这个库：[pinyin-pro](https://github.com/zh-lx/pinyin-pro) ，然后再腾讯云配合云函数实现的。

拼音接口是按量收费的，恳请大家手下留情，不要暴力爬取！！！本来赚那点广告费，这样搞有些服务只能停掉了！！！

## 关于 Taro

[Taro](https://taro-docs.jd.com/) 是一个开放式跨端跨框架解决方案，支持使用 React/Vue/Nerv 等框架来开发 微信 / 京东 / 百度 / 支付宝 / 字节跳动 / QQ / 飞书 小程序 / H5 / RN 等应用。

### Taro 版本更新

`taro info` 查看当前cli和项目的版本。 使用 `taro update self [版本号]` 和 `taro update project [版本号]` 来更新cli和项目的taro 版本。

## 文件目录

- `apis`

  API 接口统一请求文件

- `component`

  此目录是自定义组件部分

- `const`

  此目录是常用变量，包括：朝代、分类等数据

- `images`

  此目录下是小程序所用的一些图标，可以的话可以改为雪碧图。

- `hooks`

  此目录下是一些自定义 hook

- `pages`

  此目录下为小程序主要内容，各页面 View 和 js 文件

- `services`

  API 请求实例，该目录主要存放全局请求相关的方法。页面相关的在相应目录下会存在 `service.js` 各自维护。

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
