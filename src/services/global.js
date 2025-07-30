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
 * 获取我的收藏信息(诗词、名句、诗人)
 * @param {String} method GET
 * @param {Object} data
 */
export const fetchUserCollect = (method, data) => {
	return Request(`/api/getCollects/${data.user_id}`, data, method);
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

// --- 收藏集相关

/**
 * 获取收藏集列表
 * @param {*} method
 * @param {*} data
 * @returns
 */
export const fetchCollections = (method, data) => {
	return Request(`/api/collections`, data, method);
};

/**
 * 创建收藏集
 * @param {*} method
 * @param {*} data
 * @returns
 */
export const createCollection = (method = 'POST', data) => {
	return Request(`/api/collections/create`, data, method);
};

/**
 * 更新收藏集
 * @param {*} method
 * @param {*} data
 * @returns
 */
export const updateCollection = (method = 'POST', data) => {
	return Request(`/api/collections/update`, data, method);
};

/**
 * 获取诗词的 pinyin
 * @param {String} method POST
 * @param {Object} data {}
 */
export const fetchPoemPinyin = (method, data) => {
	return Request(`/api/pinyin`, data, method);
};

/**
 * 获取用户信息
 * @param {*} method
 * @param {*} data
 * @returns
 */
export const fetchUserInfo = (method, data = {}) => {
	return Request(`/api/user/userInfo`, data, method);
};

/**
 * 创建用户
 * @param {*} method
 * @param {*} data
 * @returns
 */
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

// -- 学习计划相关API
/**
 * 获取学习计划列表
 * @param {*} method
 * @param {*} data
 * @returns
 */
export const fetchSchedules = (method = 'GET', data) => {
	return Request(`/api/schedule`, data, method);
};

/**
 * 创建学习计划
 * @param {*} method
 * @param {*} data
 * @returns
 */
export const createSchedule = (method = 'POST', data) => {
	return Request(`/api/schedule/create`, data, method);
};

/**
 * 更新学习计划
 * @param {*} method
 * @param {*} data
 * @returns
 */
export const updateSchedule = (method = 'POST', data) => {
	return Request(`/api/schedule/update`, data, method);
};

/**
 * 删除计划
 * @param {*} method
 * @param {*} data
 * @returns
 */
export const deleteSchedule = (method = 'POST', data) => {
	return Request(`/api/schedule/delete`, data, method);
};

/**
 * 获取计划详情
 * @param {*} method
 * @param {*} data
 * @returns
 */
export const fetchScheduleDetail = (method = 'GET', data) => {
	return Request(`/api/schedule/detail`, data, method);
};

/**
 * 获取计划概况数据
 * @param {*} method
 * @param {*} data
 * @returns
 */
export const fetchScheduleStats = (method = 'GET', data) => {
	return Request(`/api/schedule/stats`, data, method);
};

/**
 * 向计划中添加诗词
 * @param {*} method
 * @param {*} data
 * @returns
 */
export const addPoemToSchedule = (method = 'POST', data) => {
	return Request(`/api/schedule/add_poem`, data, method);
};

/**
 * 变更计划中诗词状态，已学习改为待学习
 * @param {*} method
 * @param {*} data
 * @returns
 */
export const addPoemToScheduleAgain = (method = 'POST', data) => {
	return Request(`/api/schedule/add_poem_again`, data, method);
};

/**
 * 从计划中移除诗词
 * @param {*} method
 * @param {*} data
 * @returns
 */
export const removePoemToSchedule = (method = 'POST', data) => {
	return Request(`/api/schedule/remove_poem`, data, method);
};

/**
 * 诗词打卡
 * @param {*} method
 * @param {*} data
 * @returns
 */
export const checkInPoemToSchedule = (method = 'POST', data) => {
	return Request(`/api/schedule/check_in`, data, method);
};
