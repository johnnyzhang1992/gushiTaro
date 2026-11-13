import { View, Text } from '@tarojs/components';
import Taro, {
	useLoad,
	usePullDownRefresh,
	useReachBottom,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';
import { useState } from 'react';

import CdnImage from '../../components/CdnImage';
import SearchField from '../../components/SearchField';
import { fetchStoryMapPoets } from '../../services/storyMap';

import './story-map.scss';

const PAGE_SIZE = 30;

const StoryMapPage = () => {
	const [search, setSearch] = useState('');
	const [poets, setPoets] = useState(null); // null=加载中
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

	useLoad(() => {
		loadPoets();
	});

	usePullDownRefresh(() => {
		setVisibleCount(PAGE_SIZE);
		loadPoets().finally(() => Taro.stopPullDownRefresh());
	});

	useShareAppMessage(() => ({
		title: '诗人足迹 · 读万卷书行万里路',
		path: '/pages/find/story-map',
	}));

	useShareTimeline(() => ({
		title: '诗人足迹 · 读万卷书行万里路',
		path: '/pages/find/story-map',
	}));

	const loadPoets = () => {
		return fetchStoryMapPoets('GET', {})
			.then((res) => {
				if (res && res.status) setPoets(res.data?.poets || []);
				else setPoets([]);
			})
			.catch(() => setPoets([]));
	};

	const keyword = search.trim();
	const filtered = (poets || []).filter(
		(p) => !keyword || p.poetName.includes(keyword) || (p.dynasty || '').includes(keyword)
	);
	const visible = filtered.slice(0, visibleCount);

	useReachBottom(() => {
		setVisibleCount((c) => (c < filtered.length ? c + PAGE_SIZE : c));
	});

	const onSearch = (value) => {
		setSearch(value);
		setVisibleCount(PAGE_SIZE);
	};

	const openStory = (poetName) => {
		Taro.navigateTo({ url: '/pages/find/story-detail?name=' + encodeURIComponent(poetName) });
	};

	const goPoetDetail = (authorId) => {
		if (!authorId) return;
		Taro.navigateTo({ url: '/pages/poet/detail?id=' + authorId });
	};

	return (
		<View className='page storyMapPage'>
			<View className='pageIntro'>
				<Text className='introTitle'>诗人足迹地图</Text>
				<Text className='introDesc'>
					读万卷书，行万里路。沿着诗人一生的足迹，看他们在哪里出生、游历、定居、写诗。
				</Text>
			</View>
			<SearchField
				className='storyMapSearch'
				value={search}
				placeholder='搜索诗人 / 朝代'
				onInput={onSearch}
				onClear={() => onSearch('')}
			/>
			{poets === null ? (
				<View className='blockTip'>加载中...</View>
			) : filtered.length === 0 ? (
				<View className='blockTip'>{keyword ? `没有找到「${keyword}」相关诗人` : '暂无足迹数据'}</View>
			) : (
				<View className='poetList'>
					{visible.map((p) => (
						<View key={p.poetName} className='poetRow' onClick={() => openStory(p.poetName)}>
							{p.avatar ? (
								<CdnImage src={p.avatar} className='poetAvatar' mode='aspectFill' />
							) : (
								<View className='poetAvatar placeholder'>
									<Text className='poetInitial'>{p.poetName.slice(0, 1)}</Text>
								</View>
							)}
							<View className='poetMain'>
								<View className='poetNameRow'>
									<Text className='poetName'>{p.poetName}</Text>
									{p.dynasty ? <Text className='poetDynasty'>{p.dynasty}</Text> : null}
								</View>
								<Text className='poetProfile'>{p.profile || `足迹 ${p.entryCount} 站`}</Text>
							</View>
							<View className='poetRight'>
								<Text className='poetCount'>{p.entryCount} 站</Text>
								{p.authorId ? (
									<View
										className='poetHomeLink'
										onClick={(e) => {
											e.stopPropagation();
											goPoetDetail(p.authorId);
										}}
									>
										<Text className='poetHomeLinkText'>诗人主页</Text>
										<Text className='poetHomeLinkArrow'>›</Text>
									</View>
								) : null}
							</View>
							<Text className='poetArrow'>›</Text>
						</View>
					))}
				</View>
			)}
			{poets !== null && filtered.length > 0 ? (
				<View className='listFooter'>
					<Text className='listHint'>
						{visibleCount < filtered.length ? '上拉加载更多' : `共 ${filtered.length} 位诗人`}
					</Text>
				</View>
			) : null}
		</View>
	);
};

export default StoryMapPage;
