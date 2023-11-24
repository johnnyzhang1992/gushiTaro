import Taro, {
	useLaunch,
	useDidHide,
	usePageNotFound,
	useDidShow,
} from "@tarojs/taro";
import "./app.scss";

import { BaseUrl } from "./const/config";

const App = (props) => {
	// 用户登录
	const userLogin = () => {
		Taro.login({
			success: (res) => {
				// this.globalData.code = res.code;
				// 发送 res.code 到后台换取 openId, sessionKey, unionId
				Taro.request({
					url: BaseUrl + "/wxxcx/userInfo",
					data: {
						code: res.code,
					},
					success: function (result) {
						if (result.data && !result.data.status) {
							console.log("-----login---success------");
							Taro.setStorageSync("user", result.data);
							Taro.setStorageSync(
								"wx_token",
								result.data.wx_token
							);
						}
					},
				});
			},
		});
	};
	useLaunch((params) => {
		console.log("onLaunch", params);
		const app = Taro.getApp();
		console.log(app);
		Taro.getSystemInfo().then((sysRes) => {
			Taro.setStorageSync("sys_info", sysRes);
		});
		userLogin();
	});
	usePageNotFound((res) => {
		console.log(res);
		Taro.switchTab({
			url: "pages/index",
		}); // 如果是 tabbar 页面，请使用 Taro.switchTab
	});
	useDidShow(() => {
		console.log("app--show");
	});
	useDidHide(() => {
		console.log("app-hide");
	});
	return props.children;
};
export default App;
