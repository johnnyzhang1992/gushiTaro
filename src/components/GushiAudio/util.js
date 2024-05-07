import Taro from '@tarojs/taro';

export const initSetting = {
  rate: 1, // 0.5 - 2
  speaker: '',
  loopMode: '', // 列表循环、单曲循环，当前播放
  loop: false,
  autoPlay: false,
  obeyMuteSwitch: false,
  volume: 1, // 0-1
};

export const initPoem = {
  author_name: '',
  author_avatar: '',
  dynasty: '',
  audio_url: '',
  content: { content: [] },
  title: '',
  xu: '',
  id: '',
  audio_url: '',
  duration: '00:00',
  current_time: '00:00',
  total_time: 0,
  currentTime: 0,
  isPlaying: false, // 正在播放中
};

/**
 * 获取当前播放诗词
 */
export const getCurrentPoem = () => {
  return Taro.getStorageSync('currentPoemAudio') || initPoem;
};

/**
 * 同步当前诗词信息到本地缓存
 * @param {*} poem
 * @returns
 */
export const updateLocalPoem = (poem) => {
  // console.log('update-currentPoem', poem)
  if (typeof poem !== 'object' || !poem.id) {
    Taro.removeStorageSync('currentPoemAudio');
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
    return currentPoem;
  }
  const newPoem = { ...(currentPoem || initPoem), ...payload };
  updateLocalPoem(newPoem);
  updatePoemList(getPoemList(), newPoem);
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
export const updatePoemList = (oldList = [], poem = {}) => {
  if (typeof poem !== 'object' || !poem.id) {
    return false;
  }
  let isExist = false;
  const newList = [...oldList].map((item) => {
    if (item.id === poem.id) {
      isExist = true;
      return {
        ...item,
        ...poem,
      };
    }
    return item;
  });
  if (!isExist) {
    newList.push(poem);
  }
  updateLocalList(newList);
  return newList;
};
