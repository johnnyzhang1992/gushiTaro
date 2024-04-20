import { useState, useEffect, useRef } from 'react';
import Taro, {
	useLoad,
	usePullDownRefresh,
	useReachBottom,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';
import { useNavigationBar } from 'taro-hooks';
import { View, Text } from '@tarojs/components';

import FilterCard from '../../components/FilterCard';
import PoemSmallCard from '../../components/PoemSmallCard';

import './style.scss';

import useFetchList from '../../hooks/useFetchList';

import { fetchHomeData, fetchPoemData } from './service';
import { PoemTypes, DynastyArr } from '../../const/config';

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
	});
	const [pagination, updatePagination] = useState({
		page: 1,
		size: 15,
		total: 0,
		last_page: 1,
	});
	const cacheOptions = useRef({});

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

	useEffect(() => {
		updatePagination((pre) => {
			return {
				...pre,
				...data.pagination,
			};
		});
	}, [data]);

	useLoad((options) => {
		const { type, name, from, code, keyWord, dynasty } = options;
		cacheOptions.current = { ...options };
		console.log(type, name, from, options);
		setTitle(name || keyWord || '诗词文言');
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
				page: page + 1,
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
		<View className='page poemIndex'>
			{/* 页面顶部 -- 来自首页底部筛选 */}
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
			{/* 默认筛选项 */}
			{!pageOptions.from ? (
				<View className='filterContainer'>
					<FilterCard
						name='type'
						title='形式'
						initValue={pageOptions.type || '全部'}
						filters={PoemTypes}
						updateParams={updateParam}
					/>
					<FilterCard
						name='dynasty'
						title='朝代'
						initValue={pageOptions.dynasty || '全部'}
						filters={DynastyArr}
						updateParams={updateParam}
					/>
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
							lightWord={pageOptions.keyWord}
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
	);
};

export default Poem;
