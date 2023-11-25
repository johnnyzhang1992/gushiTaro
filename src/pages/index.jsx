// import { useCallback, useEffect, useState } from "react";
import { View } from '@tarojs/components';
import { useNavigationBar } from 'taro-hooks';

import './index.scss';

import HomeHeader from '../components/HomeHeader';
import HomeNavs from '../components/HomeNavs';
import HomeCard from '../components/HomeCard';

import { HomeCategories, HomeBooks } from '../const/config';

const Index = () => {
	const { setTitle } = useNavigationBar({ title: '首页 | 古诗文小助手' });
	setTitle('首页 | 古诗文小助手');

	return (
		<View className='wrapper'>
			{/* 顶部 - 每日一诗词 */}
			<HomeHeader />
			{/* 导航 */}
			<HomeNavs />
			<View className='divide' />
			{/* 课本 */}
			<View className='sectionCard'>
				<View className='cardTitle'>课本</View>
				<View className='cardContent'>
					{HomeBooks.map((item) => (
						<HomeCard type='book' key={item.code} {...item} />
					))}
				</View>
			</View>
			<View className='divide' />
			{/* 选集 */}
			<View className='sectionCard'>
				<View className='cardTitle'>选集</View>
				<View className='cardContent'>
					{HomeCategories.map((item) => (
						<HomeCard type='category' key={item.code} {...item} />
					))}
				</View>
			</View>
		</View>
	);
};

export default Index;
