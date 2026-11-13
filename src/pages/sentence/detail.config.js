export default {
	navigationBarTitleText: '名句 | 古诗文小助手',
	enableShareAppMessage: true,
	enableShareTimeline: true,
	// 全局 window 开了页面级下拉，本页无刷新 hook，关掉避免无人 stop 的常驻指示器
	enablePullDownRefresh: false,
	navigationStyle: 'custom',
	renderer: 'skyline',
	componentFramework: 'glass-easel',
	component: true,
	rendererOptions: {
		skyline: {
			defaultDisplayBlock: true,
			defaultContentBox: true,
			disableABTest: true,
		},
	},
};
