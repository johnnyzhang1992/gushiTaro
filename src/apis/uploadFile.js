import Taro from '@tarojs/taro';

import { BaseUrl } from '../const/config';

const UploadFile = (url, params) => {
	const { name, filePath } = params;
	const user = Taro.getStorageSync('user') || {};
	const wxToken = Taro.getStorageSync('wx_token');
	return Taro.uploadFile({
		timeout: 120000,
		url: BaseUrl + url,
		filePath: filePath, // 要上传文件资源的路径 (本地路径)
		name: name, // 文件对应的 key，开发者在服务端可以通过这个 key 获取文件的二进制内容
		formData: {
			...params,
			user_id: user.user_id,
			openId: user.openId,
			wx_token: wxToken,
		}, //额外的其他参数
		header: {
			'content-type': 'multipart/form-data', // 默认值
		},
		success: (res) => {
			console.log(res);
			//成功失败都resolve，并通过succeeded字段区分
		},
		fail: (error) => {
			console.group('文件上传ErrorLog：');
			console.log(error);
			console.groupEnd();
		},
	});
};

export default UploadFile;
