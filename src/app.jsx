import Taro, { useLaunch, usePageNotFound } from '@tarojs/taro';

import './app.scss';

import { BaseUrl } from './const/config';

const App = (props) => {
	// 用户登录
	const userLogin = () => {
		Taro.login({
			success: (res) => {
				// this.globalData.code = res.code;
				// 发送 res.code 到后台换取 openId, sessionKey, unionId
				Taro.request({
					url: BaseUrl + '/wxxcx/userInfo',
					data: {
						code: res.code,
					},
					success: function (result) {
						if (result.data && !result.data.status) {
							console.log('-----login---success------');
							Taro.setStorageSync('user', result.data);
							Taro.setStorageSync(
								'wx_token',
								result.data.wx_token
							);
							console.log('wx_token', result.data.wx_token);
						}
					},
					fail: function (err) {
						console.log(err);
					},
				});
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
				console.log('---取消了更新')
			}
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
