import Request from "../apis/request";

/**
 * 首页 每日一诗词
 * @param {*} method GET
 * @param {*} data
 * @returns
 */
export const fetchRandomSentence = (method, data) => {
	return Request(`/wxxcx/getRandomSentence`, data, method);
};


/**
 * 更新收藏状态
 * @param {String} method POST
 * @param {number} id
 * @param {number} user_id
 * @param {poem,sentence,author} type
 */
export const updateUserCollect = (method, data) => {
	return Request(`/wxxcx/updateCollect/${data.type}`, data, method);
};

/**
 * 更新喜爱状态
 * @param {String} method POST
 * @param {number} id
 * @param {number} user_id
 * @param {poem,sentence,author} type
 */
export const updateUserLike = (method, data) => {
	console.log(method, data)
	return Request(`/wxxcx/updateLike`, data, method);
};

/**
 * 获取诗词的语音
 * @param {String} method GET
 * @param {Object} data { id }
 */
export const fetchPoemAudio = (method, data) => {
	return Request(`/wxxcx/getPoemAudio/${data.id}`, data, method);
};

/**
 * 获取诗词的 pinyin
 * @param {String} method POST
 * @param {Object} data {}
 */
export const fetchPoemPinyin = (method, data) => {
  return Request(
    `/gushi/pinyin`,
    {
			...data,
			hostUrl: 'https://api.historybook.cn'
    },
    method
  );
};
