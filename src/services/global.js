import Request from '../apis/request';

/**
 * 首页 每日一诗词
 * @param {*} method GET
 * @param {*} data
 * @returns
 */
export const fetchRandomSentence = (method, data) => {
	return Request(`/api/sentence/random`, data, method);
};

/**
 * 更新收藏状态
 * @param {String} method POST
 * @param {number} id
 * @param {number} user_id
 * @param {poem,sentence,author} type
 */
export const updateUserCollect = (method, data) => {
	return Request(`/api/updateCollect`, data, method);
};

/**
 * 更新喜爱状态
 * @param {String} method POST
 * @param {number} id
 * @param {number} user_id
 * @param {poem,sentence,author} type
 */
export const updateUserLike = (method, data) => {
	console.log(method, data);
	return Request(`/api/updateLike`, data, method);
};

/**
 * 获取诗词的 pinyin
 * @param {String} method POST
 * @param {Object} data {}
 */
export const fetchPoemPinyin = (method, data) => {
	return Request(`/api/pinyin`, data, method);
};



export const fetchUserInfo = (method, data = {}) => {
	return Request(`/api/user/userInfo`, data, method);
};

export const createUser = (method, data) => {
	return Request('/api/user/create', data, method);
};

/**
 * 更新用户信息
 * @param {*} method
 * @param {*} data {nickName, avatar}
 * @returns
 */
export const updateUserInfo = (method, data) => {
	return Request(`/api/user/updateInfo`, data, method);
};
