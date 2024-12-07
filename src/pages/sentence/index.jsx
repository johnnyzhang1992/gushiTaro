import { useState, useEffect, useRef, useCallback } from 'react';
import Taro, {
	useLoad,
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
		inited: false,
	});
	const [pagination, updatePagination] = useState({
		page: 1,
		size: 15,
		total: 0,
		last_page: 1,
	});
	const cacheObj = useRef({ count: 0 });

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

	const updateParam = useCallback((filterParams) => {
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
		cacheObj.current.count = cacheObj.current.count + 1;
	}, []);

	console.log(data, error, loading);
	useLoad((options) => {
		const {
			theme,
			type,
			keyWord = '',
			author_source_id = '',
			author = '',
		} = options;
		console.log('options', options);
		cacheObj.current = { ...options, count: 0 };
		updateParams((pre) => {
			return {
				...pre,
				keyWord: keyWord && keyWord !== 'undefined' ? keyWord : '',
				theme: theme && theme !== 'undefined' ? theme : '全部',
				type: type && type !== 'undefined' ? type : '全部',
				inited: true,
				author_source_id,
				author,
			};
		});
		setTitle(keyWord || author || '名句');
	});
	usePullDownRefresh(() => {
		console.log('page-pullRefresh');
		// 改变分页数据，自动触发 useFetchList hook
		updatePagination({
			page: 1,
			size: 15,
			total: 0,
			last_page: -1,
		});
		Taro.stopPullDownRefresh();
	});
	useReachBottom(() => {
		console.log('--rearchBottom');
		const { page, last_page } = pagination;
		if (page < last_page) {
			updatePagination({
				...pagination,
				page: parseInt(page) + 1,
			});
		}
	});
	const computeParams = () => {
		const keys = Object.keys(fetchParams);
		let queryStr = '';
		keys.forEach((k) => {
			queryStr += `${k}=${fetchParams[k]}&`;
		});
		return queryStr;
	};
	const getShareConfig = () => {
		const queryStr = computeParams();
		const { theme, keyWord, author } = fetchParams;
		let title = '名句';
		if (theme && theme !== '全部') {
			title = `${theme} | 名句`;
		}
		if (keyWord) {
			title = keyWord;
		}
		if (author) {
			title = author;
		}
		return {
			title,
			queryStr,
		};
	};
	useShareAppMessage(() => {
		const { title, queryStr } = getShareConfig();
		return {
			title,
			path: '/pages/sentence/index?' + queryStr,
		};
	});
	useShareTimeline(() => {
		const { title, queryStr } = getShareConfig();
		return {
			title,
			path: '/pages/sentence/index?' + queryStr,
		};
	});

	return (
		<View className='page sentenceIndex'>
			{/* 筛选区域 */}
			<FilterContainer
				categories={sentenceCategories}
				updateParam={updateParam}
				defaultTheme={fetchParams.theme}
				defaultType={fetchParams.type}
			/>
			{/* 列表显示区域 */}
			<View className='pageContainer safeBottom'>
				{data.list.map((sentence) => (
					<SentenceCard
						{...sentence}
						showCount
						key={sentence.id}
						lightWord={fetchParams.keyWord}
					/>
				))}
			</View>
			{/* loading */}
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
