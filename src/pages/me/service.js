import Request from '../../apis/request';
import UploadFile from '../../apis/uploadFile';

/**
 * 创建新用户
 * @param {String} method POST
 * @param {Object} data {}
 */
export const createUser = (method, data) => {
	return Request('/wxxcx/userCrate', data, method);
};

/**
 * 获取小程序码
 * @param {String} method GET
 * @param {Object} data {}
 */
export const GET_WX_QRCODE = (method, data) => {
	return Request(`/wxxcx/getWXACode/`, data, method);
};

/**
 * 获取用户的基本信息
 * @param {String} method GET
 * @param {Object} data {}
 */
export const fetchUserInfo = (method, data) => {
	return Request(`/wxxcx/getUserInfo/${data.user_id}`, data, method);
};

/**
 * 获取我的收藏信息(诗词、名句、诗人)
 * @param {String} method GET
 * @param {Object} data
 */
export const fetchUserCollect = (method, data) => {
	return Request(`/wxxcx/getCollect/${data.user_id}`, data, method);
};

/**
 * 更新收藏状态
 * @param {String} method POST
 * @param {number} id
 * @param {number} user_id
 * @param {poem,sentence,author} type
 */
export const updateUserCollect = (method, data) => {
	return Request(`/wxxcx/updateCollect/${data.type}`, data, method);
};

/**
 * 更新用户信息
 * @param {*} method
 * @param {*} data {nickName, avatar}
 * @returns
 */
export const updateUserInfo = (method, data) => {
	return Request(`/wxxcx/user/updateInfo`, data, method);
};

/**
 * 上传头像
 * @param {*} method
 * @param {*} data
 * @returns
 */
export const uploadAvatar = (method, data) => {
	return UploadFile(`/wxxcx/user/uploadAvatar`, data, method);
};
