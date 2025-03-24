import { View } from '@tarojs/components';
// import { useNavigationBar } from 'taro-hooks';
// import { useState } from 'react';
import Taro, { useLoad, usePullDownRefresh } from '@tarojs/taro';

import PageHeader from '../../components/PageHeader';
import RandomSearch from '../search/components/RandomSearch';

import './style.scss';

const PostPage = () => {

	useLoad((options) => {
		console.log(options);
	});
	usePullDownRefresh(() => {
		Taro.stopPullDownRefresh();
	});
	return (
		<View className='page findPage'>
			<PageHeader title='发现' />
			<View className='divide' />
			{/* 随机探索 */}
			<RandomSearch />
			{/* 词牌 */}
			{/* 飞花 */}
			{/* <View className='sectionCard'>
				<View className='cardTitle'>飞花</View>
				<View className='cardContent'></View>
			</View> */}
			{/* 诗单 */}
			{/* <View className='sectionCard'>
				<View className='cardTitle'>诗单</View>
				<View className='cardContent'></View>
			</View> */}
			{/* 小知识 */}
			{/* <View className='sectionCard'>
				<View className='cardTitle'>小知识</View>
				<View className='cardContent'></View>
			</View> */}
		</View>
	);
};

export default PostPage;
