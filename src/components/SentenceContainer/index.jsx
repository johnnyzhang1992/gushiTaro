import { ScrollView, View, Text } from '@tarojs/components';
import { useState, useRef, useEffect } from 'react';

import Taro from '@tarojs/taro';

import SentenceCard from '../../components/SentenceCard';
import Skeleton from '../Skeleton';

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
	const [loading, setLoading] = useState(false);
	const [loaded, setLoaded] = useState(false);
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

	const computeParams = (options) => {
		const { name = '', type, keyWord, theme, source_type } = options;
		let params = {};
		if (type && type == 'tag') {
			params = {
				...params,
				type: name,
			};
		} else if (name) {
			params = {
				...params,
				title: name,
				keyWord: name
			};
		}
		if (keyWord) params['keyWord'] = keyWord;
		if (theme && theme !== '全部') params['theme'] = theme;
		if (type && type !== 'tag' && type !== '全部') params['type'] = type;
		if (source_type) params['source_type'] = source_type;
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
		setLoading(page === 1);
		setError('');
		const params = computeParams(paramsRef.current);
			fetchSentenceData('GET', { ...params, page, size: pagination.current.size })
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
				setError((err && (err.errmsg || err.errMsg)) || '加载失败，请稍后重试');
				refreshFlag.current = false;
			})
			.finally(() => {
				setLoading(false);
			});
	};

	useEffect(() => {
		const p = props.params || {};
		paramsRef.current = {
			...p,
			keyWord: p.keyWord || props.keyWord || '',
			theme: p.theme || props.theme || '',
			source_type: p.source_type || props.source_type || '',
			type: p.type || (props.type && props.type !== '全部' ? props.type : ''),
		};
		pagination.current = {
			...pagination.current,
			page: 1,
			last_page: 2,
		};
		refreshFlag.current = false;
		fetchList();
		console.log('SentenceContainer params:', paramsRef.current);
	}, [props.params, props.keyWord, props.theme, props.type, props.source_type]);

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
				onScrollToLower={reachBottom}
			>
				{loading && sentenceList.length === 0 ? (
				<Skeleton rows={6} />
			) : null}
			{sentenceList.map((sentence) => (
					<SentenceCard {...sentence} showCount key={sentence.id} />
				))}
				{loading && sentenceList.length > 0 ? (
					<View className='loadingMore'>
						<Text>加载中...</Text>
					</View>
				) : null}
				{!loading && loaded && sentenceList.length === 0 && !error ? (
					<View className='empty'>
						<Text>暂无数据</Text>
					</View>
				) : null}
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
