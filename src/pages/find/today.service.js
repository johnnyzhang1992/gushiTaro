import Request from '../../apis/request';

/**
 * 历史上的今天
 * @param date 'MM-DD'，缺省为今天
 */
export const fetchHistoryToday = (method = 'GET', data) => {
	return Request(`/api/history/today`, data, method);
};

/** 单篇作品详情（含全文 clauses） */
export const fetchHistoryPoemDetail = (id) => {
	return Request(`/api/history/today/poem/${id}`, {}, 'GET');
};

/** 历史事件分页（主路由 events 为全量，此接口供触底加载） */
export const fetchHistoryEvents = (method = 'GET', data) => {
	return Request(`/api/history/today/events`, data, method);
};
