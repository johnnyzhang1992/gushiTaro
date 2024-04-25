# 古诗音频播放组件

记录一些产品思路和设想。（不一定所有的功能都会实现）

## 主要组件拆分

1、底部的播放组件
2、展开包含诗词内容的组件
3、缩小的、可拖拽的小组件(播放中，可展开显示名称、可关闭)
4、播放列表、历史播放记录

## 延伸功能

1、听诗模块
2、诗单一键播放

## 其他

1、使用背景音频？还是普通的音频播放？
2、使用本地缓存记录当前播放信息
当前播放诗词信息，音频设置，播放进度都实时缓存到本地（后台同步到数据库）

```js
// 当前播放音频信息
const currentAudio = {
 author_name: '',
 title: '',
 dynasty: '',
 xu: '',
 content: [],
 audio_url: '',
 play_time: '',
 duration: '',
};
const audioSetting = {
 rate: 1, // 0.5 - 2
 speaker: '',
 loopMode: '', // 列表循环、单曲循环，当前播放
 loop: false,
 autoPlay: false,
 obeyMuteSwitch: false,
 volume: 1, // 0-1
}
const audioMode = '' // normal 正常 min 缩小可拖拽 min-open 缩小展开(展示诗词名称和关闭按钮) 
```
