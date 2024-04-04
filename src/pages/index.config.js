export default {
  renderer: 'skyline',
  navigationBarTitleText: '首页',
  navigationBarTextStyle: 'white',
  enablePullDownRefresh: false,
  enableShareAppMessage: true,
  enableShareTimeline: true,
  navigationStyle: 'custom',
  componentFramework: 'glass-easel',
  component: true,
  styleIsolation: 'apply-shared',
  rendererOptions: {
    skyline: {
			defaultDisplayBlock: true,
			component: true,
			styleIsolation: 'apply-shared',
    },
  },
};
