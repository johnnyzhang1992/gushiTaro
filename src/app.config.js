export default {
	pages: [
		"pages/index",
		"pages/me/index",
		"pages/search/index",
		"pages/poem/index"
	],
	window: {
		backgroundTextStyle: "light",
		navigationBarBackgroundColor: "#337ab7",
		navigationBarTitleText: "古诗文小助手",
		navigationBarTextStyle: "white",
		enablePullDownRefresh: true,
		onReachBottomDistance: 40,
	},
	tabBar: {
		selectedColor: "#337ab7",
		position: "bottom",
		list: [
			{
				pagePath: "pages/index",
				text: "首页",
				iconPath: "images/icon/home.png",
				selectedIconPath: "images/icon/home_active.png",
			},
			{
				pagePath: "pages/search/index",
				text: "搜索",
				iconPath: "images/icon/find.png",
				selectedIconPath: "images/icon/find_active.png",
			},
			{
				pagePath: "pages/me/index",
				text: "我",
				iconPath: "images/icon/my.png",
				selectedIconPath: "images/icon/my_active.png",
			},
		],
	},
	lazyCodeLoading: 'requiredComponents',
};
