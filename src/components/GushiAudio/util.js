import Taro from '@tarojs/taro';

export const initSetting = {
	rate: 1, // 0.5 - 2
	speaker: '',
	loopMode: '', // 列表循环、单曲循环，当前播放
	loop: false,
	autoPlay: false,
	obeyMuteSwitch: false,
	volume: 1, // 0-1
}

export const initPoem = {
  author_name: '',
  dynasty: '',
  auduo_url: '',
  content: [],
  xu: '',
	id: '',
	audio_url: '',
  duration: 0,
  current_time: 0,
};

/**
 * 获取当前播放诗词
 */
export const getCurrentPoem = () => {
  return Taro.getStorageSync('currentPoemAudio') || null;
};

/**
 * 同步当前诗词信息到本地缓存
 * @param {*} poem
 * @returns
 */
export const updateLocalPoem = (poem) => {
  if (typeof poem !== 'object' || !poem.id) {
    return false;
  }
  Taro.setStorageSync('currentPoemAudio', poem);
};

/**
 * 更新当前播放的诗词信息，播放进度
 * @param {*} currentPoem
 * @param {*} payload
 * @returns
 */
export const updateCurrentPoem = (currentPoem, payload) => {
  if (typeof payload !== 'object') {
    return false;
  }
  const newPoem = { ...(currentPoem || initPoem), ...payload };
  updateLocalPoem(newPoem);
  return newPoem;
};

/**
 * 获取本地诗词列表
 */
export const getPoemList = () => {
  return Taro.getStorageSync('poemList') || [];
};

/**
 * 更新诗词列表的本地缓存
 * @param {*} list
 */
export const updateLocalList = (list) => {
  Taro.setStorageSync('poemList', list || []);
};

/**
 * 更新诗词列表
 * @param {*} oldList
 * @param {*} poem
 * @returns
 */
export const updatePoemList = (oldList = [], poem) => {
  if (typeof poem !== 'object' || !poem.id) {
    return false;
  }
  const newList = [...oldList];
  const isExist = oldList.find((item) => {
    return item.id === poem.id;
  });
  if (!isExist) {
    newList.push(poem);
  }
  updateLocalList(newList);
  return newList;
};
