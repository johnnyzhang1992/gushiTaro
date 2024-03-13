import { View } from '@tarojs/components';
import { useState } from 'react';
import Taro, { useLoad, usePullDownRefresh } from '@tarojs/taro';
import { AtSearchBar, AtSegmentedControl } from 'taro-ui';

import HomeCard from '../../components/HomeCard';
import PoemContainer from '../../components/PoemContainer';
import PoetContainer from '../../components/PoetContainer';

import { HomeCategories } from '../../const/config';

import './style.scss';

const tabList = ['分类', '作品', '作者'];

const PostPage = () => {
	const [searchKey, setKey] = useState('');
	const [currentTab, setTab] = useState(0);

	const handleKeyChange = (key) => {
		setKey(key);
	};
	const handleClear = () => {
		setKey('');
	};
	const handleChangeTab = (index) => {
		setTab(index);
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
		Taro.stopPullDownRefresh()
	})
	return (
		<View className='page libraryPage'>
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
			{/* 分类Tabs */}
			<View className='tabs'>
				<AtSegmentedControl
					values={tabList}
					fontSize={32}
					onClick={handleChangeTab}
					current={currentTab}
				/>
			</View>
			{/* 分类 */}
			{currentTab === 0 ? (
				<View className='tabContainer'>
					{/* 选集 */}
					<View className='sectionCard'>
						<View className='cardTitle'>选集</View>
						<View className='cardContent'>
							{HomeCategories.map((item) => (
								<HomeCard key={item.code} {...item} />
							))}
						</View>
					</View>
				</View>
			) : null}
			{/* 作品 */}
			{currentTab === 1 ? (
				<View className='tabContainer'>
					<PoemContainer />
				</View>
			) : null}
			{/* 诗人 */}
			{currentTab === 2 ? (
				<View className='tabContainer'>
					<PoetContainer />
				</View>
			) : null}
		</View>
	);
};

export default PostPage;
