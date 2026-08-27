import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useState } from 'react';

import WordCard from '../../components/Dictionary/WordCard';
import { fetchDictionarySearch } from './service';

import './style.scss';

const typeMap = {
	word: '字',
	ci: '词语',
	chengyu: '成语',
};

const DictionaryList = () => {
	const [list, setList] = useState([]);
	const [loading, setLoading] = useState(true);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [keyWord, setKeyWord] = useState('');
	const [type, setType] = useState('');

	useLoad((options) => {
		const { type: t, keyWord: k } = options;
		setType(t);
		setKeyWord(k || '');
		Taro.setNavigationBarTitle({ title: typeMap[t] || '字典' });
		loadData(t, k, 1);
	});

	const loadData = (t, k, p) => {
		setLoading(true);
		fetchDictionarySearch('GET', { type: t, keyWord: k, page: p, size: 20 })
			.then((res) => {
				const data = res.data || {};
				const newList = data.list || [];
				setList(prev => p === 1 ? newList : [...prev, ...newList]);
				setTotal(data.total || 0);
				setPage(p);
			})
			.finally(() => setLoading(false));
	};

	const handleSearch = () => {
		setList([]);
		setPage(1);
		loadData(type, keyWord, 1);
	};

	const loadMore = () => {
		if (list.length < total && !loading) {
			loadData(type, keyWord, page + 1);
		}
	};

	return (
		<View className='page dictionaryListPage'>
			{/* 搜索框 */}
			<View className='searchBar'>
				<View className='searchInputWrapper'>
					<Input
						className='searchInput'
						placeholder='搜索...'
						placeholderClass='searchPlaceholder'
						value={keyWord}
						onInput={(e) => setKeyWord(e.detail.value)}
						onConfirm={handleSearch}
					/>
					{keyWord ? (
						<View className='clearIcon' onClick={() => setKeyWord('')}>
							<Text className='clearText'>×</Text>
						</View>
					) : null}
				</View>
				<View className='searchBtn' onClick={handleSearch}>
					<Text className='searchBtnText'>搜索</Text>
				</View>
			</View>

			<ScrollView
				className='listContainer'
				scrollY
				onScrollToLower={loadMore}
			>
				{list.map((item) => (
					<WordCard
						{...item}
						key={item._id}
						type={type}
						cellType='red'
						pinyin={item.pinyin}
						text={item.word}
					/>
				))}
				{loading ? (
					<View className='loading'>
						<Text>加载中...</Text>
					</View>
				) : null}
				{!loading && list.length === 0 ? (
					<View className='empty'>
						<Text>暂无数据</Text>
					</View>
				) : null}
				{!loading && list.length >= total && list.length > 0 ? (
					<View className='noMore'>
						<Text>没有更多了</Text>
					</View>
				) : null}
			</ScrollView>
		</View>
	);
};

export default DictionaryList;
