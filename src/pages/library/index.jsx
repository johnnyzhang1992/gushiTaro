import { View, Text } from '@tarojs/components';
import { useState } from 'react';

import PageHeader from '../../components/PageHeader';
import PoemContainer from '../../components/PoemContainer';
import PoetContainer from '../../components/PoetContainer';
import AllusionContainer from '../../components/AllusionContainer';
import SentenceContainer from '../../components/SentenceContainer';
import CollectionContainer from '../../components/CollectionContainer';
import LibrarySearchBar from '../../components/LibrarySearchBar';

import './style.scss';

// 自研 TAB 配置
const TABS = [
	{ key: 0, label: '作品' },
	{ key: 1, label: '摘录' },
	{ key: 2, label: '作者' },
	{ key: 3, label: '诗单' },
	{ key: 4, label: '典故' },
];

const Page = () => {
	const [currentTab, setTab] = useState(0);
	// 每个 TAB 独立的搜索参数，切换 TAB 时不会丢失
	const [tabParams, setTabParams] = useState({0: {}, 1: {}, 2: {}, 3: {}, 4: {}});
	// 记录每个 TAB 是否已加载过数据
	const [tabLoaded, setTabLoaded] = useState({0: true, 1: false, 2: false, 3: false, 4: false});

	const handleChangeTab = (index) => {
		setTab(index);
		// 标记该 TAB 已加载
		if (!tabLoaded[index]) {
			setTabLoaded(prev => ({ ...prev, [index]: true }));
		}
	};

	const handleSearch = (params) => {
		setTabParams(prev => ({ ...prev, [currentTab]: params }));
	};

	// 内容类 tab 包装：搜索筛选栏 + 列表容器
	const renderContentTab = (tabIndex, ContainerEl, extraProps) => (
		<View className='tabPaneContent'>
			<LibrarySearchBar tab={tabIndex} onSearch={handleSearch} />
			<View className='containerWrap'>
				<ContainerEl {...extraProps} params={tabParams[tabIndex] || {}} />
			</View>
		</View>
	);

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
				{/* TAB 0: 作品 - 默认加载 */}
				<View className='tabPane' style={{ display: currentTab === 0 ? 'block' : 'none' }}>
					{tabLoaded[0] && renderContentTab(0, PoemContainer, {})}
				</View>
				{/* TAB 1: 摘录 */}
				{tabLoaded[1] ? (
					<View className='tabPane' style={{ display: currentTab === 1 ? 'block' : 'none' }}>
						{renderContentTab(1, SentenceContainer, {})}
					</View>
				) : currentTab === 1 && (
					<View className='tabPane'>
						{renderContentTab(1, SentenceContainer, {})}
					</View>
				)}
				{/* TAB 2: 作者 */}
				{tabLoaded[2] ? (
					<View className='tabPane' style={{ display: currentTab === 2 ? 'block' : 'none' }}>
						{renderContentTab(2, PoetContainer, {})}
					</View>
				) : currentTab === 2 && (
					<View className='tabPane'>
						{renderContentTab(2, PoetContainer, {})}
					</View>
				)}
				{/* TAB 3: 诗单 */}
				{tabLoaded[3] ? (
					<View className='tabPane' style={{ display: currentTab === 3 ? 'block' : 'none' }}>
						<CollectionContainer />
					</View>
				) : currentTab === 3 && (
					<View className='tabPane'>
						<CollectionContainer />
					</View>
				)}
				{/* TAB 4: 典故 */}
				{tabLoaded[4] ? (
					<View className='tabPane' style={{ display: currentTab === 4 ? 'block' : 'none' }}>
						{renderContentTab(4, AllusionContainer, {})}
					</View>
				) : currentTab === 4 && (
					<View className='tabPane'>
						{renderContentTab(4, AllusionContainer, {})}
					</View>
				)}
			</View>
		</View>
	);
};

export default Page;