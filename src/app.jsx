import Taro, { useLaunch, usePageNotFound } from '@tarojs/taro';

import './app.scss';

import Request from './apis/request';
import { getDeviceInfo } from './utils/tool';

const App = (props) => {
	// 用户登录
	const userLogin = () => {
		Taro.login({
			success: (res) => {
				console.log('[app-login] code:', res.code ? '获取成功' : '失败');
				const deviceInfo = getDeviceInfo();
				
				// 第一步：尝试获取用户信息
				Request('/api/user/userInfo', {
					code: res.code,
					...deviceInfo,
				}, 'GET')
					.then((result) => {
						const apiData = result.data?.data || result.data;
						console.log('[app-login] userInfo 返回:', apiData?.uid || apiData?.user_id || '无用户');
						
						if (apiData && (apiData.user_id || apiData.uid)) {
							// 用户存在，直接登录
							console.log('[app-login] ✅ 用户已存在，登录成功');
							const token = apiData.token || apiData.wx_token;
							const userData = { ...apiData, token };
							Taro.setStorageSync('user', userData);
							Taro.setStorageSync('wx_token', token);
							return;
						}
						
						// 第二步：用户不存在，走注册逻辑
						console.log('[app-login] 用户不存在，开始注册...');
						Request('/api/user/create', {
							code: res.code,
							iv: '',
							encryptedData: '',
							systemInfo: JSON.stringify(deviceInfo),
						}, 'POST')
							.then((regResult) => {
								const regData = regResult.data?.data || regResult.data;
								console.log('[app-login] register 返回:', regData?.uid || regData?.user_id || '注册失败');
								
								if (regData && (regData.user_id || regData.uid)) {
									console.log('[app-login] ✅ 注册成功');
									const token = regData.token || regData.wx_token;
									const userData = { ...regData, token };
									Taro.setStorageSync('user', userData);
									Taro.setStorageSync('wx_token', token);
								} else {
									console.log('[app-login] ❌ 注册失败');
								}
							})
							.catch((err) => {
								console.log('[app-login] 注册请求失败:', err);
							});
					})
					.catch((err) => {
						console.log('[app-login] 获取用户信息失败:', err);
					});
			},
			fail: (err) => {
				console.log('[app-login] Taro.login 失败:', err);
			},
		});
	};

	useLaunch((options) => {
		console.log('onLaunch', options);
		Taro.setStorageSync('enterPath', options.path);
		Taro.getSystemInfo().then((sysRes) => {
			Taro.setStorageSync('sys_info', sysRes);
		});
		userLogin();
	});

	// useDidShow(() => {});
	usePageNotFound(() => {
		Taro.switchTab({
			url: '/pages/index',
		}); // 如果是 tabbar 页面，请使用 Taro.switchTab
	});

	// 版本更新------
	const updateManager = Taro.getUpdateManager();
	// 强制更新
	updateManager.onCheckForUpdate(function (res) {
		// 请求完新版本信息的回调
		// console.log(res.hasUpdate)
		if (!res.hasUpdate) {
			console.log('-----无更新---');
		}
	});
	// 更新完成
	updateManager.onUpdateReady(function () {
		Taro.showModal({
			title: '更新提示',
			content: '新版本已经准备好，是否重启应用？',
			success: function (res) {
				if (res.confirm) {
					// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
					updateManager.applyUpdate();
				}
			},
			fail: function () {
				console.log('---取消了更新');
			},
		});
	});
	// 更新失败
	updateManager.onUpdateFailed(function () {
		// 新的版本下载失败
		Taro.showToast({
			title: '更新失败',
			icon: 'none',
			duration: 2000,
		});
	});
	return props.children;
};

export default App;
