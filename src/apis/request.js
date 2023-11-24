import Taro from "@tarojs/taro";

const user = Taro.getStorageSync("user") || {};
const wxToken = Taro.getStorageSync("wx_token");
const basesUrl = "https://xuegushi.com";
// const app = getApp();

const request = (url, params, method = "GET") => {
	let data = {
		...params,
		openId: user.openId,
		wx_token: wxToken,
	};
	return Taro.request({
		url: basesUrl + url, //仅为示例，并非真实的接口地址
		enableCache: true, // API 支持度: weapp, tt
		credentials: true, // 设置是否携带 Cookie API 支持度: h5
		data: data,
		type: method || "GET",
		header: {
			"content-type": "application/json", // 默认值,
		},
		success: function (res) {
			console.log(res.data);
		},
	});
};

export default request;
