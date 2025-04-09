import Request from '../../apis/request';

/**
 * 词典搜索
 * @param {String} method GET
 * @param {Object} data {ciList: Array, wordList: Array, chengyuList: Array}
 */
export const fetchDictionarySearch = (method, data) => {
	const { type = '' } = data || {};
	let path = `/api/xinhua/search`;
	if (type && ['ci', 'word', 'chengyu'].includes(type)) {
		path = `${path}/${type}`;
	}
	return Request(path, data, method);
};

/**
 * 字典 - 详情
 * @param {*} method
 * @param {*} data
 * @returns
 */
export const fetchDictionaryDetail = (method, data) => {
	const { type = '' } = data || {};
	let path = `/api/xinhua`;
	if (type && ['ci', 'word', 'chengyu'].includes(type)) {
		path = `${path}/${type}`;
	}
	return Request(path, data, method);
};
