import { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';

import PoemSmallCard from '../../components/PoemSmallCard';

import './style.scss';

import { fetchPoemData } from '../../pages/poem/service';

import { DynastyArr } from '../../const/config';

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
	const paramsRef = useRef(props.params || {});
	const [poemList, setList] = useState([]);
	const [error, setError] = useState('');
	const [scrollHeight, updateHeight] = useState('auto');
	const [activeDynasty, setDynasty] = useState('全部');

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

	const computeParams = (options) => {
		const { type, from, code, keyWord, dynasty } = options;
		let params = {
			from: from || 'home',
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
		return params;
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
		const params = computeParams(paramsRef.current);
		console.log(props.params, pagination.current);
		Taro.showLoading({ title: '加载中' });
		fetchPoemData('GET', { ...params, ...pagination.current })
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
				refreshFlag.current = false;
			})
			.catch((err) => {
				setError(err);
				refreshFlag.current = false;
			})
			.finally(() => {
				Taro.hideLoading();
			});
	};

	const dynastyChange = (dynasty) => {
		const next = activeDynasty == dynasty ? '全部' : dynasty;
		paramsRef.current = {
			...paramsRef.current,
			dynasty: next,
		};
		setDynasty(next);
		fetchList();
	};

	useEffect(() => {
		paramsRef.current = {
			...(props.params || {}),
		};
		pagination.current = {
			...pagination.current,
			page: 1,
			last_page: 2,
		};
		refreshFlag.current = false;
		fetchList();
		console.log(props.params, 'params');
	}, [props.params]);

	useEffect(() => {
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
					updateHeight(res.height || 500);
				}
			)
			.exec();
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
				style={{
					height: scrollHeight == 'auto' ? scrollHeight : scrollHeight + 'px',
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
			{/* 朝代筛选 */}
			{showDynasty && (
				<View className='dynastyFilter'>
					{DynastyArr.map((item) => (
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
