import Taro from '@tarojs/taro';

const initDevice = {
	model: '', // 设备型号
	brand: '', // 设备品牌
	system: '', // 操作系统及版本
	platform: '', // 客户端平台
	envVersion: '', // "develop" or "trial" or "release"
	wx_version: '', // 微信版本号
	wxapp_version: '', // 小程序版本
	memorySize: 0, // 内存大小
};

/**
 * 获取设备信息
 * @returns
 */
export const getDeviceInfo = () => {
	const systemInfo = Taro.getStorageSync('sys_info');
	const accountInfo = Taro.getAccountInfoSync();
	const { miniProgram} = accountInfo || {};
	const deviceInfo = {
		...initDevice,
	};
	Object.keys(deviceInfo).forEach((k) => {
		deviceInfo[k] = systemInfo[k] || deviceInfo[k];
	});
	deviceInfo['wx_version'] = systemInfo.version || '';
	deviceInfo['envVersion'] = miniProgram && miniProgram.envVersion || '';
	deviceInfo['wxapp_version'] = miniProgram && miniProgram['version'] || '';
	return deviceInfo;
};
