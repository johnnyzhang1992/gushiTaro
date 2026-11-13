import { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';

import PoetSmallCard from '../../components/PoetSmallCard';
import Skeleton from '../Skeleton';

import './style.scss';
import { DynastyArr } from '../../const/config';
import { fetchPoetData } from '../../pages/poet/service';
import { getDynastyOptions } from '../../utils/dynasty';
import { isApiSuccess, getApiData } from '../../apis/response';

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
	const reqIdRef = useRef(0);
	const [poetList, setList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [dynastyList, setDynastyList] = useState(DynastyArr);

	const reachBottom = () => {
		console.log('--rearchBottom');
		const { page, last_page } = pagination.current;
		if (page < last_page) {
			Taro.nextTick(() => {
				fetchList(page + 1);
			});
		}
	};

	const handleClick = (dynasty) => {
		dynastyRef.current = dynasty;
		console.log('----', dynasty)
		pagination.current = {
			...pagination.current,
			page: 1,
			last_page: 2,
		};
		refreshFlag.current = false;
		fetchList();
	};

	const fetchList = (nextPage) => {
		if (refreshFlag.current) {
			return false;
		}
		const dynasty = dynastyRef.current;
		const { last_page: lastPage } = pagination.current;
		const page = nextPage || pagination.current.page;
		const params = {
			page,
			size: pagination.current.size,
			dynasty: dynasty,
		};
		if (searchRef.current) params['keyWord'] = searchRef.current;
		if (dynasty === '全部' && page > 1) {
			return false;
		}
		if (page > lastPage) {
			return false;
		}
		refreshFlag.current = true;
		setLoading(page === 1);
		setError('');
		const seq = ++reqIdRef.current;
		fetchPoetData('GET', params)
			.then((res) => {
				if (seq !== reqIdRef.current) return;
				const apiData = getApiData(res);
				if (isApiSuccess(res) && apiData) {
					const { list = [], current_page, last_page, total } = apiData;
					pagination.current = {
						...pagination.current,
						page: parseInt(current_page),
						last_page,
						total,
					};
					// 函数式更新，避免闭包里的旧列表丢数据
					setList((pre) => (page === 1 ? list : [...pre, ...list]));
				} else {
					setError('列表加载失败');
				}
				refreshFlag.current = false;
			})
			.catch((err) => {
				if (seq !== reqIdRef.current) return;
				setError(err?.errmsg || err?.errMsg || '加载失败');
				refreshFlag.current = false;
			})
			.finally(() => {
				if (seq === reqIdRef.current) {
					setLoading(false);
				}
			});
	};

	useEffect(() => {
		fetchList();
		// 从后端拉取朝代列表并缓存
		getDynastyOptions().then((list) => {
			if (list && list.length > 0) setDynastyList(list);
		});
	}, []);

	// 搜索参数变化时重新查询（文库传入 params 对象，兼容外部直接传 keyWord）
	useEffect(() => {
		const newKey = props.params?.keyWord ?? (props.keyWord || '');
		if (newKey !== searchRef.current) {
			searchRef.current = newKey;
			pagination.current = { ...pagination.current, page: 1, last_page: 2 };
			refreshFlag.current = false;
			fetchList();
		}
	}, [props.params, props.keyWord]);

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
