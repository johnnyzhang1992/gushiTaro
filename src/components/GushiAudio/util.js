import Taro from '@tarojs/taro';

export const initPoem = {
  author_name: '',
  dynasty: '',
  auduo_url: '',
  content: [],
  xu: '',
  id: '',
};
/**
 *
 */
export const getPoemList = () => {
  return Taro.getStorageSync('poemList') || [];
};

/**
 * 更新本地缓存
 * @param {*} list
 */
export const updateLocalList = (list) => {
  Taro.setStorageSync('poemList', list || []);
};

/**
 * 更新列表
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
