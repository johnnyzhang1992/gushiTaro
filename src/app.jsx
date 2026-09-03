import Taro, { useLaunch, usePageNotFound } from '@tarojs/taro';

import './app.scss';

// 按需引入 NutUI 组件样式（避免全量 style.css 308KB 打进主包）
// 所有组件样式使用 var(--nutui-*, 默认值) 形式，自带 fallback，无全局变量依赖
import '@nutui/nutui-react-taro/dist/es/packages/button/style/style.css';
import '@nutui/nutui-react-taro/dist/es/packages/checkbox/style/style.css';
import '@nutui/nutui-react-taro/dist/es/packages/input/style/style.css';
import '@nutui/nutui-react-taro/dist/es/packages/searchbar/style/style.css';
import '@nutui/nutui-react-taro/dist/es/packages/swipe/style/style.css';
import '@nutui/nutui-react-taro/dist/es/packages/switch/style/style.css';
import '@nutui/nutui-react-taro/dist/es/packages/tabpane/style/style.css';
import '@nutui/nutui-react-taro/dist/es/packages/tabs/style/style.css';
import '@nutui/nutui-react-taro/dist/es/packages/tag/style/style.css';

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
						console.log('[app-login] userInfo 返回:', apiData?.uid || '无用户');
						
						if (apiData && apiData.uid) {
							// 用户存在，直接登录
							console.log('[app-login] ✅ 用户已存在，登录成功');
							const token = apiData.token || apiData.wx_token;
							const userData = { ...apiData, token };
							Taro.setStorageSync('user', userData);
							Taro.setStorageSync('wx_token', token);
							return;
						}
						
						// 用户不存在，不自动注册，由用户在个人中心手动点击登录/注册
						console.log('[app-login] 用户不存在，等待用户手动登录');
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
