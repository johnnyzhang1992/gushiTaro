import Request from "../../apis/request";

//-----------------
//------ 名句 --
//-----------------

/**
 * 根据条件获取名句的列表
 * @param {String} method GET
 * @param {Object} data {}
 */
export const fetchSentenceData = (method, data) => {
	return Request(`/wxxcx/getSentenceData`, data, method);
};

/**
 * 获取名句详情
 * @param {String} method GET
 * @param {Object} data {}
 */
export const fetchSentenceDetail = (method, data) => {
	return Request(`/wxxcx/getSentenceDetail/${data.id}`, data, method);
};
