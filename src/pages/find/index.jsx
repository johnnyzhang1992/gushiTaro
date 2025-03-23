import { View } from '@tarojs/components';
// import { useNavigationBar } from 'taro-hooks';
// import { useState } from 'react';
import Taro, { useLoad, usePullDownRefresh } from '@tarojs/taro';

// import { HomeBooks, HomeCategories } from '../../const/config';
// import BookCover from '../../components/BookCover';
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
			{/* <HomeNavs /> */}
			{/* 课本 */}
			{/* <View className='sectionCard'>
				<View className='cardTitle'>学习</View>
				<View className='cardContent'>
					<ScrollView
						enableFlex
						scrollX
						enhanced
						className='scroll-container'
						style={{
							width: 'calc(100vw - 20px)',
							height: 140
						}}
					>
						{HomeBooks.map((item) => (
							<BookCover key={item.code} {...item} />
						))}
					</ScrollView>
				</View>
			</View> */}
			{/* 选集 */}
			{/* <View
				className='sectionCard'
				style={{
					padding: 10,
				}}
			>
				<View className='cardTitle'>选集</View>
				<View className='cardContent'>
					<ScrollView
						enableFlex
						scrollX
						enhanced
						className='scroll-container'
						style={{
							width: 'calc(100vw - 20px)',
							height: 140
						}}
					>
						{HomeCategories.map((item) => (
							<BookCover key={item.code} {...item} />
						))}
					</ScrollView>
				</View>
			</View> */}
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
