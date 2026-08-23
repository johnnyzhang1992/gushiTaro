import Taro from '@tarojs/taro';
import Request from '../apis/request';

// 本地缓存 key
const DYN_CACHE_KEY = 'dynasty_cache';
// 缓存有效期：1天
const DYN_CACHE_TTL = 24 * 60 * 60 * 1000;

// 兜底朝代列表
const DEFAULT_DYNASTIES = [
	'先秦',
	'两汉',
	'魏晋',
	'南北朝',
	'隋代',
	'唐代',
	'五代',
	'宋代',
	'金朝',
	'元代',
	'明代',
	'清代',
	'近代',
	'现代',
];

/**
 * 从后端拉取朝代列表并缓存到本地
 * 优先返回本地缓存（未过期），否则请求后端
 * @returns {Promise<string[]>} 朝代列表（不含 '全部' 前缀）
 */
export const fetchDynasties = async (forceRefresh = false) => {
	// 1. 读取本地缓存
	if (!forceRefresh) {
		try {
			const cached = Taro.getStorageSync(DYN_CACHE_KEY);
			if (cached && cached.data && cached.timestamp) {
				const expired = Date.now() - cached.timestamp > DYN_CACHE_TTL;
				if (!expired) {
					return cached.data;
				}
			}
		} catch (e) {}
	}

	// 2. 请求后端
	try {
		const res = await Request('/api/meta/dynasties', {}, 'GET');
		const list = res?.status && res.data ? res.data : [];
		if (Array.isArray(list) && list.length > 0) {
			// 写入缓存
			Taro.setStorageSync(DYN_CACHE_KEY, {
				data: list,
				timestamp: Date.now(),
			});
			return list;
		}
	} catch (e) {
		console.error('获取朝代列表失败:', e);
	}

	// 3. 后端失败时返回兜底
	return DEFAULT_DYNASTIES;
};

/**
 * 获取带「全部」前缀的朝代数组（用于筛选栏）
 */
export const getDynastyOptions = async (forceRefresh = false) => {
	const list = await fetchDynasties(forceRefresh);
	return ['全部', ...list];
};
