import Request from "../../apis/request";

//-----------------
//------ 搜索部分 --
//-----------------

/**
 * 获取搜索热词
 * @param {String} method GET
 * @param {Object} data {}
 */
export const fetchHotSearch = (method, data) => {
	return Request(`/api/search/hot`, data, method);
};

/**
 * 根据关键字搜索
 * @param {String} method GET
 * @param {Object} data {}
 */
export const fetchSearch = (method, data) => {
	return Request(`/api/search`, data, method);
};

/**
 * 根据关键字搜索
 * @param {String} method GET
 * @param {Object} data {}
 */
export const fetchRandomSearch = (method, data) => {
	return Request(`/api/search/random`, data, method);
};
