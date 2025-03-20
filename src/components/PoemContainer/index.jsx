import { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';

import PoemSmallCard from '../../components/PoemSmallCard';

import './style.scss';

import { fetchPoemData } from '../../pages/poem/service';

const PoemContainer = () => {
	const pagination = useRef({
		page: 1,
		size: 15,
		total: 0,
		last_page: 2,
	});
	const refreshFlag = useRef(false);
	const [poemList, setList] = useState([]);
	const [error, setError] = useState('');
	const [scrollHeight, updateHeight] = useState('auto');

	const reachBottom = () => {
		console.log('--rearchBottom');
		const { page, last_page } = pagination.current;
		if (page < last_page) {
			pagination.current.page = page + 1;
		}
		Taro.nextTick(() => {
			fetchList();
		});
	};
	const pullDownRefresh = () => {
		console.log('page-pullRefresh');
		// 改变分页数据，自动触发 useFetchList hook
		pagination.current = {
			page: 1,
			size: 15,
			total: 0,
			last_page: -1,
		};
		Taro.nextTick(() => {
			fetchList();
		});
	};
	const fetchList = () => {
		if (refreshFlag.current) {
			return false;
		}
		const { page, last_page: lastPage } = pagination.current;
		if (page >= lastPage) {
			return false;
		}
		Taro.showLoading({
			title: '加载中...',
		});
		refreshFlag.current = true;
		fetchPoemData('GET', pagination.current)
			.then((res) => {
				if (res.data && res.statusCode == 200) {
					const { list = [], current_page, last_page, total } = res.data;
					pagination.current = {
						...pagination.current,
						page: parseInt(current_page),
						last_page,
						total,
					};
					console.log(list.length, 'list');
					setList(page === 1 ? list : [...poemList, ...list]);
				} else {
					setError('列表加载失败');
				}
				Taro.hideLoading();
				refreshFlag.current = false;
			})
			.catch((err) => {
				setError(err);
				Taro.hideLoading();
				refreshFlag.current = false;
			});
	};

	useEffect(() => {
		fetchList();
		Taro.createSelectorQuery()
			.select('#poemScrollContainer')
			.fields(
				{
					dataset: true,
					size: true,
					scrollOffset: true,
					properties: ['scrollX', 'scrollY'],
				},
				function (res) {
					console.log(res);
					updateHeight(res.height || 500);
				}
			)
			.exec();
	}, []);

	return (
		<View className='poemContainer' id='poemScrollContainer'>
			{/* 诗词列表 */}
			<ScrollView
				className='scrollContainer'
				scrollY
				enableFlex
				enhanced
				showScrollbar={false}
				enableBackToTop
				refresherEnabled
				onScrollToLower={reachBottom}
				onRefresherPulling={pullDownRefresh}
				style={{
					height: scrollHeight == 'auto' ? scrollHeight : scrollHeight + 'px'
				}}
			>
				{poemList.map((item) => {
					return (
						<PoemSmallCard
							{...item}
							showCount
							showBorder
							lightWord=''
							key={item.id}
						/>
					);
				})}
			</ScrollView>
			{error ? (
				<View className='pageError'>
					<View className='title'>接口请求报错：</View>
					<Text>{error}</Text>
				</View>
			) : null}
		</View>
	);
};

export default PoemContainer;
