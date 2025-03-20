import { View, Text } from '@tarojs/components';
import { useState } from 'react';
import { useLoad } from '@tarojs/taro';
import { AtTabs, AtTabsPane } from 'taro-ui';

import PageHeader from '../../components/PageHeader';
import TypeContainer from '../../components/TypeContainer';
import PoemContainer from '../../components/PoemContainer';
import PoetContainer from '../../components/PoetContainer';

import './style.scss';

const Page = () => {
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
							className={['typeItem', type == '字典' ? 'active' : '']}
							onClick={() => {
								setType('字典');
							}}
						>
							字典
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
			{/* 字典 */}
			{/* 文库 */}
			{/* 分类Tabs */}
			<AtTabs
				current={currentTab}
				tabList={[{ title: '分类' }, { title: '作品' }, { title: '作者' }]}
				onClick={handleChangeTab}
			>
				{/* 分类 */}
				<AtTabsPane current={currentTab} index={0}>
					<TypeContainer />
				</AtTabsPane>
				{/* 作品 */}
				<AtTabsPane current={currentTab} index={1}>
					<PoemContainer />
				</AtTabsPane>
				{/* 作者 */}
				<AtTabsPane current={currentTab} index={2}>
					<PoetContainer />
				</AtTabsPane>
			</AtTabs>
		</View>
	);
};

export default Page;
