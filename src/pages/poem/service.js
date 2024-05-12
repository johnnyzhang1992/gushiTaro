import Request from '../../apis/request';
/**
 * 获取首页列表数据
 * @param {String} method GET
 * @param {Object} data {}
 */
export const fetchHomeData = (method, data) => {
  return Request(`/wxxcx/getHomeData`, data, method);
};

/**
 * 获取首页列表数据
 * @param {String} method GET
 * @param {Object} data {}
 */
export const fetchBookData = (method, data) => {
  return Request(`/wxxcx/getBookData`, data, method);
};

/**
 * 根据条件获取诗词列表
 * @param {String} method GET
 * @param {Object} data {}
 */
export const fetchPoemData = (method, data) => {
  return Request(`/wxxcx/getPoemData`, data, method);
};

/**
 * 获取诗词详情
 * @param {String} method GET
 * @param {Object} data {}
 */
export const fetchPoemDetail = (method, data) => {
  return Request(`/wxxcx/poem/${data.id}`, data, method);
};

/**
 * 获取诗词内容
 * @param {String} method GET
 * @param {Object} data {}
 */
export const fetchPoemContent = (method, data) => {
  return Request(`/wxxcx/getPoemContent/${data.id}`, data, method);
};

/**
 * 获取诗词的语音
 * @param {String} method GET
 * @param {Object} data {}
 */
export const fetchPoemAudio = (method, data) => {
  return Request(`/wxxcx/getPoemAudio/${data.id}`, data, method);
};
