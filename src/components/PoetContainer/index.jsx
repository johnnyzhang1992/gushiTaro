import { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';

import PoetSmallCard from '../../components/PoetSmallCard';

import './style.scss';
import { DynastyArr } from '../../const/config';
import { fetchPoetData } from '../../pages/poet/service';

const DynastyItem = (props) => {
	const { handleClick, dynasty, currentDynasty } = props;
	const dynastyClick = () => {
		handleClick(dynasty);
	};
	let isActive = false;
	if (['精选','全部'].includes(currentDynasty) && dynasty == '精选') {
		isActive = true;
	}
	if (currentDynasty == dynasty) {
		isActive = true;
	}
	return (
		<View
			className={`dynastyItem ${isActive ? 'active' : ''}`}
			onClick={dynastyClick}
		>
			<Text>{dynasty}</Text>
		</View>
	);
};
const PoetContainer = () => {
	const pagination = useRef({
		page: 1,
		size: 20,
		total: 0,
		last_page: 2,
	});

	const dynastyRef = useRef('全部');
	const refreshFlag = useRef(false);
	const [poetList, setList] = useState([]);
	const [error, setError] = useState('');
	const [scrollHeight, updateHeight] = useState('auto');

	const reachBottom = () => {
		console.log('--rearchBottom');
		const { page, last_page } = pagination.current;
		if (page <= last_page) {
			pagination.current.page = page + 1;
		}
		Taro.nextTick(() => {
			fetchList();
		});
	};

	const handleClick = (dynasty) => {
		dynastyRef.current = dynasty;
		console.log('----', dynasty)
		pagination.current = {
			...pagination.current,
			page: 1,
			last_page: 2,
		};
		fetchList();
	};

	const fetchList = () => {
		if (refreshFlag.current) {
			return false;
		}
		const dynasty = dynastyRef.current == '精选' ? '' : dynastyRef.current;
		const params = {
			...pagination.current,
			dynasty: dynasty,
		};
		const { page, last_page: lastPage } = pagination.current;
		if (['精选', '全部'].includes(dynastyRef.current) && page > 1) {
			return false;
		}
		if (page > lastPage) {
			return false;
		}
		refreshFlag.current = true;
		fetchPoetData('GET', params)
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
					// console.log(res);
					updateHeight(res.height || 500);
				}
			)
			.exec();
	}, []);

	return (
		<View className='poetContainer' id='poetScrollContainer'>
			{/* 左侧：朝代筛选 */}
			<ScrollView
				className='dynastyContainer'
				scrollY
				enableFlex
				enhanced
				showScrollbar={false}
				enableBackToTop
				refresherEnabled={false}
				style={{
					height: scrollHeight == 'auto' ? scrollHeight : scrollHeight + 'px',
				}}
			>
				<DynastyItem
					key='精选'
					handleClick={handleClick}
					currentDynasty={dynastyRef.current}
					dynasty='精选'
				/>
				{DynastyArr.map((item) => {
					return (
						<DynastyItem
							key={item}
							handleClick={handleClick}
							currentDynasty={dynastyRef.current}
							dynasty={item}
						/>
					);
				})}
			</ScrollView>
			{/* 右侧：诗人列表 */}
			<ScrollView
				className='scrollContainer'
				scrollY
				enableFlex
				enhanced
				showScrollbar={false}
				enableBackToTop
				refresherEnabled={false}
				onScrollToLower={reachBottom}
				style={{
					height: scrollHeight == 'auto' ? scrollHeight : scrollHeight + 'px',
				}}
			>
				{poetList.map((item) => {
					return (
						<PoetSmallCard
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
