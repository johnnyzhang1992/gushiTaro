import { View, Text } from '@tarojs/components';
import { useState } from 'react';
import { useLoad } from '@tarojs/taro';

import PageHeader from '../../components/PageHeader';
import TypeContainer from '../../components/TypeContainer';
import PoemContainer from '../../components/PoemContainer';
import PoetContainer from '../../components/PoetContainer';
import AllusionContainer from '../../components/AllusionContainer';
import SentenceContainer from '../../components/SentenceContainer';
import LibrarySearchBar from '../../components/LibrarySearchBar';

import './style.scss';

// 自研 TAB 配置
const TABS = [
	{ key: 0, label: '分类' },
	{ key: 1, label: '作品' },
	{ key: 2, label: '摘录' },
	{ key: 3, label: '作者' },
	{ key: 4, label: '典故' },
];

const Page = () => {
	const [currentTab, setTab] = useState(0);
	// 各内容 tab 的搜索参数
	const [searchParams, setSearchParams] = useState({});

	const handleChangeTab = (index) => {
		setTab(index);
	};

	useLoad((options) => {
		console.log(options);
	});

	// 搜索回调：更新当前 tab 的搜索参数，触发容器重新查询
	const handleSearch = (tabIndex, params) => {
		setSearchParams((pre) => ({ ...pre, [tabIndex]: { ...params } }));
	};

	// 内容类 tab 包装：搜索筛选栏 + 列表容器
	const renderContentTab = (tabIndex, ContainerEl, extraProps) => {
		const sp = searchParams[tabIndex] || {};
		return (
			<View className='tabPaneContent'>
				<LibrarySearchBar
					tab={tabIndex}
					onSearch={(params) => handleSearch(tabIndex, params)}
				/>
				<View className='containerWrap'>
					<ContainerEl {...extraProps} {...sp} />
				</View>
			</View>
		);
	};

	return (
		<View className='page libraryPage'>
			<PageHeader title='文库'></PageHeader>
			{/* 自研 TAB 标题栏 */}
			<View className='customTabs'>
				{TABS.map((tab) => (
					<View
						key={tab.key}
						className={`customTab ${currentTab === tab.key ? 'active' : ''}`}
						onClick={() => handleChangeTab(tab.key)}
					>
						<Text className='customTabText'>{tab.label}</Text>
						{currentTab === tab.key ? <View className='customTabLine' /> : null}
					</View>
				))}
			</View>
			{/* 内容区：所有 pane 常驻挂载，切换时仅隐藏，避免重复请求 */}
			<View className='tabContentArea'>
				<View className='tabPane' style={{ display: currentTab === 0 ? 'block' : 'none' }}>
					<TypeContainer />
				</View>
				<View className='tabPane' style={{ display: currentTab === 1 ? 'block' : 'none' }}>
					{renderContentTab(1, PoemContainer, {})}
				</View>
				<View className='tabPane' style={{ display: currentTab === 2 ? 'block' : 'none' }}>
					{renderContentTab(2, SentenceContainer, {})}
				</View>
				<View className='tabPane' style={{ display: currentTab === 3 ? 'block' : 'none' }}>
					{renderContentTab(3, PoetContainer, {})}
				</View>
				<View className='tabPane' style={{ display: currentTab === 4 ? 'block' : 'none' }}>
					{renderContentTab(4, AllusionContainer, {})}
				</View>
			</View>
		</View>
	);
};

export default Page;