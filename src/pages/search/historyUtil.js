import Taro from '@tarojs/taro';

const KEY = 'historyKeys';
/**
 * 获取本地搜索关键字
 */
export const getHistoryKeys = () => {
	const keys = Taro.getStorageSync(KEY) || [];
	return keys;
};

export const addKey = (key) => {
	if (!key.trim()) {
		return false;
	}
	const keys = getHistoryKeys();
	// 新加入的要加到栈顶
	keys.unshift(key);
	const newKeys = [...new Set(keys)];
	Taro.setStorageSync(KEY, newKeys);
};

export const removeKey = (key) => {
	const keys = getHistoryKeys();
	const newKeys = keys.filter((k) => {
		return k !== key;
	});
	Taro.setStorageSync(KEY, newKeys);
};

export const clearAll = () => {
	Taro.removeStorageSync(KEY);
};
