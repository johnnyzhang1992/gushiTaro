import Request from "../../apis/request";

//-----------------
//------ 诗人 --
//-----------------

/**
 * 根据条件获取诗人列表
 * @param {String} method GET
 * @param {Object} data {}
 */
export const fetchPoetData = (method, data) => {
	return Request(`/wxxcx/getPoetData?`, data, method);
};

/**
 * 诗人详情
 * @param {String} method GET
 * @param {Object} data {}
 */
export const fetchPoetDetail = (method, data) => {
	return Request(`/wxxcx/getPoetDetailData/${data.id}`, data, method);
};
