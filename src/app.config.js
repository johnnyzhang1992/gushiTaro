export default {
  pages: [
    'pages/index',
    'pages/book',
    'pages/me/index',
    'pages/me/collect',
    'pages/search/index',
    'pages/poet/index',
    'pages/poet/detail',
    'pages/poem/index',
    'pages/poem/detail',
    'pages/poem/detail/index',
    'pages/sentence/index',
    'pages/sentence/detail',
    'pages/post/index',
    'pages/me/setting/index',
    'pages/admin/index',
    'pages/admin/search',
    'pages/find/index',
    'pages/library/index',
    'pages/me/fonts/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#337ab7',
    navigationBarTitleText: '古诗文小助手',
    navigationBarTextStyle: 'white',
    enablePullDownRefresh: true,
    onReachBottomDistance: 40,
  },
  tabBar: {
    selectedColor: '#337ab7',
    position: 'bottom',
    list: [
      {
        pagePath: 'pages/index',
        text: '首页',
        iconPath: 'images/icon/home.png',
        selectedIconPath: 'images/icon/home_active.png',
      },
      {
        pagePath: 'pages/find/index',
        text: '发现',
        iconPath: 'images/icon/find.png',
        selectedIconPath: 'images/icon/find_active.png',
      },
      // {
      //   pagePath: 'pages/library/index',
      //   text: '文库',
      //   iconPath: 'images/icon/library.png',
      //   selectedIconPath: 'images/icon/library_active.png',
      // },
      {
        pagePath: 'pages/me/index',
        text: '我',
        iconPath: 'images/icon/my.png',
        selectedIconPath: 'images/icon/my_active.png',
      },
    ],
  },
  lazyCodeLoading: 'requiredComponents',
  requiredBackgroundModes: ['audio'],
  style: 'v2',
  rendererOptions: {
    skyline: {
      defaultDisplayBlock: true,
      disableABTest: true,
      sdkVersionBegin: '3.0.1',
      sdkVersionEnd: '15.255.255',
    },
  },
};
