import Request from "../../apis/request";

// 获取诗人列表
export const fetchPoetData = (method, data) => {
	return Request(`/api/authors`, data, method);
};

// 获取诗人的诗词列表
export const fetchPoetPoems = (method, data) => {
	return Request(`/api/authors/${data.id}/poems`, data, method);
};

// 诗人详情
export const fetchPoetDetail = (method, data) => {
	return Request(`/api/authors/${data.id}`, data, method);
};
