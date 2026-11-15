import Taro from '@tarojs/taro';

import { logoutUser, deleteUserAccount } from '../services/global';
import { isApiSuccess, getApiData } from '../apis/response';

// 清除本地登录态（用户信息 / token / 登录前路径）
export const clearLoginState = () => {
	Taro.removeStorageSync('user');
	Taro.removeStorageSync('wx_token');
	Taro.removeStorageSync('preLoginPath');
};

/**
 * 退出登录：先通知服务端，再清本地登录态
 * 服务端失败也继续本地退出，避免卡在已过期 token 上
 */
export const requestLogout = async () => {
	try {
		await logoutUser('POST');
	} catch (err) {
		console.log('[logout] 服务端退出失败，忽略并清理本地登录态', err);
	}
	clearLoginState();
};

/**
 * 注销账号：服务端清理数据并解绑/删除账号，成功后清本地登录态
 * @returns {Promise<{keep_account?: boolean}>} keep_account=true 表示账号仍保留（仅解绑微信）
 */
export const requestDeleteAccount = async () => {
	const res = await deleteUserAccount('POST');
	const data = getApiData(res) || {};
	if (!isApiSuccess(res)) {
		throw new Error((data && data.errmsg) || '注销失败');
	}
	clearLoginState();
	return data;
};
