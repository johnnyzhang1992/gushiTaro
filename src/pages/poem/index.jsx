import { useState, useEffect } from 'react';
import Taro, {
	useLoad,
	useDidHide,
	useDidShow,
	useUnload,
	usePullDownRefresh,
	useReachBottom,
} from '@tarojs/taro';
import { useNavigationBar } from 'taro-hooks';
import { View, Text } from '@tarojs/components';

import PoemSmallCard from '../../components/PomSmallCard';

import useFetchList from '../../hooks/useFetchList';

import { fetchHomeData } from './service';

import './style.scss';

const Poem = () => {
	const { setTitle } = useNavigationBar({ title: '古诗文小助手' });
	const [pageOptions, setOptions] = useState({
		type: '',
		name: '',
		title: '',
		code: '',
		profile: '',
		from: 'home', // home 首页底部筛选 nav 导航
		inited: false,
	});
	const [fetchParams, updateParams] = useState({
		name: '',
		from: 'home',
		inited: false,
	});
	const [pagination, updatePagination] = useState({
		page: 1,
		size: 15,
		total: 0,
		last_page: 1,
	});

	// 使用自定义hook 获取诗词分页数据
	const { data, error, loading } = useFetchList(
		fetchHomeData,
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

	useLoad((options) => {
		const { type, name, from, code } = options;
		console.log(type, name, from, options);
		setTitle(name);
		setOptions({
			...options,
			title: name,
			name: code,
			inited: true,
		});
		updateParams({
			name: code,
			from: 'home',
			inited: true,
		});
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
	return (
		<View className='page'>
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
			) : (
				<View className='filter'>
					<Text>顶部筛选部分</Text>
				</View>
			)}
			{/* 顶部筛选 -  */}
			<View className='divide' />
			{/* 诗词列表 */}
			<View className='pageContainer'>
				{data.list.map((item) => {
					return <PoemSmallCard {...item} key={item.id} />;
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