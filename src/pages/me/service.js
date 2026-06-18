import Request from '../../apis/request';
import UploadFile from '../../apis/uploadFile';

// 创建用户
export const createUser = (method, data) => {
	return Request('/api/user/create', data, method);
};

// 获取小程序码
export const GET_WX_QRCODE = (method, data) => {
	return Request(`/wxxcx/getWXACode/`, data, method);
};

// 获取用户信息
export const fetchUserInfo = (method, data) => {
	return Request(`/api/user/userInfo`, data, method);
};

// 获取我的收藏
export const fetchUserCollect = (method, data) => {
	return Request(`/api/favorites`, data, method);
};

// 更新收藏状态
export const updateUserCollect = (method, data) => {
	return Request(`/api/favorites/toggle`, data, method);
};

// 更新用户信息
export const updateUserInfo = (method, data) => {
	return Request(`/api/user/updateInfo`, data, method);
};

// 上传头像
export const uploadUserAvatar = (method, data) => {
	return UploadFile(`/api/user/updateAvatar`, data, method);
};

// 更新二维码状态
export const updateQRCodeStatus = (method = 'POST', data) => {
	return Request(`/api/user/updateQRCodeStatus`, data, method);
};

// 授权二维码登录
export const handleQRCodeLogin = (method = 'POST', data) => {
	return Request(`/api/user/loginByQRCode`, data, method);
}
