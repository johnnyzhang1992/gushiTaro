import Taro from '@tarojs/taro';

import { BaseUrl } from '../const/config';

const request = (url, params, method = 'GET') => {
	const user = Taro.getStorageSync('user') || {};
	const wxToken = Taro.getStorageSync('wx_token');
	const { hostUrl, ...restParams } = params || {};
	let data = {
		...restParams,
		openId: user.openId || user.openid || '',
		openid: user.openid || '',
		wx_token: wxToken || '',
		user_id: user.user_id || -1,
	};
	if (hostUrl) {
		data = {
			...data,
			...restParams,
		};
	}
	console.log('--api--request:', url, method, hostUrl);
	return Taro.request({
		url: (hostUrl || BaseUrl) + url, //仅为示例，并非真实的接口地址
		enableCache: true, // API 支持度: weapp, tt
		credentials: true, // 设置是否携带 Cookie API 支持度: h5
		data: data,
		method: method,
		header: {
			'content-type': 'application/json', // 默认值,
		},
		success: (res) => {
			if (res && [200, 401].includes(res.statusCode)) {
				const statusCode = res.statusCode;
				if (statusCode == 401) {
					console.log('当前token过期', res.data);
					Taro.removeStorageSync('user');
					Taro.removeStorageSync('wx_token');
					const pages = Taro.getCurrentPages() || [];
					Taro.showModal({
						title: '提示',
						content: '当前登录已过期,请重新登录！',
						confirmText: '去登录',
						success: function (_res) {
							if (_res.confirm) {
								console.log('用户点击确定');
								Taro.setStorageSync(
									'preLoginPath',
									pages[pages.length - 1]['$taroPath']
								);
								Taro.switchTab({
									url: '/pages/me/index',
								});
							} else if (_res.cancel) {
								console.log('用户点击取消');
							}
						},
					});
				}
			} else {
				console.log('--请求报错：', res.data);
				let errorText = (res.data && res.data.errmsg) || '服务器报错，请稍后再试！';
				if (res.statusCode == 503 || res.statusCode == 429) {
					errorText = '当前IP访问频繁，稍后再试！'
				}
				Taro.showToast({
					title: errorText,
					icon: 'none',
					duration: 2000,
				});
			}
		},
		fail: (res) => {
			console.log(res);
		},
	});
};

export default request;
