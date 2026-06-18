import Request from "../../apis/request";

// 获取搜索热词
export const fetchHotSearch = (method, data) => {
	return Request(`/api/search/hot`, data, method);
};

// 搜索
export const fetchSearch = (method, data) => {
	return Request(`/api/search`, data, method);
};

// 随机搜索
export const fetchRandomSearch = (method, data) => {
	return Request(`/api/search/random`, data, method);
};
