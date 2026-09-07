import { View, Text } from '@tarojs/components';
import { useEffect, useState, useRef } from 'react';
import Taro from '@tarojs/taro';

import SectionCard from '../../SectionCard';
import WordCard from '../WordCard';

import { fetchDictionarySearch, fetchDictionaryRandom } from '../../../pages/dictionary/service';

import './style.scss';

// 提取释义文本：词语 definitions 数组 / 成语 explanation 字符串
const getExplain = (item) => {
	if (item._type === 'ci') {
		const d = (item.definitions || [])[0];
		return (d && d.meaning) || '';
	}
	return item.explanation || '';
};

const DictionaryContainer = (props) => {
	const { params = {} } = props;
	const [searchResult, setSearchResult] = useState({
		ciList: [],
		wordList: [],
		chengyuList: [],
	});
	const queryFlag = useRef(false);

	const fetchSearch = (query) => {
		// 检查 keyWord 是否为空：无关键字时展示一批随机字/词/成语，避免空屏
		if (!query || !query.keyWord) {
			queryFlag.current = true;
			fetchDictionaryRandom('GET', 8)
				.then((res) => {
					const list = res?.data?.list || [];
					setSearchResult({
						ciList: list.filter((item) => item._type === 'ci'),
						wordList: list.filter((item) => item._type === 'word'),
						chengyuList: list.filter((item) => item._type === 'chengyu'),
					});
				})
				.finally(() => {
					queryFlag.current = false;
				});
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
				const list = data.list || [];
				// 根据 _type 字段分类数据
				// 后端返回: chengyu=成语, ci=词语, word=字
				const chengyuList = list.filter(item => item._type === 'chengyu'); // 成语
				const ciList = list.filter(item => item._type === 'ci');          // 词语
				const wordList = list.filter(item => item._type === 'word');       // 字
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
	}, [params]);

	// 跳转详情
	const goDetail = (item) => {
		Taro.navigateTo({
			url: `/pages/dictionary/detail?type=${item._type}&id=${item._id}`,
		});
	};

	// 紧凑词条行：词 + 拼音 + 释义（词语/成语共用）
	const renderEntryRow = (item) => (
		<View className='entryRow' key={item._id} onClick={() => goDetail(item)}>
			<View className='entryLeft'>
				<Text className='entryWord'>{item.word}</Text>
				{item.pinyin ? <Text className='entryPinyin'>{item.pinyin}</Text> : null}
			</View>
			<Text className='entryExplain'>{getExplain(item)}</Text>
		</View>
	);

	return (
		<View className='dictionaryContainer'>
			{/* 字：米字格网格 */}
			<SectionCard
				title='字'
				extra={searchResult.wordList.length > 0 ? <Text className='more' onClick={() => Taro.navigateTo({ url: '/pages/dictionary/list?type=word&keyWord=' + (params.keyWord || '') })}>更多</Text> : null}
				style={{
					display: searchResult.wordList.length > 0 ? 'block' : 'none',
				}}
			>
				<View className='charGrid'>
					{searchResult.wordList.map((item) => (
						<View className='charCell' key={item._id} onClick={() => goDetail(item)}>
							<WordCard
								{...item}
								type='word'
								cellType='red'
								pinyin={item.pinyin}
								text={item.word}
								hideCard
							/>
						</View>
					))}
				</View>
			</SectionCard>
			{/* 词语：紧凑列表 */}
			<SectionCard
				title='词语'
				extra={searchResult.ciList.length > 0 ? <Text className='more' onClick={() => Taro.navigateTo({ url: '/pages/dictionary/list?type=ci&keyWord=' + (params.keyWord || '') })}>更多</Text> : null}
				style={{
					display: searchResult.ciList.length > 0 ? 'block' : 'none',
				}}
			>
				{searchResult.ciList.map(renderEntryRow)}
			</SectionCard>
			{/* 成语：紧凑列表 */}
			<SectionCard
				title='成语'
				extra={searchResult.chengyuList.length > 0 ? <Text className='more' onClick={() => Taro.navigateTo({ url: '/pages/dictionary/list?type=chengyu&keyWord=' + (params.keyWord || '') })}>更多</Text> : null}
				style={{
					display: searchResult.chengyuList.length > 0 ? 'block' : 'none',
				}}
			>
				{searchResult.chengyuList.map(renderEntryRow)}
			</SectionCard>
		</View>
	);
};

export default DictionaryContainer;
