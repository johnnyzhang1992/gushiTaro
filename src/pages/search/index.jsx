import { View, Text, Navigator, ScrollView } from '@tarojs/components';
import { AtSearchBar } from 'taro-ui';
import { useState, useRef } from 'react';
import Taro, {
	useLoad,
	useDidShow,
	usePullDownRefresh,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';

import PageHeader from '../../components/PageHeader';
import DictionaryContainer from '../../components/Dictionary/DictionaryContainer';
import SectionCard from '../../components/SectionCard';
import SentenceCard from '../../components/SentenceCard';
import PoemSmallCard from '../../components/PoemSmallCard';
import TagsCard from '../../components/TagsCard';
import PoetCard from '../../components/PoetCard';

import SearchRecord from './components/SearchRecord';
import RandomSearch from './components/RandomSearch';

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
	// const [scrollHeight, updateHeight] = useState('auto');
	const [type, setType] = useState('诗词');
	const [keyword, setKeyword] = useState('');
	const [dictParams, setDictParams] = useState({
		keyWord: '',
		type: '',
	});
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

	const handleSearch = (key) => {
		console.log('搜索词：', keyword, key);
		if (key && typeof key === 'string') {
			setKeyword(key);
		}
		const searchKey = typeof key === 'string' ? key : keyword;
		if (!searchKey.trim()) {
			Taro.showToast({
				title: '搜点啥呢ლ(′◉❥◉｀ლ)',
				icon: 'none',
				duration: 2000,
			});
			return false;
		}
		if (searchKey.trim().length > 9) {
			Taro.showToast({
				title: '搜索词并不是越长越好哦！',
				icon: 'none',
				duration: 2000,
			});
		}
		// 处理过的搜索词
		const KeyWord = searchKey.trim().substring(0, 9);
		if (type === '字典') {
			setDictParams({
				keyWord: KeyWord,
				type: '',
			});
			return false;
		}
		updateStatus(true);
		if (cacheRef.current[KeyWord]) {
			updateResult(cacheRef.current[KeyWord]);
			return false;
		}
		Taro.showLoading();
		fetchSearch('GET', {
			key: KeyWord,
		})
			.then((res) => {
				if (res && res.statusCode === 200) {
					addKey(KeyWord);
					const {
						poems,
						poems_count,
						poets,
						poets_count,
						sentences,
						sentences_count,
						tags,
					} = res.data;
					updateResult({
						poems: poems || [],
						poems_count: poems_count,
						poets: poets || [],
						poets_count: poets_count,
						sentences: sentences || [],
						sentences_count: sentences_count,
						tags,
					});
					cacheRef.current[KeyWord] = {
						poems: poems || [],
						poems_count: poems_count,
						poets: poets || [],
						poets_count: poets_count,
						sentences: sentences || [],
						sentences_count: sentences_count,
						tags,
					};
				}
			})
			.finally(() => {
				Taro.hideLoading();
			});
	};

	const fetchHotKeys = () => {
		fetchHotSearch('GET', {}).then((res) => {
			if (res && res.statusCode === 200) {
				// 去重
				updateHot([...new Set(res.data || [])]);
			}
		});
	};

	const sectionCardStyle = {
		backgroundColor: '#fff',
		margin: '0 20rpx 30rpx 20rpx',
		borderRadius: '12rpx',
	};

	useLoad((options) => {
		console.log('---page--load', options);
		const { key = '' } = options;
		if (key) {
			setKeyword(key);
			handleSearch(key);
		}
		Taro.setNavigationBarTitle({
			title: '搜索',
		});
		const tipStatus = Taro.getStorageSync('showSearchTips');
		if (!tipStatus) {
			Taro.setStorageSync('showSearchTips', 'show');
		} else {
			tipsVisible(tipStatus !== 'close');
		}
		fetchHotKeys();
	});

	useDidShow(() => {
		console.log('---page--show');
	});

	usePullDownRefresh(() => {
		console.log('---下拉刷新');
		fetchHotKeys();
		Taro.stopPullDownRefresh();
	});

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
			handleSearch(word);
		};
		return (
			<View className='hotKeys' onClick={handleClick}>
				<Text className='keyText' userSelect>
					{word}
				</Text>
			</View>
		);
	};

	const noSearchResult =
		searchResult.tags.length < 1 &&
		searchResult.poets.length < 1 &&
		searchResult.sentences.length < 1 &&
		searchResult.poems.length < 1;

	const placeholder =
		type === '字典' ? '输入汉字、拼音等查询' : '输入关键字查询';
	return (
		<View className='page searchPage'>
			{/* 顶部header */}
			<PageHeader showSearch={false} showBack>
				<View className='header'>
					<View className='typeContainer'>
						<View
							className={['typeItem', type == '诗词' ? 'active' : '']}
							onClick={() => {
								setType('诗词');
							}}
						>
							诗词
						</View>
						<View
							className={['typeItem', type == '字典' ? 'active' : '']}
							onClick={() => {
								setType('字典');
								setDictParams({
									...dictParams,
									keyWord: keyword,
								});
							}}
						>
							字典
						</View>
					</View>
				</View>
			</PageHeader>
			{/* 搜索框 */}
			<View className='searchTop'>
				<AtSearchBar
					showActionButton
					placeholder={placeholder}
					value={keyword}
					onClear={handleClear}
					onChange={handleChange}
					onConfirm={handleSearch}
					onActionClick={handleSearch}
				/>
			</View>
			{/* 滚动内容区域 */}
			<ScrollView
				className='scrollContainer'
				id='ScrollContainer'
				scrollY
				enableFlex
				enhanced
				showScrollbar={false}
				enableBackToTop
				refresherEnabled={false}
			>
				{type === '字典' ? (
					<DictionaryContainer params={dictParams} />
				) : (
					<>
						{/* 搜索记录 */}
						{!isSearch ? <SearchRecord handleSearch={handleSearch} /> : null}
						{/* 搜索热词 -大家都在搜 */}
						{!isSearch ? (
							<SectionCard
								title='搜索热词'
								className='hotKeysSection'
								style={{
									...sectionCardStyle,
									backgroundColor: 'unset',
									marginBottom: 6,
								}}
							>
								{hotKeywords.map((word, index) => (
									<HotKeyItem key={index} word={word} index={index + 1} />
								))}
							</SectionCard>
						) : null}
						{/* 搜索提示 */}
						{!isSearch && showTips ? (
							<SectionCard
								title='搜索小技巧'
								className='seachTipSection'
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
						{/* 诗词随机推荐 */}
						{!isSearch && noSearchResult ? <RandomSearch /> : null}
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
											查看更多 ({searchResult.poets_count})
										</Navigator>
									) : null
								}
							>
								<View className='poetList'>
									{searchResult.poets.map((poet) => (
										<PoetCard {...poet} key={poet.id} lightWord={keyword} />
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
											查看更多 ({searchResult.sentences_count})
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
											查看更多 ({searchResult.poems_count})
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
											hideAudio
										/>
									))}
								</View>
							</SectionCard>
						) : null}
						{/* 无搜索结果 */}
						{isSearch && noSearchResult ? (
							<View className='loading noResult'>
								<View className='tip'>
									<Text className='text'>(ｷ｀ﾟДﾟ´)!!</Text>
								</View>
								<View className='tip'>
									<Text className='text'>
										哎呀，没有搜索到内容，要不换个关键字试试?(*╹▽╹*)
									</Text>
								</View>
							</View>
						) : null}
					</>
				)}
			</ScrollView>
		</View>
	);
};

export default SearchPage;
