import Taro from '@tarojs/taro';

import { BaseUrl } from '../const/config';
import logger from './logger';
import { getDeviceInfo } from './tool';

/**
 * 全局静默登录单例
 *
 * 解决时序问题：app 启动时 Taro.login → /api/user/userInfo 换取 token 是异步的，
 * 页面 useLoad 的请求若不等登录完成就发出，会拿不到 token（未登录态数据）。
 *
 * 用法：ensureLoginReady() 返回全局唯一 Promise，首次调用触发登录流程，
 * 后续调用（含并发）复用同一个 Promise。
 */

let loginPromise = null;

// 弱网登录风暴节流：上次登录失败后 10 秒内的并发调用不再重复触发完整登录，
// 直接以无 token 状态返回（请求方按未登录逻辑继续，行为兼容）
const RETRY_THROTTLE_MS = 10 * 1000;
let lastAttemptAt = 0;
let lastAttemptFailed = false;

/**
 * 触发静默登录：code → /api/user/userInfo → token 写入 storage
 */
const doLogin = () => {
	return new Promise((resolve) => {
		Taro.login({
			success: (res) => {
				logger.debug('[app-login] code:', res.code ? '获取成功' : '失败');
				if (!res.code) return resolve(false);
				const deviceInfo = getDeviceInfo();

				// 直接用 Taro.request（不走 apis/request 封装）：
				// 封装内会 await ensureLoginReady()，而本函数正是 ensureLoginReady
				// 的执行体，走封装会自己等自己造成死锁
				Taro.request({
					url: BaseUrl + '/miniapp/api/user/userInfo',
					data: { code: res.code, ...deviceInfo },
					method: 'GET',
					header: { 'content-type': 'application/json' },
					success: (res2) => {
						const result = res2.data || {};
						const apiData = result.data || result;
						logger.debug('[app-login] userInfo 返回:', apiData?.uid || '无用户');

						if (apiData && apiData.uid) {
							const token = apiData.token || apiData.wx_token;
							const userData = { ...apiData, token };
							Taro.setStorageSync('user', userData);
							Taro.setStorageSync('wx_token', token);
							logger.debug('[app-login] ✅ 登录成功');
							return resolve(true);
						}
						// 用户不存在：不自动注册，由用户在个人中心手动登录
						logger.debug('[app-login] 用户不存在，等待用户手动登录');
						resolve(false);
					},
					fail: (err) => {
						logger.debug('[app-login] 获取用户信息失败:', err);
						resolve(false);
					},
				});
			},
			fail: (err) => {
				logger.debug('[app-login] Taro.login 失败:', err);
				resolve(false);
			},
		});
	});
};

/**
 * 确保静默登录完成（全局单例，可安全并发调用）
 * 保持原行为：每次冷启动都调 userInfo 接口（新 code 换新 token + 刷新用户信息）
 * - 单例保证一次启动只登录一次，并发调用复用同一个 Promise
 * - 弱网节流：上次登录失败且距上次尝试不足 10 秒时，直接返回 Promise.resolve(false)
 *   （请求方以无 token 继续，行为兼容）；超过 10 秒才允许真正重试
 */
export const ensureLoginReady = () => {
	if (
		!loginPromise &&
		lastAttemptFailed &&
		Date.now() - lastAttemptAt < RETRY_THROTTLE_MS
	) {
		logger.debug('[app-login] 距上次登录失败不足 10 秒，跳过本次重试');
		return Promise.resolve(false);
	}
	if (!loginPromise) {
		lastAttemptAt = Date.now();
		loginPromise = doLogin().then((ok) => {
			lastAttemptFailed = !ok;
			// 登录失败后允许下次重试（如网络恢复后重新进入页面）
			if (!ok) loginPromise = null;
			return ok;
		});
	}
	return loginPromise;
};

/**
 * 重置登录单例（如退出登录后需要重新静默登录时使用），同时清除失败节流记录
 */
export const resetLoginPromise = () => {
	loginPromise = null;
	lastAttemptAt = 0;
	lastAttemptFailed = false;
};

/**
 * 微信注册/登录（走原始 Taro.request，绕开 apis/request 的静默登录）
 *
 * 为什么不能用 apis/request：它内部会先 await ensureLoginReady()，
 * 而 ensureLoginReady 会再调一次 Taro.login，等于在注册前多消耗一个 code；
 * 若两次 Taro.login 返回同一个 code（真机/审核环境会出现），
 * 前一次已把 code 用掉，注册就会失败并提示「注册用户失败」。
 *
 * @param {object} extra 额外上报字段（如 systemInfo）
 * @returns {Promise<{ok:boolean,data?:object,message?:string}>}
 */
export const registerByWxCode = (extra = {}, retry = 1) =>
	new Promise((resolve) => {
		Taro.login({
			success: (res) => {
				if (!res.code) {
					logger.reportError('[register] Taro.login 未返回 code');
					return resolve({ ok: false, message: '微信登录失败，请重试' });
				}
				logger.report('[register] 发起注册', { hasCode: true, retry });

				Taro.request({
					url: BaseUrl + '/miniapp/api/user/create',
					method: 'POST',
					data: { code: res.code, ...extra },
					header: { 'content-type': 'application/json' },
					success: async (r) => {
						const body = r.data || {};
						const data = body.data || body;

						if (r.statusCode === 200 && data && data.uid) {
							const token = data.token || data.wx_token;
							const userData = { ...data, token };
							Taro.setStorageSync('user', userData);
							Taro.setStorageSync('wx_token', token);
							// 登录态已变，重置静默登录单例，后续请求按新 token 走
							resetLoginPromise();
							logger.report('[register] 成功', { uid: data.uid });
							return resolve({ ok: true, data: userData });
						}

						const message = body.errmsg || body.msg || '注册失败，请稍后重试';
						logger.reportError('[register] 失败', {
							status: r.statusCode,
							message,
							retryLeft: retry,
						});

						// code 失效/服务端 5xx 时，用全新 code 重试一次（提审环境偶发）
						const retryable =
							retry > 0 &&
							(r.statusCode >= 500 ||
								/invalid code|code been used|40029|40163/i.test(String(message)));
						if (retryable) {
							return resolve(await registerByWxCode(extra, retry - 1));
						}

						resolve({ ok: false, message });
					},
					fail: (err) => {
						logger.reportError('[register] 网络失败', { errMsg: err && err.errMsg });
						resolve({ ok: false, message: '网络异常，请稍后重试' });
					},
				});
			},
			fail: (err) => {
				logger.reportError('[register] Taro.login 失败', { errMsg: err && err.errMsg });
				resolve({ ok: false, message: '微信登录失败，请重试' });
			},
		});
	});
