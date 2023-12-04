import Taro from '@tarojs/taro';

import { BaseUrl } from '../const/config';

const request = (url, params, method = 'GET') => {
	const user = Taro.getStorageSync('user') || {};
	const wxToken = Taro.getStorageSync('wx_token');
	let data = {
		...params,
		openId: user.openId || '',
		wx_token: wxToken || '',
		user_id: user.user_id || -1,
	};
	console.log('--api--request:', url, method);
	return Taro.request({
		url: BaseUrl + url, //仅为示例，并非真实的接口地址
		enableCache: true, // API 支持度: weapp, tt
		credentials: true, // 设置是否携带 Cookie API 支持度: h5
		data: data,
		method: method,
		header: {
			'content-type': 'application/json', // 默认值,
		},
		success: (res) => {
			if (res && res.statusCode === 200) {
				const { error_code } = res.data;
				if (error_code && error_code == 401) {
					console.log('当前token过期', res.data)
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
				console.log('--请求报错：', res.data)
			}
		},
	});
};


export default request;
