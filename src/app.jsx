import Taro, {
	useLaunch,
	useDidHide,
	usePageNotFound,
	useDidShow,
} from "@tarojs/taro";
import "./app.scss";

const App = (props) => {
	useLaunch((params) => {
		console.log("onLaunch", params);
		Taro.getSystemInfo({
			success: (res) => console.log(res),
		}).then((res) => console.log(res));
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
