import Taro, { useLoad } from '@tarojs/taro';

const PoemDetailIndex = () => {
	useLoad((options) => {
		const { id } = options;
		Taro.redirectTo({
			url: '/pages/poem/detail?id=' + id,
		});
	});
	return null;
};

export default PoemDetailIndex;
