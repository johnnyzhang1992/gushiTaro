import Request from '../../apis/request';

// 获取首页课本诗词
export const fetchHomeData = (method, data) => {
	return Request(`/api/poemBook/poems`, data, method);
};

// 获取课本详情
export const fetchBookData = (method, data) => {
	return Request(`/api/poemBook/detail`, data, method);
};

// 获取诗词列表
export const fetchPoemData = (method, data) => {
	return Request(`/api/poems`, data, method);
};

// 获取诗词详情
export const fetchPoemDetail = (method, data) => {
	return Request(`/api/poems/${data.id}`, data, method);
};

// 获取诗词内容
export const fetchPoemContent = (method, data) => {
	return Request(`/api/poems/${data.id}`, data, method);
};
