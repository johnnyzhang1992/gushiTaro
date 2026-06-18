import Taro from '@tarojs/taro';

import { BaseUrl, WxAppVersion } from '../const/config';

const request = (url, params, method = 'GET') => {
	const user = Taro.getStorageSync('user') || {};
	const token = user.token;
	const { hostUrl, ...restParams } = params || {};
	let data = {
		...restParams,
	};
	if (hostUrl) {
		data = {
			...data,
			...restParams,
		};
	}
	console.log('--api--request:', url, method, hostUrl);
	return Taro.request({
		url: (hostUrl || BaseUrl) + url,
		enableCache: true,
		credentials: true,
		data: data,
		method: method,
		header: {
			'content-type': 'application/json',
			'Authorization': token ? `Bearer ${token}` : '',
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
								Taro.setStorageSync(
									'preLoginPath',
									pages[pages.length - 1]['$taroPath']
								);
								Taro.switchTab({
									url: '/pages/me/index',
								});
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
