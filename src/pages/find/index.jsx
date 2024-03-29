import { ScrollView, View } from '@tarojs/components';
// import { useNavigationBar } from 'taro-hooks';
import { useState } from 'react';
import Taro, { useLoad, usePullDownRefresh } from '@tarojs/taro';
import { AtSearchBar } from 'taro-ui';

import { HomeBooks, HomeCategories } from '../../const/config';
import HomeNavs from '../../components/HomeNavs';
import BookCover from '../../components/BookCover';
import RandomSearch from '../search/components/RandomSearch';

import './style.scss';

const PostPage = () => {
	const [searchKey, setKey] = useState('');

	const handleKeyChange = (key) => {
		setKey(key);
	};
	const handleClear = () => {
		setKey('');
	};
	const navigateSearch = () => {
		Taro.navigateTo({
			url: '/pages/search/index?key=' + searchKey,
		});
	};
	useLoad((options) => {
		console.log(options);
	});
	usePullDownRefresh(() => {
		Taro.stopPullDownRefresh();
	});
	return (
		<View className='page findPage'>
			{/* 搜索 */}
			<AtSearchBar
				actionName='搜一下'
				value={searchKey}
				onChange={handleKeyChange}
				showActionButton
				onClear={handleClear}
				onConfirm={navigateSearch}
				onActionClick={navigateSearch}
			/>
			<View className='divide' />
			<HomeNavs />
			{/* 课本 */}
			<View className='sectionCard'>
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
			</View>
			{/* 选集 */}
			<View
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
			</View>
			{/* 随机探索 */}
			<RandomSearch />
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
