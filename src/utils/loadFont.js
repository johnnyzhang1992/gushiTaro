import Taro, { Events } from '@tarojs/taro';
import { FontFaceList } from '../const/config';

const events = new Events();

/**
 * 加载本地字体
 */
const LoadLocalFont = (global = false, cb) => {
  // 去本地缓存字体配置
  const cacheFont = Taro.getStorageSync('fontName') || '阿里妈妈刀隶体';
  if (!cacheFont) {
    return false;
  }

  const findFont = FontFaceList.find((font) => {
    return font.extra_name === cacheFont;
  });
  if (!findFont) {
    return false;
  }
  console.log('---load--font--start, global:', global);
  // Taro.loadFontFace({
  //   global: global,
  //   family: 'GushiFont',
  //   source: `url("${findFont.path}")`,
  //   scopes: ['webview', 'native'],
  //   success: (res) => {
  //     console.log('加载字体:', cacheFont, res.status);
  //     events.trigger('loadFont');
  //     if (cb && typeof cb === 'function') {
  //       cb();
  //     }
  //   },
	// 	fail: function (res) {
  //     console.error(res);
  //   },
  //   complete: function () {
  //     console.log('load---complete');
  //   },
  // });
};

export default LoadLocalFont;
