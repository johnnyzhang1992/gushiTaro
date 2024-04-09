export default {
  navigationBarTitleText: '首页',
  navigationBarTextStyle: 'white',
  enablePullDownRefresh: false,
  enableShareAppMessage: true,
	enableShareTimeline: true,
	renderer: 'skyline',
  navigationStyle: 'custom',
  componentFramework: 'glass-easel',
  component: true,
  styleIsolation: 'apply-shared',
  rendererOptions: {
    skyline: {
      defaultDisplayBlock: true,
      styleIsolation: 'apply-shared',
    },
  },
};
