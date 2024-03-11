import { View } from '@tarojs/components';
import { useState } from 'react';
import Taro, { useLoad } from '@tarojs/taro';
import { AtTabs, AtTabsPane, AtSearchBar } from 'taro-ui';

import HomeCard from '../../components/HomeCard';
import HomeNavs from '../../components/HomeNavs';
import { HomeCategories } from '../../const/config';

import './style.scss';

const tabList = [{ title: '分类' }, { title: '作品' }, { title: '作者' }];

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
			{/* 导航 */}
			<HomeNavs />
			<View className='divide' />
			<AtTabs
				current={currentTab}
				tabList={tabList}
				onClick={handleChangeTab}
			>
				<AtTabsPane current={currentTab} index={0}>
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
				</AtTabsPane>
				<AtTabsPane current={currentTab} index={1}>
					<View className='tabContainer'></View>
				</AtTabsPane>
				<AtTabsPane current={currentTab} index={2}>
					<View className='tabContainer'></View>
				</AtTabsPane>
			</AtTabs>
		</View>
	);
};

export default PostPage;
