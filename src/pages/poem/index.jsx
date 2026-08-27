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

import PageHeader from '../../components/PageHeader';
import PoemSmallCard from '../../components/PoemSmallCard';

import './style.scss';

import useFetchList from '../../hooks/useFetchList';

import { fetchHomeData, fetchPoemData } from './service';
import { PoemTypes, DynastyArr } from '../../const/config';
import { getDynastyOptions } from '../../utils/dynasty';

const Poem = () => {
	const { setTitle } = useNavigationBar({ title: '古诗文小助手' });
	const [pageOptions, setOptions] = useState({
		type: '',
		name: '',
		title: '',
		code: '',
		profile: '',
		from: 'home', // home 首页底部筛选 nav 导航 tag
		inited: false,
		keyWord: '', // 关键词
	});
	const [fetchParams, updateParams] = useState({
		name: '',
		type: undefined,
		from: 'home',
		inited: false,
		_type: '',
	});
	const [pagination, updatePagination] = useState({
		page: 1,
		size: 15,
		total: 0,
		last_page: 1,
	});
	const cacheOptions = useRef({});
	const [dynastyOptions, setDynastyOptions] = useState(DynastyArr);

	// 从后端拉取朝代列表并缓存
	useEffect(() => {
		getDynastyOptions().then((list) => {
			if (list && list.length > 0) setDynastyOptions(list);
		});
	}, []);

	// 使用自定义hook 获取诗词分页数据
	const { data, error, loading } = useFetchList(
		fetchParams.name ? fetchHomeData : fetchPoemData,
		fetchParams,
		pagination
	);

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

	const updateSearchType = (_type) => {
		updateParams((pre) => ({
			...pre,
			_type,
		}));
		updatePagination({
			page: 1,
			size: 15,
			total: 0,
			last_page: -1,
		});
	};
	useEffect(() => {
		updatePagination((pre) => {
			return {
				...pre,
				...data.pagination,
			};
		});
	}, [data]);

	useLoad((options) => {
		const { type, name, from, code, keyWord, dynasty, author } = options;
		cacheOptions.current = { ...options };
		console.log(type, name, from, options);
		setTitle(name || keyWord || author || '诗词文言');
		setOptions({
			...options,
			title: name,
			name: code,
			inited: true,
		});
		let params = {
			from: from || 'home',
			inited: true,
		};
		// 支持直接传 author 参数（从作者详情页跳转）
		if (author) {
			params['keyWord'] = author;
			params['_type'] = 'author';
		}
		if (type) {
			// tag 对应 标签筛选
			// author 对应作者筛选，仅加载该作者的诗词
			// poem 标题和内容匹配
			if (['tag', 'author', 'poem'].includes(type)) {
				params['_type'] = type;
			} else {
				params['type'] = type;
			}
		}
		if (keyWord) {
			params['keyWord'] = keyWord;
		}
		if (code) {
			params['name'] = code;
		}
		if (dynasty && dynasty !== 'undefined') {
			params['dynasty'] = dynasty;
		}
		updateParams(params);
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
		const { dynasty, type } = fetchParams;
		let queryStr = '';
		let newObj = {
			...cacheOptions.current,
		};
		if (dynasty) {
			newObj['dynasty'] = dynasty;
		}
		if (type) {
			newObj['type'] = type;
		}
		Object.keys(newObj).forEach((key) => {
			if (newObj[key]) {
				queryStr += `${key}=${newObj[key]}&`;
			}
		});
		return queryStr;
	};
	useShareAppMessage(() => {
		const queryStr = computeParams();
		const { keyWord } = fetchParams;
		return {
			title: keyWord || '诗词文言',
			path: '/pages/poem/index?' + queryStr,
		};
	});
	useShareTimeline(() => {
		const queryStr = computeParams();
		const { keyWord } = fetchParams;
		return {
			title: keyWord || '诗词文言',
			path: '/pages/poem/index?' + queryStr,
		};
	});
	return (
		<View className='poemPage'>
			<PageHeader
				showBack
				showSearch={false}
				title={pageOptions.title || fetchParams.author || '诗词'}
			/>
			<View className='searchBar'>
				<View className='searchInputWrap'>
					<Input
						className='searchInput'
						placeholder='搜索诗词标题/作者/内容'
						placeholderClass='searchPlaceholder'
						value={fetchParams.keyWord || ''}
						onInput={(e) => {
							const val = e.detail.value;
							updateParams({ keyWord: val });
						}}
						onConfirm={() => {
							updatePagination({ page: 1 });
						}}
					/>
					{fetchParams.keyWord ? (
						<View className='searchClear' onClick={() => updateParams({ keyWord: '' })}>
							<Text className='searchClearIcon'>×</Text>
						</View>
					) : null}
				</View>
				<View className='searchBtn' onClick={() => updatePagination({ page: 1 })}>
					<Text className='searchBtnText'>搜索</Text>
				</View>
			</View>
			{/* 搜索范围 */}
			<View className='searchScope'>
				<Text
					className={`scopeItem ${!fetchParams._type ? 'active' : ''}`}
					onClick={() => updateParams({ _type: '' })}
				>
					全部
				</Text>
				{['标题', '作者', '标签', '内容'].map((item, idx) => {
					const types = ['title', 'author', 'tag', 'poem'];
					return (
						<Text
							key={item}
							className={`scopeItem ${fetchParams._type === types[idx] ? 'active' : ''}`}
							onClick={() => updateParams({ _type: types[idx] })}
						>
							{item}
						</Text>
					);
				})}
			</View>
			{/* 诗词类型 */}
			<View className='typeFilter'>
				{PoemTypes.map((t) => (
					<View
						key={t}
						className={`typeFilterItem ${(fetchParams.type || '全部') === t ? 'active' : ''}`}
						onClick={() => updateParams({ type: t === fetchParams.type ? '全部' : t })}
					>
						{t}
					</View>
				))}
			</View>
			{/* 朝代筛选 */}
			<ScrollView className='dynastyFilter' scrollX showScrollbar={false}>
				{dynastyOptions.map((d) => (
					<View
						key={d}
						className={`dynastyFilterItem ${fetchParams.dynasty === d ? 'active' : ''}`}
						onClick={() => updateParams({ dynasty: d === fetchParams.dynasty ? '全部' : d })}
					>
						{d}
					</View>
				))}
			</ScrollView>
			<ScrollView
				className='poemScrollView'
				scrollY
				scrollWithAnimation
				onScrollToLower={useReachBottom}
			>
			<View className='page poemIndex'>
				{/* 页面顶部 -- 来自首页底部筛选 */}
				{pageOptions.from === 'home' && !fetchParams.author ? (
					<View className='poemTitle'>
						<View className='title'>
							<Text>{pageOptions.title}</Text>
						</View>
						<View className='profile'>
							<Text>{pageOptions.profile}</Text>
						</View>
					</View>
				) : null}
				{/* 诗词列表 */}
				<View className='pageContainer safeBottom'>
					{data.list.map((item) => {
						return (
							<PoemSmallCard
								{...item}
								showCount
								showBorder
								key={item.id}
								lightWord={
									pageOptions.from === 'search' ? pageOptions.keyWord : ''
								}
							/>
						);
					})}
				</View>
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

export default Poem;
