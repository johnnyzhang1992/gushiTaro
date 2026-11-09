import Taro from '@tarojs/taro';

import { BaseUrl } from '../const/config';
import logger from '../utils/logger';

const UploadFile = (url, params) => {
	// formData 剔除上传专有的 name/filePath 字段，避免透传给后端
	const { name, filePath, ...formData } = params;
	const user = Taro.getStorageSync('user') || {};
	// 与 request.js 一致：常规登录存 user.token，扫码登录只存 wx_token
	const token = user.token || Taro.getStorageSync('wx_token');
	return new Promise((resolve, reject) => {
		Taro.uploadFile({
			timeout: 120000,
			url: BaseUrl + '/miniapp' + url,
			filePath: filePath,
			name: name,
			formData: {
				...formData,
			},
			header: {
				// 不手写 content-type：由微信/浏览器自动生成 multipart boundary
				'Authorization': token ? `Bearer ${token}` : '',
			},
			success: (res) => {
				logger.debug(res);
				// 成功：resolve Taro 原始 res（调用方自行检查 statusCode 并解析 res.data，契约不变）
				if (res.statusCode === 200) {
					resolve(res);
					return;
				}
				if (res.statusCode === 401) {
					// 登录过期：清除本地登录态并提示（不弹登录框，保持简单）
					Taro.removeStorageSync('user');
					Taro.removeStorageSync('wx_token');
					Taro.showToast({
						title: '登录已过期',
						icon: 'none',
						duration: 2000,
					});
					reject(res);
					return;
				}
				const errorText =
					res.statusCode == 503 || res.statusCode == 429
						? '当前IP访问频繁，稍后再试！'
						: '上传失败，请稍后再试';
				Taro.showToast({
					title: errorText,
					icon: 'none',
					duration: 2000,
				});
				reject(res);
			},
			fail: (error) => {
				logger.error(error);
				Taro.showToast({
					title: '网络异常，请稍后再试',
					icon: 'none',
					duration: 2000,
				});
				reject(error);
			},
		});
	});
};

export default UploadFile;
