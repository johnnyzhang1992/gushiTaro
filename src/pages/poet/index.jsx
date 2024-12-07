import { useState, useEffect } from 'react';
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
import PoetCard from '../../components/PoetCard';

import useFetchList from '../../hooks/useFetchList';

import { fetchPoetData } from './service';
import { DynastyArr } from '../../const/config';

import './style.scss';

const PoetPage = () => {
	const { setTitle } = useNavigationBar({ title: '古诗文小助手' });
	const [fetchParams, updateParams] = useState({
		dynasty: '全部',
		from: 'home',
		requestType: 'poet',
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
		fetchPoetData,
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
		console.log(options);
		const { keyWord } = options;
		if (keyWord && keyWord !== 'undefined') {
			updateParams((pre) => ({
				...pre,
				keyWord,
			}));
			setTitle(keyWord + ' 诗人');
		} else {
			setTitle('诗人');
		}
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
	useShareAppMessage(() => {
		const { keyWord } = fetchParams;
		return {
			title: '诗人',
			path: '/pages/poet/index?keyWord=' + keyWord,
		};
	});
	useShareTimeline(() => {
		const { keyWord } = fetchParams;
		return {
			title: '诗人',
			path: '/pages/poet/index?keyWord=' + keyWord,
		};
	});
	return (
		<View className='page poetIndex'>
			{/* 筛选 */}
			<View className='filterContainer'>
				<FilterCard
					name='dynasty'
					title='朝代'
					filters={DynastyArr}
					updateParams={updateParam}
				/>
			</View>
			{/* 关键字筛选 */}
			{/* <View className='keywordFilter'>
				{fetchParams.dynasty ? (
					<Text decode className='key'>
						{fetchParams.dynasty || ''}
					</Text>
				) : null}
				{fetchParams.keyWord ? (
					<Text decode className='key'>
						{fetchParams.keyWord || ''}
					</Text>
				) : null}
				<Text decode>共 {pagination.total} 条结果</Text>
			</View> */}
			{/* 列表 */}
			<View className='pageContainer safeBottom'>
				{data.list.map((item) => {
					return (
						<PoetCard
							{...item}
							key={item.id}
							lightWord={fetchParams.keyWord}
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

export default PoetPage;
