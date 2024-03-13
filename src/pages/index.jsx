import { View, Text } from '@tarojs/components';
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
			<View className='poemCard'>
				<View className='container'>
					<View className='poem-context'>
						<View className='author'>
							<Text className='text'>唐·李白</Text>
						</View>
						<View className='title'>
							<Text className='text'>赠汪伦</Text>
						</View>
						<View className='poem'>
							<View className='poem-text'>
								<Text className='text'>李白乘舟将欲行</Text>
							</View>
							<View className='poem-text'>
								<Text className='text'>忽闻岸上踏歌声</Text>
							</View>
							<View className='poem-text'>
								<Text className='text'>桃花潭水深千尺</Text>
							</View>
							<View className='poem-text'>
								<Text className='text'>不及汪伦送我情</Text>
							</View>
						</View>
					</View>
				</View>
				<View className='bottom'>
					<View className='date'>
						<View className='nongli'>甲辰年 二月初四</View>
						<View className='yangli'>2024/03/13</View>
					</View>
					<View className='desc'>
						<View className='yi'>宜平安喜乐·出行</View>
						<View className='share'>
							<View className='at-icon at-icon-heart'></View>
							<View className='at-icon at-icon-share'></View>
						</View>
					</View>
				</View>
			</View>
		</View>
	);
};

export default Index;
