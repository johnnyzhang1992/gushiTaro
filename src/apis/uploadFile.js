import Taro from '@tarojs/taro';

import { BaseUrl } from '../const/config';

const UploadFile = (url, params) => {
	const { name, filePath } = params;
	const user = Taro.getStorageSync('user') || {};
	// 与 request.js 一致：常规登录存 user.token，扫码登录只存 wx_token
	const token = user.token || Taro.getStorageSync('wx_token');
	return Taro.uploadFile({
		timeout: 120000,
		url: BaseUrl + '/miniapp' + url,
		filePath: filePath,
		name: name,
		formData: {
			...params,
		},
		header: {
			// 不手写 content-type：由微信/浏览器自动生成 multipart boundary
			'Authorization': token ? `Bearer ${token}` : '',
		},
		success: (res) => {
			console.log(res);
		},
		fail: (error) => {
			console.group('文件上传ErrorLog：');
			console.log(error);
			console.groupEnd();
		},
	});
};

export default UploadFile;
