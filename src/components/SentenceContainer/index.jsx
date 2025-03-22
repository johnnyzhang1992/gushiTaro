import { ScrollView, View, Text } from '@tarojs/components';
import { useState, useRef, useEffect } from 'react';

import Taro from '@tarojs/taro';

import SentenceCard from '../../components/SentenceCard';

import './style.scss';

import { fetchSentenceData } from '../../pages/sentence/service';

const SentenceContainer = (props) => {
	const pagination = useRef({
		page: 1,
		size: 15,
		total: 0,
		last_page: 2,
	});
	const refreshFlag = useRef(false);
	const paramsRef = useRef(props.params || {});
	const [sentenceList, setList] = useState([]);
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

	const computeParams = (options) => {
		const { name = '', type } = options;
		let params = {};
		if (type && type == 'tag') {
			params = {
				...params,
				type: name,
			};
		} else {
			params = {
				...params,
				title: name,
				keyWord: name
			};
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
		fetchSentenceData('GET', { ...params, ...pagination.current })
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
					setList(page === 1 ? list : [...sentenceList, ...list]);
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
			.select('#sentenceScrollContainer')
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

	return (
		<View className='sentenceContainer' id='sentenceScrollContainer'>
			{/* 摘录列表 */}
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
				{sentenceList.map((sentence) => (
					<SentenceCard {...sentence} showCount key={sentence.id} />
				))}
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

export default SentenceContainer;
