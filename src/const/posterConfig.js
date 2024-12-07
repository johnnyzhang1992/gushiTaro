export const initConfig = {
  type: 'default', // default center letter horizontal
  showQrcode: true,
  letterBorder: 'default', // redBorder blankBorder
  // bgColor: '#f0f0f4',
  bgImg: '', // 背景图
  showBg: false,
  bgColor: '#ffffff',
  fontColor: '#333',
  ratio: 1, // 显示比例 0.75 0.46
};

export const postBgColorArr = [
  'rgba(255,255,255)',
  'rgba(251,248,234)',
  'rgba(244,213,121)',
  'rgba(210,155,80)',
  'rgba(131,109,113)',
  'rgba(152,91,87)',
  'rgba(204,75,50)',
  'rgba(124,25,28)',
  'rgba(172,177,153)',
  'rgba(201,224,182)',
  'rgba(91,162,150)',
  'rgba(68,123,122)',
  'rgba(58,1114,56)',
  'rgba(19,46,73)',
];

// 背景图
export const postBgImages = [
  'https://assets.xuegushi.com/images/poster_bg.png',
  'https://assets.xuegushi.com/images/poster_bg1.png',
];

// 边框颜色配置
export const letterLayoutConfig = [
  {
    name: 'default',
    color: '#333',
  },
  {
    name: 'center',
    color: '#333',
  },
  {
    name: 'horizontal',
    color: '#333',
  },
  {
    name: 'blackBorder',
    color: '#212321',
  },
  {
    name: 'redBorder',
    color: '#c01112',
  },
];

// 字体颜色
export const fontColorArr = ['#fff', '#333'];

// 模式
export const ratioConfig = [
  {
    name: '默认',
    value: 1,
  },
  {
    name: '小红书',
    value: 0.75,
  },
  {
    name: '手机壁纸',
    value: 0.4615,
  },
];
