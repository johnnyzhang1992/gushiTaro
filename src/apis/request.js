import Taro from '@tarojs/taro';

import { BaseUrl } from '../const/config';

const request = (url, params, method = 'GET') => {
	const user = Taro.getStorageSync('user') || {};
	const wxToken = Taro.getStorageSync('wx_token');
	let data = {
		...params,
		openId: user.openId,
		wx_token: wxToken,
		user_id: user.user_id,
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
		}
	});
};

export default request;
