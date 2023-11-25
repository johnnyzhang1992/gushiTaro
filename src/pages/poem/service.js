import Request from "../../apis/request";
/**
 * 获取首页列表数据
 * @param {String} method GET
 * @param {Object} data {}
 */
export const fetchHomeData = (method, data) => {
	return Request(`/wxxcx/getHomeData`, data, method);
};
