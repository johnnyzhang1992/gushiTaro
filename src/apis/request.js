import Taro from '@tarojs/taro';

import { BaseUrl, WxAppVersion, isDevEnv } from '../const/config';
import { ensureLoginReady } from '../utils/login';

// 生产环境静默日志
const DEBUG = isDevEnv();

// 未登录/过期弹窗去重：并发多个 401 只弹一次
let showingAuthModal = false;

const request = (url, params, method = 'GET') => {
	const data = { ...(params || {}) };
	if (DEBUG) console.log('--api--request:', url, method);

	// 发请求时实时读 token（登录完成后 storage 里即为新 token）
	const readToken = () => {
		const user = Taro.getStorageSync('user') || {};
		// 常规登录存 user.token，扫码登录只存 wx_token，两者取其一
		return user.token || Taro.getStorageSync('wx_token');
	};

	const send = (token) => {
		return new Promise((resolve, reject) => {
			Taro.request({
				url: BaseUrl + '/miniapp' + url,
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
					// 先判断本地是否曾有登录态，用于区分文案（从未登录 vs 登录已过期）
					const hadToken = !!(
						(Taro.getStorageSync('user') || {}).token || Taro.getStorageSync('wx_token')
					);
					Taro.removeStorageSync('user');
					Taro.removeStorageSync('wx_token');
					const pages = Taro.getCurrentPages() || [];
					if (!showingAuthModal) {
						showingAuthModal = true;
						Taro.showModal({
							title: '提示',
							content: hadToken ? '当前登录已过期,请重新登录！' : '登录后即可使用该功能',
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
							complete: function () {
								showingAuthModal = false;
							},
						});
					}
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

	// 全局顺序保证：所有接口都等静默登录（/api/user/userInfo 换取 token）完成后再发。
	// ensureLoginReady 是单例 Promise：登录中则等待；已完成时 await 仅为微任务开销，无感知。
	return ensureLoginReady().then(() => send(readToken()));
};

export default request;
