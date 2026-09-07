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

import { ensureLoginReady } from './utils/login';

// 启动时触发一次静默登录（全局单例，request.js 也会复用）
const App = (props) => {
	useLaunch((options) => {
		console.log('onLaunch', options);
		Taro.setStorageSync('enterPath', options.path);
		Taro.getSystemInfo().then((sysRes) => {
			Taro.setStorageSync('sys_info', sysRes);
		});
		// 启动时触发静默登录（code → token 写入 storage，全局单例）
		// 页面接口在无 token 时会自动等待本流程完成（见 apis/request.js）
		ensureLoginReady();
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
