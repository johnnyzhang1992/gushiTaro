import { View } from '@tarojs/components';
import Taro, {
	usePullDownRefresh,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';

import './index.scss';


const Index = () => {
	usePullDownRefresh(() => {
		Taro.stopPullDownRefresh();
	});
	useShareAppMessage(() => {
		return {
			title: '古诗文小助手',
			path: '/pages/index',
		};
	});
	useShareTimeline(() => {
		return {
			title: '古诗文小助手',
			path: '/pages/index',
		};
	});
	return (
		<View className='page homePage'>
			<View className='poemCard'>诗词卡片</View>
		</View>
	);
};

export default Index;
