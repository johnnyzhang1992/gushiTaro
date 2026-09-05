import Taro from '@tarojs/taro';

/**
 * 判断是否已登录（静默，不弹窗）
 * 登录态以 token 为准：常规登录写入 user.token，扫码登录只写 wx_token
 */
export const isLoggedIn = () => {
	const user = Taro.getStorageSync('user') || {};
	return !!(user.token || Taro.getStorageSync('wx_token'));
};

/**
 * 判断用户是否登录
 * @param {string} path 当前页面路由
 */
export const userIsLogin = () => {
	const user = Taro.getStorageSync('user') || {};
	const pages = Taro.getCurrentPages() || [];
	console.log(pages);
	if (!user.uid) {
		Taro.showModal({
			title: '提示',
			content: '您当前还未登录哦！',
			confirmText: '去登录',
			success: function (res) {
				if (res.confirm) {
					console.log('用户点击确定');
					Taro.setStorageSync(
						'preLoginPath',
						pages[pages.length - 1]['$taroPath']
					);
					Taro.switchTab({
						url: '/pages/me/index',
					});
				} else if (res.cancel) {
					console.log('用户点击取消');
				}
			},
		});
		return false;
	}
	return true;
};
