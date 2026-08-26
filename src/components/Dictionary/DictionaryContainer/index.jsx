import { View, Text } from '@tarojs/components';
import { useEffect, useState, useRef } from 'react';
import Taro from '@tarojs/taro';

import SectionCard from '../../SectionCard';
import WordCard from '../WordCard';

import { fetchDictionarySearch } from '../../../pages/dictionary/service';

import './style.scss';

const DictionaryContainer = (props) => {
	const { params = {} } = props;
	const [searchResult, setSearchResult] = useState({
		ciList: [],
		wordList: [],
		chengyuList: [],
	});
	const queryFlag = useRef(false);

	const fetchSearch = (query) => {
		// 检查 keyWord 是否为空
		if (!query || !query.keyWord) {
			setSearchResult({ ciList: [], wordList: [], chengyuList: [] });
			return;
		}
		if (queryFlag.current) {
			return false;
		}
		queryFlag.current = true;
		Taro.showLoading({
			title: '加载中',
		});
		fetchDictionarySearch('GET', query)
			.then((res) => {
				console.log('Dictionary search result:', res);
				const data = res.data || {};
				console.log('data:', data);
				const list = data.list || [];
				console.log('list length:', list.length);
				// 根据 _type 字段分类数据
				// 后端返回: chengyu=成语, ci=词语, word=字
				const chengyuList = list.filter(item => item._type === 'chengyu'); // 成语
				const ciList = list.filter(item => item._type === 'ci');          // 词语
				const wordList = list.filter(item => item._type === 'word');       // 字
				console.log('chengyuList:', chengyuList.length, 'ciList:', ciList.length, 'wordList:', wordList.length);
				setSearchResult({
					ciList,
					wordList,
					chengyuList,
				});
			})
			.finally(() => {
				queryFlag.current = false;
				Taro.hideLoading();
			});
	};
	useEffect(() => {
		fetchSearch(params);
		console.log('params--change', params);
	}, [params]);
	return (
		<View className='dictionaryContainer'>
			{/* 字 */}
			<SectionCard
				title='字'
				extra={searchResult.wordList.length > 0 ? <Text className='more' onClick={() => Taro.navigateTo({ url: '/pages/dictionary/list?type=word&keyWord=' + params.keyWord })}>更多</Text> : null}
				style={{
					display: searchResult.wordList.length > 0 ? 'block' : 'none',
				}}
			>
				{searchResult.wordList.map((item) => (
					<WordCard
						{...item}
						key={item._id}
						type='word'
						cellType='red'
						pinyin={item.pinyin}
						text={item.word}
					/>
				))}
			</SectionCard>
			{/* 词 */}
			<SectionCard
				title='词语'
				extra={searchResult.ciList.length > 0 ? <Text className='more' onClick={() => Taro.navigateTo({ url: '/pages/dictionary/list?type=ci&keyWord=' + params.keyWord })}>更多</Text> : null}
				style={{
					display: searchResult.ciList.length > 0 ? 'block' : 'none',
				}}
			>
				{searchResult.ciList.slice(0, 6).map((item) => (
					<WordCard
						{...item}
						key={item._id}
						type='ci'
						cellType='red'
						pinyin={item.pinyin}
						text={item.word}
					/>
				))}
			</SectionCard>
			{/* 成语 */}
			<SectionCard
				title='成语'
				extra={searchResult.chengyuList.length > 0 ? <Text className='more' onClick={() => Taro.navigateTo({ url: '/pages/dictionary/list?type=chengyu&keyWord=' + params.keyWord })}>更多</Text> : null}
				style={{
					display: searchResult.chengyuList.length > 0 ? 'block' : 'none',
				}}
			>
				{searchResult.chengyuList.slice(0, 6).map((item) => (
					<WordCard
						{...item}
						key={item._id}
						type='chengyu'
						cellType='red'
						pinyin={item.pinyin}
						text={item.word}
					/>
				))}
			</SectionCard>
		</View>
	);
};

export default DictionaryContainer;
