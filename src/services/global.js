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

/**
 * 获取诗词的语音合成
 * @param {*} method
 * @param { Object} data {text, config}
 * @param {Object}
 * config {
  creator_openid = "",
  title = "",
  poem_id = 1024,
	speaker = "sijia",
  sample_rate = 100,
  speech_rate = -125, // [-500, 500] [0.5, 2]}
	format = "wav",
	// speaker 和成人
	// sample_rate 音频采样率，默认是8000、16000、24000 Hz
	// speech_rate 语速，取值范围：-500～500，默认值：0。
	// format 音频编码格式，支持.pcm、.wav和.mp3格式。默认值：pcm
 * @returns {audio_url}
 */
export const fetchPoemSynthesis = (method = 'POST', data) => {
	console.log(data)
  return Request(
    `/gushi/tts/synthesis`,
    {
			...data,
			hostUrl: 'https://api.historybook.cn'
    },
    method
  );
}
/**
 * 获取阿里云语音合成发言人角色列表
 * @param {*} method
 * @param {*} data
 * @returns
 */
export const fetchVoiceSpeakers = (method, data = {}) => {
	return Request(`/gushi/tts/voiceSpeakers`, {
		data,
		hostUrl: 'https://api.historybook.cn'
	},method);
}
