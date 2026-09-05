import Taro from '@tarojs/taro';

import { BaseUrl, WxAppVersion, isDevEnv } from '../const/config';

// 生产环境静默日志
const DEBUG = isDevEnv();

const request = (url, params, method = 'GET') => {
	const user = Taro.getStorageSync('user') || {};
	// 常规登录存 user.token，扫码登录只存 wx_token，两者取其一
	const token = user.token || Taro.getStorageSync('wx_token');
	const data = { ...(params || {}) };
	if (DEBUG) console.log('--api--request:', url, method);
	return new Promise((resolve, reject) => {
		Taro.request({
			url: (hostUrl || BaseUrl) + '/miniapp' + url,
			enableCache: true,
			credentials: true,
			data: data,
			method: method,
			header: {
				'content-type': 'application/json',
				'Authorization': token ? `Bearer ${token}` : '',
			},
			success: (res) => {
				if (DEBUG) console.log('--api--response:', url, res.statusCode, res.data);
				if (res && res.statusCode === 200) {
					resolve(res.data);
				} else if (res && res.statusCode === 401) {
					if (DEBUG) console.log('当前token过期', res.data);
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
					reject(res.data);
				} else {
					if (DEBUG) console.log('--请求报错：', res.data);
					let errorText = (res.data && res.data.errmsg) || '服务器报错，请稍后再试！';
					if (res.statusCode == 503 || res.statusCode == 429) {
						errorText = '当前IP访问频繁，稍后再试！'
					}
					Taro.showToast({
						title: errorText,
						icon: 'none',
						duration: 2000,
					});
					reject(res.data);
				}
			},
			fail: (res) => {
				if (DEBUG) console.log('请求失败:', res);
				reject(res);
			},
		});
	});
};

export default request;
