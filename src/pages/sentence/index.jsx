import { useState, useEffect, useRef } from 'react';
import Taro, {
	useLoad,
	usePullDownRefresh,
	useReachBottom,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';
import { useNavigationBar } from 'taro-hooks';
import { View, Text, ScrollView, Input } from '@tarojs/components';

import FilterCard from '../../components/FilterCard';
import SentenceCard from '../../components/SentenceCard';
import PageHeader from '../../components/PageHeader';

import useFetchList from '../../hooks/useFetchList';

import { fetchSentenceData, fetchSentenceFilters } from './service';

import './style.scss';

const SentencePage = () => {
	const { setTitle } = useNavigationBar({ title: '古诗文小助手' });
	const [fetchParams, updateParams] = useState({
		theme: '全部',
		type: '全部',
		source_type: '',
		inited: false,
	});
	const [pagination, updatePagination] = useState({
		page: 1,
		size: 15,
		total: 0,
		last_page: 1,
	});
	const cacheObj = useRef({ count: 0 });
	const [themeOptions, setThemeOptions] = useState(['全部']);
	const [categoryMap, setCategoryMap] = useState({});

	// 使用自定义hook 获取诗词分页数据
	const { data, error, loading, loaded } = useFetchList(
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

	// 摘录筛选选项（主题/类型），来自后端 /api/sentences/filters
	useEffect(() => {
		fetchSentenceFilters('GET', {}).then((res) => {
			if (res && res.status && res.data) {
				setThemeOptions(['全部', ...(res.data.themes || [])]);
				const map = {};
				(res.data.categories || []).forEach((c) => { map[c.theme_name] = c.types || []; });
				setCategoryMap(map);
			}
		}).catch(() => {});
	}, []);

	// 类型跟随主题：切换主题后类型列表随之变化，类型重置为全部
	const handleFilterSelect = (name, value) => {
		const filterParams = name === 'theme' ? { theme: value, type: '全部' } : { type: value };
		updateParams((pre) => ({ ...pre, ...filterParams, inited: true }));
		updatePagination({ page: 1, size: 15, total: 0, last_page: -1 });
	};

	// 类型列表跟随主题：未选主题时仅「全部」
	const typeOptions = ['全部', ...(fetchParams.theme !== '全部' ? categoryMap[fetchParams.theme] || [] : [])];

	console.log(data, error, loading);
	useLoad((options) => {
		const {
			theme,
			type,
			keyWord = '',
			author_source_id = '',
			author = '',
			source_type = '',
		} = options;
		console.log('options', options);
		cacheObj.current = { ...options, count: 0 };
		updateParams((pre) => {
			return {
				...pre,
				keyWord: keyWord && keyWord !== 'undefined' ? keyWord : '',
				theme: theme && theme !== 'undefined' ? theme : '全部',
				type: type && type !== 'undefined' ? type : '全部',
				source_type: source_type && source_type !== 'undefined' ? source_type : '',
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
		<View className='sentencePage'>
			<PageHeader showBack showSearch={false} title={fetchParams.author || fetchParams.keyWord || '名句'} />
			<View className='searchBar'>
				<View className='searchInputWrap'>
					<Input
						className='searchInput'
						placeholder='搜索名句内容/作者'
						placeholderClass='searchPlaceholder'
						value={fetchParams.keyWord || ''}
						onInput={(e) => {
							const val = e.detail.value;
							updateParams((pre) => ({ ...pre, keyWord: val, inited: true }));
						}}
						onConfirm={() => {
							updatePagination({ page: 1 });
						}}
					/>
					{fetchParams.keyWord ? (
						<View className='searchClear' onClick={() => updateParams((pre) => ({ ...pre, keyWord: '' }))}>
							<Text className='searchClearIcon'>×</Text>
						</View>
					) : null}
				</View>
				<View className='searchBtn' onClick={() => {
						updateParams((pre) => ({ ...pre, inited: true }));
						updatePagination({ page: 1 });
					}}>
					<Text className='searchBtnText'>搜索</Text>
				</View>
			</View>
			<ScrollView className='sentenceScrollView' scrollY scrollWithAnimation>
			<View className='page sentenceIndex'>
			{/* 筛选区域：主题/类型（互斥） */}
			<FilterCard
				name='theme'
				title='主题'
				filters={themeOptions}
				initValue={fetchParams.theme}
				updateParams={(obj) => handleFilterSelect('theme', obj.theme)}
			/>
			<FilterCard
				name='type'
				title='类型'
				filters={typeOptions}
				initValue={fetchParams.type}
				updateParams={(obj) => handleFilterSelect('type', obj.type)}
			/>
			{/* 列表显示区域 */}
			<View className='pageContainer safeBottom'>
				{data.list.length > 0 ? (
					data.list.map((sentence) => (
						<SentenceCard
							{...sentence}
							showCount
							key={sentence.id}
							lightWord={fetchParams.keyWord}
						/>
					))
				) : !loading && loaded ? (
					<View className='emptyState'>
						<Text className='emptyText'>暂无数据</Text>
					</View>
				) : null}
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
			</ScrollView>
		</View>
	);
};

export default SentencePage;
