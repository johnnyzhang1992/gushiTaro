import { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';

import PoemSmallCard from '../../components/PoemSmallCard';
import Skeleton from '../Skeleton';

import './style.scss';

import { fetchPoemData } from '../../pages/poem/service';

import { DynastyArr } from '../../const/config';
import { getDynastyOptions } from '../../utils/dynasty';
import { isApiSuccess, getApiData } from '../../apis/response';

const DynastyItem = ({ dynasty, active = false, onClick }) => {
	const handleClick = () => {
		if (onClick) {
			onClick(dynasty);
		}
	};

	return (
		<View
			className={['dynastyFilterItem', active ? 'active' : '']}
			onClick={handleClick}
		>
			{dynasty}
		</View>
	);
};

const PoemContainer = (props) => {
	const pagination = useRef({
		page: 1,
		size: 15,
		total: 0,
		last_page: 2,
	});
	const refreshFlag = useRef(false);
	const reqIdRef = useRef(0);
	const paramsRef = useRef(props.params || {});
	const [poemList, setList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const [error, setError] = useState('');
	const [activeDynasty, setDynasty] = useState('全部');
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

	const computeParams = (options) => {
		const { type, code, keyWord, dynasty } = options;
		let params = {};
		if (type) {
			// tag/author/title/content 对应搜索范围，poem = 标题+内容全文
			if (['tag', 'author', 'poem', 'title', 'content'].includes(type)) {
				params['_type'] = type;
			} else {
				params['type'] = type;
			}
		}
		// 搜索范围 field：title/author/content/tag -> _type
		if (options.field && ['title', 'author', 'content', 'tag'].includes(options.field)) {
			params['_type'] = options.field;
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
		return params;
	};

	const fetchList = (nextPage) => {
		if (refreshFlag.current) {
			return false;
		}
		const { last_page: lastPage } = pagination.current;
		const page = nextPage || pagination.current.page;
		if (page >= lastPage) {
			return false;
		}
		refreshFlag.current = true;
		setLoading(page === 1);
		setError('');
		const params = computeParams(paramsRef.current);
		console.log(props.params, pagination.current);
		const seq = ++reqIdRef.current;
		fetchPoemData('GET', { ...params, page, size: pagination.current.size })
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
					console.log(list.length, 'list');
					// 函数式更新，避免闭包里的旧列表丢数据
					setList((pre) => (page === 1 ? list : [...pre, ...list]));
					setLoaded(true);
				} else {
					setError('列表加载失败，请稍后重试');
				}
				refreshFlag.current = false;
			})
			.catch((err) => {
				if (seq !== reqIdRef.current) return;
				setError((err && (err.errmsg || err.errMsg)) || '加载失败，请稍后重试');
				refreshFlag.current = false;
			})
			.finally(() => {
				if (seq === reqIdRef.current) {
					setLoading(false);
				}
			});
	};

	const dynastyChange = (dynasty) => {
		const next = activeDynasty == dynasty ? '全部' : dynasty;
		paramsRef.current = {
			...paramsRef.current,
			dynasty: next,
		};
		setDynasty(next);
		// 切换筛选：重置分页、清空列表后重新请求
		setList([]);
		pagination.current = {
			...pagination.current,
			page: 1,
			last_page: 2,
		};
		refreshFlag.current = false;
		fetchList();
	};

	useEffect(() => {
		paramsRef.current = {
			...(props.params || {}),
			...(props.keyWord ? { keyWord: props.keyWord } : {}),
		};
		pagination.current = {
			...pagination.current,
			page: 1,
			last_page: 2,
		};
		refreshFlag.current = false;
		fetchList();
		console.log(props.params, 'params');
	}, [props.params, props.keyWord]);

	// 从后端拉取朝代列表并缓存
	useEffect(() => {
		getDynastyOptions().then((list) => {
			if (list && list.length > 0) setDynastyList(list);
		});
	}, []);

	const { showDynasty = false } = props;

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
				onScrollToLower={reachBottom}
			>
				{loading && poemList.length === 0 ? (
					<Skeleton rows={6} />
				) : null}
				{poemList.map((item, idx) => {
					return (
					<PoemSmallCard
						{...item}
						showCount
						showBorder
						clampLines={6}
						lightWord=''
						key={`${item._id}_${idx}`}
					/>
					);
				})}
				{loading && poemList.length > 0 ? (
					<View className='loadingMore'>
						<Text>加载中...</Text>
					</View>
				) : null}
				{!loading && loaded && poemList.length === 0 && !error ? (
					<View className='empty'>
						<Text>暂无数据</Text>
					</View>
				) : null}
			</ScrollView>
			{/* 朝代筛选 */}
			{showDynasty && (
				<View
					className='dynastyFilter'
				>
					{dynastyList.map((item) => (
						<DynastyItem
							key={item}
							dynasty={item}
							active={activeDynasty == item}
							onClick={dynastyChange}
						/>
					))}
				</View>
			)}
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
