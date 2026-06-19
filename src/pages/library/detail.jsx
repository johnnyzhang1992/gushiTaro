import { View, Text } from '@tarojs/components';
import { useState } from 'react';
import Taro, {
	useLoad,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';
import { Tabs, TabPane } from '@nutui/nutui-react-taro';

import SentenceContainer from '../../components/SentenceContainer';
import PoemContainer from '../../components/PoemContainer';

import './style.scss';

const initOptions = {
	type: '',
	name: '',
	title: '',
	code: '',
	profile: '',
	from: 'home',
	inited: false,
	keyWord: '',
};
const LibraryDetail = () => {
	const [pageOptions, setOptions] = useState(initOptions);
	const [currentTab, setTab] = useState(0);
	const handleChangeTab = (index) => {
		setTab(Number(index));
	};

	useLoad((options) => {
		setOptions({
			...initOptions,
			...options,
			inited: true,
			keyWord: options.name,
			title: options.name || '',
		});
		Taro.setNavigationBarTitle({
			title: options.name || '古诗文小助手',
		});
	});

	const computeParams = () => {
		const keys = Object.keys(pageOptions);
		let queryStr = '';
		keys.forEach((k) => {
			queryStr += `${k}=${pageOptions[k]}&`;
		});
		return queryStr;
	};

	const getShareConfig = () => {
		const queryStr = computeParams();
		const { title, name } = pageOptions;
		return {
			title: title || name,
			queryStr,
		};
	};

	useShareAppMessage(() => {
		const { title, queryStr } = getShareConfig();
		return {
			title,
			path: '/pages/library/detail?' + queryStr,
		};
	});
	useShareTimeline(() => {
		const { title, queryStr } = getShareConfig();
		return {
			title,
			path: '/pages/library/detail?' + queryStr,
		};
	});

	return (
		<View className='page libraryDetail'>
			{/* 顶部分类和一句诗词 */}
			{pageOptions.from === 'home' ? (
				<View className='poemTitle'>
					<View className='title'>
						<Text>{pageOptions.title}</Text>
					</View>
					<View className='profile'>
						<Text>{pageOptions.profile}</Text>
					</View>
				</View>
			) : null}
			{/* tab 作品，摘录 */}
			<Tabs value={currentTab} onChange={handleChangeTab}>
				<TabPane title='作品'>
					{pageOptions.inited ? (
						<PoemContainer params={pageOptions} showDynasty={false} />
					) : null}
				</TabPane>
				<TabPane title='摘录'>
					{pageOptions.inited && currentTab == 1 ? (
						<SentenceContainer params={pageOptions} />
					) : null}
				</TabPane>
			</Tabs>
		</View>
	);
};

export default LibraryDetail;
