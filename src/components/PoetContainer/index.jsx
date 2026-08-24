import { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';

import PoetSmallCard from '../../components/PoetSmallCard';
import Skeleton from '../Skeleton';

import './style.scss';
import { DynastyArr } from '../../const/config';
import { fetchPoetData } from '../../pages/poet/service';
import { getDynastyOptions } from '../../utils/dynasty';

const DynastyItem = (props) => {
	const { handleClick, dynasty, currentDynasty } = props;
	const dynastyClick = () => {
		handleClick(dynasty);
	};
	let isActive = currentDynasty == dynasty;
	return (
		<View
			className={`dynastyItem ${isActive ? 'active' : ''}`}
			onClick={dynastyClick}
		>
			<Text>{dynasty}</Text>
		</View>
	);
};
const PoetContainer = (props) => {
	const pagination = useRef({
		page: 1,
		size: 20,
		total: 0,
		last_page: 2,
	});

	const dynastyRef = useRef('全部');
	const searchRef = useRef(props.keyWord || '');
	const refreshFlag = useRef(false);
	const [poetList, setList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [dynastyList, setDynastyList] = useState(DynastyArr);

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
		const dynasty = dynastyRef.current;
		const params = {
			...pagination.current,
			dynasty: dynasty,
		};
		if (searchRef.current) params['keyWord'] = searchRef.current;
		const { page, last_page: lastPage } = pagination.current;
		if (dynastyRef.current === '全部' && page > 1) {
			return false;
		}
		if (page > lastPage) {
			return false;
		}
		refreshFlag.current = true;
		setLoading(page === 1);
		fetchPoetData('GET', params)
			.then((res) => {
				const apiData = res.data?.data || res.data;
				if ((res.status || res.statusCode == 200) && apiData) {
					const { list = [], current_page, last_page, total } = apiData;
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
			})
			.finally(() => {
				setLoading(false);
			});
	};

	useEffect(() => {
		fetchList();
		// 从后端拉取朝代列表并缓存
		getDynastyOptions().then((list) => {
			if (list && list.length > 0) setDynastyList(list);
		});
	}, []);

	// 搜索参数变化时重新查询
	useEffect(() => {
		const newKey = props.keyWord || '';
		if (newKey !== searchRef.current) {
			searchRef.current = newKey;
			pagination.current = { ...pagination.current, page: 1, last_page: 2 };
			refreshFlag.current = false;
			fetchList();
		}
	}, [props.keyWord]);

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
			>
				{dynastyList.map((item) => {
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
				onScrollToLower={reachBottom}
			>
				{loading && poetList.length === 0 ? (
				<Skeleton rows={6} />
			) : null}
			{poetList.map((item, idx) => {
					return (
						<PoetSmallCard
							{...item}
							showCount
							showBorder
							lightWord=''
							key={`${item._id}_${idx}`}
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
