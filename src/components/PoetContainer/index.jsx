import { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';

import PoetCard from "../../components/PoetCard";

import './style.scss';

import { fetchPoetData } from '../../pages/poet/service';

const PoetContainer = () => {
	const pagination = useRef({
		page: 1,
		size: 15,
		total: 0,
		last_page: 2,
	});
	const refreshFlag = useRef(false);
	const [poetList, setList] = useState([]);
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
		refreshFlag.current = true;
		fetchPoetData('GET', pagination.current)
			.then((res) => {
				if (res.data && res.statusCode == 200) {
					const { list = [], current_page, last_page, total } = res.data;
					pagination.current = {
						...pagination.current,
						page: parseInt(current_page),
						last_page,
						total,
					};
					setList(page === 1 ? list : [...poetList, ...list]);
				} else {
					setError('列表加载失败');
				}
				refreshFlag.current = false;
			})
			.catch((err) => {
				setError(err);
				refreshFlag.current = false;
			});
	};

	useEffect(() => {
		fetchList();
		Taro.createSelectorQuery()
			.select('#poetScrollContainer')
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
		<View className='poetContainer' id='poetScrollContainer'>
			{/* 诗人列表 */}
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
					height: scrollHeight == 'auto' ? scrollHeight : scrollHeight + 'px',
				}}
			>
				{poetList.map((item) => {
					return (
						<PoetCard
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

export default PoetContainer;
