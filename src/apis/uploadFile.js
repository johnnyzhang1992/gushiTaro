import Taro from '@tarojs/taro';

import { BaseUrl } from '../const/config';

const UploadFile = (url, params) => {
	const { name, filePath } = params;
	const user = Taro.getStorageSync('user') || {};
	const token = user.token;
	return Taro.uploadFile({
		timeout: 120000,
		url: BaseUrl + url,
		filePath: filePath,
		name: name,
		formData: {
			...params,
		},
		header: {
			'content-type': 'multipart/form-data',
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
