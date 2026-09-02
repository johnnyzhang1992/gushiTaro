import Taro from '@tarojs/taro';
import Request from "../../apis/request";

// 获取名句列表
export const fetchSentenceData = (method, data) => {
	return Request(`/api/sentences`, data, method);
};

// 获取摘录筛选选项（主题/类型）- 本地缓存1天
const CACHE_KEY = 'sentence_filters_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1天

export const fetchSentenceFilters = (method, data) => {
	// 检查缓存
	try {
		const cached = Taro.getStorageSync(CACHE_KEY);
		if (cached && cached.data && cached.timestamp) {
			if (Date.now() - cached.timestamp < CACHE_DURATION) {
				return Promise.resolve({ status: true, data: cached.data });
			}
		}
	} catch (e) {}

	// 请求接口
	return Request(`/api/sentences/filters`, data, method).then((res) => {
		if (res && res.status && res.data) {
			// 写入缓存
			try {
				Taro.setStorageSync(CACHE_KEY, {
					data: res.data,
					timestamp: Date.now(),
				});
			} catch (e) {}
		}
		return res;
	});
};

// 获取名句详情
export const fetchSentenceDetail = (method, data) => {
	return Request(`/api/sentences/${data.id}`, data, method);
};
