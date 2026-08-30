import Request from '../../apis/request';

/**
 * 飞花令详情：查询包含指定字的名句
 */
export const fetchFeihuaSentences = (method = 'GET', data) => {
	return Request(`/api/sentences`, data, method);
};