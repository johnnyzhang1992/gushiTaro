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
	const [poemList, setList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

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
		Taro.stopPullDownRefresh();
	};
	const fetchList = () => {
		const { page, last_page: lastPage } = pagination.current;
		if (page >= lastPage) {
			return false;
		}
		if (loading) {
			return false;
		}
		Taro.showLoading({
			title: '加载中...'
		})
		setLoading(true);
		fetchPoemData('GET', pagination.current)
			.then((res) => {
				if (res.data && res.statusCode == 200) {
					const {
						data: poemData,
						current_page,
						last_page,
						total,
					} = res.data.poems;
					pagination.current = {
						...pagination.current,
						page: current_page,
						last_page,
						total,
					};
					setList(page === 1 ? poemData : [...poemList, ...poemData]);
				} else {
					setError('列表加载失败');
				}
				setLoading(false);
				Taro.hideLoading()
			})
			.catch((err) => {
				setError(err);
				setLoading(false);
				Taro.hideLoading()
			});
	};

	useEffect(() => {
		fetchList();
	}, []);

	return (
		<View className='poemContainer'>
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
