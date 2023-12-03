import { View, Text, Navigator } from '@tarojs/components';
import { AtSearchBar } from 'taro-ui';
import { useState, useRef } from 'react';
import Taro, {
	useLoad,
	useDidShow,
	usePullDownRefresh,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';

import SectionCard from '../../components/SectionCard';
import PoemSmallCard from '../../components/PoemSmallCard';
import SentenceCard from '../../components/SentenceCard';
import TagsCard from '../../components/TagsCard';
import PoetCard from '../../components/PoetCard';

import SearchRecord from './SearchRecord';

import { fetchSearch, fetchHotSearch } from './service';
import { addKey } from './historyUtil';

import './style.scss';

const initResult = {
	poems: [],
	poems_count: 0,
	poets: [],
	poets_count: 0,
	sentences: [],
	sentences_count: 0,
	tags: [],
};

const limitMax = 5;
const SearchPage = () => {
	const [keyword, setKeyword] = useState('');
	const [hotKeywords, updateHot] = useState([]);
	const [searchResult, updateResult] = useState({
		...initResult,
	});
	const [isSearch, updateStatus] = useState(false);
	const cacheRef = useRef({});
	const [showTips, tipsVisible] = useState(false);
	const handleChange = (val) => {
		console.log('搜索词变化：', val);
		if (keyword === val.trim()) {
			return false;
		}
		setKeyword(val.trim());
		if (!val.trim()) {
			updateStatus(false);
			updateResult({
				...initResult,
			});
		}
	};

	const handleClear = () => {
		setKeyword('');
		updateResult({
			...initResult,
		});
		updateStatus(false);
	};

	const handleTipsClose = () => {
		tipsVisible(false);
		Taro.setStorageSync('showSearchTips', 'close');
	};

	const handleSearch = () => {
		console.log('搜索词：', keyword);
		if (!keyword.trim()) {
			Taro.showToast({
				title: '搜点啥呢ლ(′◉❥◉｀ლ)',
				icon: 'none',
				duration: 2000,
			});
			return false;
		}
		updateStatus(true);
		if (cacheRef.current[keyword]) {
			updateResult(cacheRef.current[keyword]);
			return false;
		}
		fetchSearch('GET', {
			key: keyword,
		}).then((res) => {
			if (res && res.statusCode === 200) {
				addKey(keyword);
				console.log(res.data);
				const { poems, poets, sentences, tags } = res.data;
				updateResult({
					poems: poems.data || [],
					poems_count: poems.total || 0,
					poets: poets.data || [],
					poets_count: poets.total || 0,
					sentences: sentences.data || [],
					sentences_count: sentences.total || 0,
					tags,
				});
				cacheRef.current[keyword] = {
					poems: poems.data || [],
					poems_count: poems.total || 0,
					poets: poets.data || [],
					poets_count: poets.total || 0,
					sentences: sentences.data || [],
					sentences_count: sentences.total || 0,
					tags,
				};
			}
		});
	};

	const fetchHotKeys = () => {
		fetchHotSearch('GET', {}).then((res) => {
			if (res && res.statusCode === 200) {
				console.log(res.data);
				// 去重
				updateHot([...new Set(res.data || [])]);
			}
		});
	};

	useLoad((options) => {
		console.log('---page--load', options);
		Taro.setNavigationBarTitle({
			title: '搜索 | 古诗文小助手',
		});
		const tipStatus = Taro.getStorageSync('showSearchTips');
		if (!tipStatus) {
			Taro.setStorageSync('showSearchTips', 'show');
		} else {
			tipsVisible(tipStatus !== 'close');
		}
	});

	useDidShow(() => {
		console.log('---page--show');
		fetchHotKeys();
	});

	usePullDownRefresh(() => {
		console.log('---下拉刷新');
		fetchHotKeys();
		Taro.stopPullDownRefresh();
	});

	const sectionCardStyle = {
		backgroundColor: '#fff',
		margin: '0 20rpx 30rpx 20rpx',
		borderRadius: '12rpx',
	};

	useShareAppMessage(() => {
		return {
			title: '搜索 | 古诗文小助手',
			path: '/pages/search/index',
		};
	});

	useShareTimeline(() => {
		return {
			title: '搜索 | 古诗文小助手',
			path: '/pages/search/index',
		};
	});

	const HotKeyItem = ({ word }) => {
		const handleClick = () => {
			setKeyword(word);
		};
		return (
			<View className='hotKeys' onClick={handleClick}>
				{/* <Text className='index'>{index}</Text> */}
				<Text className='keyText' userSelect>
					{word}
				</Text>
				<View className='icon at-icon at-icon-streaming'></View>
			</View>
		);
	};

	return (
		<View className='page searchPage'>
			{/* 搜索框 */}
			<View className='searchTop'>
				<AtSearchBar
					showActionButton
					placeholder='诗词/名句/诗人，关键字查询'
					value={keyword}
					onClear={handleClear}
					onChange={handleChange}
					onConfirm={handleSearch}
					onActionClick={handleSearch}
				/>
			</View>
			{/* 搜索记录 */}
			{!isSearch ? <SearchRecord handleSearch={handleChange} /> : null}
			{/* 搜索热词 -大家都在搜 */}
			{!isSearch ? (
				<SectionCard title='搜素热词' style={sectionCardStyle}>
					{hotKeywords.map((word, index) => (
						<HotKeyItem key={index} word={word} index={index + 1} />
					))}
				</SectionCard>
			) : null}
			{/* 搜索提示 */}
			{!isSearch && showTips ? (
				<SectionCard
					title='搜索小技巧'
					style={sectionCardStyle}
					extra={
						<Text className='closeText' onClick={handleTipsClose}>
							关闭
						</Text>
					}
				>
					<View class='searchKeyList'>
						<View class='item'>
							<Text userSelect decode>
								1.关键词尽量简洁，不要整句搜索，也不要包含特殊字符（例如：，。《》以及空格等）
							</Text>
						</View>
						<view class='item'>
							<Text userSelect decode>
								2.如果长的搜索词查询不到结果，可以尝试缩短搜索词，再次尝试。
							</Text>
						</view>
						<view class='item'>
							<Text userSelect decode>
								3.搜索热词，指的是7日内，搜索量最多的词语
							</Text>
						</view>
						<view class='item'>
							<Text userSelect decode>
								4.搜索记录，数据保存在用户本地
							</Text>
						</view>
					</View>
				</SectionCard>
			) : null}
			{/* 搜索结果 */}
			{/* 标签 */}
			{searchResult.tags.length > 0 ? (
				<SectionCard title='分类' style={sectionCardStyle}>
					<TagsCard tags={searchResult.tags} />
				</SectionCard>
			) : null}
			{/* 诗人 */}
			{searchResult.poets.length > 0 ? (
				<SectionCard
					title='诗人'
					style={sectionCardStyle}
					extra={
						searchResult.poets_count > limitMax ? (
							<Navigator
								className='extraNav'
								hoverClass='none'
								url={`/pages/poet/index?from=search&keyWord=${keyword}`}
							>
								查看更多({searchResult.poets_count})
							</Navigator>
						) : null
					}
				>
					<View className='poetList'>
						{searchResult.poets.map((poet) => (
							<PoetCard
								{...poet}
								key={poet.id}
								lightWord={keyword}
							/>
						))}
					</View>
				</SectionCard>
			) : null}
			{/* 匹配名句 */}
			{searchResult.sentences.length > 0 ? (
				<SectionCard
					title='名句'
					style={sectionCardStyle}
					extra={
						searchResult.sentences_count > limitMax ? (
							<Navigator
								className='extraNav'
								hoverClass='none'
								url={`/pages/sentence/index?from=search&keyWord=${keyword}`}
							>
								查看更多({searchResult.sentences_count})
							</Navigator>
						) : null
					}
				>
					<View className='poemList'>
						{searchResult.sentences.map((sentence) => (
							<SentenceCard
								{...sentence}
								key={sentence.id}
								lightWord={keyword}
							/>
						))}
					</View>
				</SectionCard>
			) : null}
			{/* 匹配诗词 */}
			{searchResult.poems.length > 0 ? (
				<SectionCard
					title='诗词'
					style={sectionCardStyle}
					extra={
						searchResult.poems_count > limitMax ? (
							<Navigator
								className='extraNav'
								hoverClass='none'
								url={`/pages/poem/index?from=search&type=poem&keyWord=${keyword}`}
							>
								查看更多({searchResult.poems_count})
							</Navigator>
						) : null
					}
				>
					<View className='poemList'>
						{searchResult.poems.map((poem) => (
							<PoemSmallCard
								{...poem}
								key={poem.id}
								lightWord={keyword}
							/>
						))}
					</View>
				</SectionCard>
			) : null}
		</View>
	);
};

export default SearchPage;
