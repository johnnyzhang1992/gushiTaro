import { View, Text } from '@tarojs/components';
import { useState } from 'react';
import { useLoad } from '@tarojs/taro';
import { AtTabs, AtTabsPane } from 'taro-ui';

import PageHeader from '../../components/PageHeader';
import HomeCard from '../../components/HomeCard';
import PoemContainer from '../../components/PoemContainer';
import PoetContainer from '../../components/PoetContainer';

import { HomeCategories } from '../../const/config';

import './style.scss';

// const tabList = ['分类', '作品', '作者'];

const PostPage = () => {
	const [type, setType] = useState('文库');
	const [currentTab, setTab] = useState(0);
	const handleChangeTab = (index) => {
		setTab(index);
	};
	// const navigateSearch = () => {
	// 	Taro.navigateTo({
	// 		url: '/pages/search/index',
	// 	});
	// };
	useLoad((options) => {
		console.log(options);
	});
	return (
		<View className='page libraryPage'>
			<PageHeader>
				<View className='header'>
					<View className='typeContainer'>
						<Text
							className={['typeItem', type == '摘录' ? 'active' : '']}
							onClick={() => {
								setType('摘录');
							}}
						>
							摘录
						</Text>
						<Text
							className={['typeItem', type == '文库' ? 'active' : '']}
							onClick={() => {
								setType('文库');
							}}
						>
							文库
						</Text>
					</View>
				</View>
			</PageHeader>
			{/* 分类Tabs */}
			<AtTabs
				current={currentTab}
				tabList={[{ title: '分类' }, { title: '作品' }, { title: '作者' }]}
				onClick={handleChangeTab}
			>
				{/* 分类 */}
				<AtTabsPane current={currentTab} index={0}>
					<View className='tabContainer type'>
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
				{/* 作品 */}
				<AtTabsPane current={currentTab} index={1}>
					<View className='tabContainer'>
						<PoemContainer />
					</View>
				</AtTabsPane>
				{/* 作者 */}
				<AtTabsPane current={currentTab} index={2}>
					<View className='tabContainer'>
						<PoetContainer />
					</View>
				</AtTabsPane>
			</AtTabs>
		</View>
	);
};

export default PostPage;
