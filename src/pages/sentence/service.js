import Request from "../../apis/request";

// 获取名句列表
export const fetchSentenceData = (method, data) => {
	return Request(`/api/sentences`, data, method);
};

// 获取名句详情
export const fetchSentenceDetail = (method, data) => {
	return Request(`/api/sentences/${data.id}`, data, method);
};
