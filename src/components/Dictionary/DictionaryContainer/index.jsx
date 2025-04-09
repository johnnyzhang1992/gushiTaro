import { View, ScrollView } from '@tarojs/components';
import { useEffect, useState, useRef } from 'react';

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
		if (queryFlag.current) {
			return false;
		}
		queryFlag.current = true;
		fetchDictionarySearch('GET', query || {})
			.then((res) => {
				console.log(res, 'res');
				setSearchResult(res.data);
			})
			.finally(() => {
				queryFlag.current = false;
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
				style={{
					display: searchResult.wordList.length > 0 ? 'block' : 'none',
				}}
			>
				<ScrollView
					className='scrollContainer'
					scrollX
					scrollWithAnimation
					enableFlex
					showScrollbar={false}
				>
					{searchResult.wordList.splice(0, 10).map((item) => (
						<WordCard
							{...item}
							key={item._id}
							type='word'
							pinyin={item.pinyin}
							text={item.word}
						/>
					))}
				</ScrollView>
			</SectionCard>
			{/* 词 */}
			<SectionCard
				title='词语'
				style={{
					display: searchResult.ciList.length > 0 ? 'block' : 'none',
				}}
			>
				<ScrollView
					className='scrollContainer'
					scrollX
					scrollWithAnimation
					enableFlex
					showScrollbar={false}
				>
					{searchResult.ciList.map((item) => (
						<WordCard
							{...item}
							key={item._id}
							type='ci'
							pinyin={item.pinyin}
							text={item.ci}
						/>
					))}
				</ScrollView>
			</SectionCard>
			{/* 成语 */}
			<SectionCard
				title='成语'
				style={{
					display: searchResult.chengyuList.length > 0 ? 'block' : 'none',
				}}
			>
				<ScrollView
					className='scrollContainer'
					scrollX
					scrollWithAnimation
					enableFlex
					showScrollbar={false}
				>
					{searchResult.chengyuList.map((item) => (
						<WordCard
							{...item}
							key={item._id}
							type='chengyu'
							pinyin={item.pinyin}
							text={item.word}
						/>
					))}
				</ScrollView>
			</SectionCard>
		</View>
	);
};

export default DictionaryContainer;
