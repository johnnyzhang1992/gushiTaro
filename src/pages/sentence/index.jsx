import { useState, useEffect } from 'react';
import Taro, {
	useLoad,
	useDidHide,
	useDidShow,
	useUnload,
	usePullDownRefresh,
	useReachBottom,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';
import { useNavigationBar } from 'taro-hooks';
import { View, Text } from '@tarojs/components';

import FilterContainer from './components/FilterContainer';
import SentenceCard from '../../components/SentenceCard';

import useFetchList from '../../hooks/useFetchList';

import { fetchSentenceData } from './service';
import { sentenceCategories } from '../../const/config';

import './style.scss';

const SentencePage = () => {
	const { setTitle } = useNavigationBar({ title: '古诗文小助手' });
	const [fetchParams, updateParams] = useState({
		theme: '全部',
		type: '全部',
		from: 'home',
		inited: true,
	});
	const [pagination, updatePagination] = useState({
		page: 1,
		size: 15,
		total: 0,
		last_page: 1,
	});

	// 使用自定义hook 获取诗词分页数据
	const { data, error, loading } = useFetchList(
		fetchSentenceData,
		fetchParams,
		pagination
	);

	useEffect(() => {
		updatePagination((pre) => {
			return {
				...pre,
				...data.pagination,
			};
		});
	}, [data]);

	const updateParam = (filterParams) => {
		console.log('filterParams--更新:', filterParams);
		updateParams((pre) => {
			return {
				...pre,
				...filterParams,
			};
		});
		updatePagination({
			page: 1,
			size: 15,
			total: 0,
			last_page: -1,
		});
	};

	console.log(data, error, loading);
	useLoad(() => {
		setTitle('名句 | 古诗文助手');
	});

	useDidShow(() => {
		console.log('page--show');
	});
	useDidHide(() => {
		console.log('page-hide');
	});
	usePullDownRefresh(() => {
		console.log('page-pullRefresh');
		Taro.stopPullDownRefresh();
	});
	useReachBottom(() => {
		console.log('--rearchBottom');
		const { page, last_page } = pagination;
		if (page < last_page) {
			updatePagination({
				...pagination,
				page: page + 1,
			});
		}
	});
	useUnload(() => {
		console.log('page-unload');
	});
	useShareAppMessage(() => {
		return {
			title: '名句',
			path: '/pages/sentence/index',
		};
	});
	useShareTimeline(() => {
		return {
			title: '名句',
			path: '/pages/sentence/index',
		};
	});

	return (
		<View className='page'>
			{/* 筛选区域 */}
			<FilterContainer
				categories={sentenceCategories}
				updateParam={updateParam}
			/>
			<View className='divide' />
			<View className='pageContainer'>
				{data.list.map((sentence) => (
					<SentenceCard key={sentence.id} showCount {...sentence} />
				))}
			</View>
			{/* 列表显示区域 */}
			{loading ? (
				<View className='loading'>
					<Text>内容加载中...</Text>
				</View>
			) : null}
			{error ? (
				<View className='pageError'>
					<View className='title'>接口请求报错：</View>
					<Text>{error}</Text>
				</View>
			) : null}
		</View>
	);
};

export default SentencePage;
