import React, { useState, useEffect } from 'react';
import { View, Text, Navigator } from '@tarojs/components';

import SentenceCard from '../../../../components/SentenceCard';
import PoemSmallCard from '../../../../components/PoemSmallCard';
import PoetCard from '../../../../components/PoetCard';

import { fetchRandomSearch } from '../../service';

import './style.scss';

// 每组展示条数
const PER_SECTION = 3;

// 洗牌抽样：接口返回头部是固定热度条目，随机抽取避免每组永远显示同样内容
const shuffle = (arr) => {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
};

const RandomSearch = () => {
	const [search, updateSearch] = useState({
		poems: [],
		poets: [],
		sentences: [],
	});
	const fetchSearch = () => {
		fetchRandomSearch('GET', {}).then((res) => {
			console.log('随机推荐响应:', res);
			// API 返回格式: { status: true, data: { poems, poets, sentences } }
			if (res && res.status && res.data) {
				const { poems = [], poets = [], sentences = [] } = res.data;
				// 每类随机抽 3 条（在数据更新时抽样，渲染期不再变化）
				updateSearch({
					poems: shuffle(poems).slice(0, PER_SECTION),
					poets: shuffle(poets).slice(0, PER_SECTION),
					sentences: shuffle(sentences).slice(0, PER_SECTION),
				});
			}
		});
	};

	useEffect(() => {
		fetchSearch();
	}, []);

	// 分组配置：小标题 + 更多入口 + 渲染卡片
	const sections = [
		{
			key: 'poets',
			title: '作者',
			moreUrl: '/pages/poet/index',
			list: search.poets,
			renderItem: (item) => (
				<PoetCard {...item} key={item.id} showCount={false} hideBorder />
			),
		},
		{
			key: 'sentences',
			title: '摘录',
			moreUrl: '/pages/sentence/index',
			list: search.sentences,
			renderItem: (item) => (
				<SentenceCard
					{...item}
					key={item.id}
					showCount={false}
					showBorder={false}
				/>
			),
		},
		{
			key: 'poems',
			title: '作品',
			moreUrl: '/pages/poem/index',
			list: search.poems,
			renderItem: (item) => (
				<PoemSmallCard
					{...item}
					key={item.id}
					hideAudio
					showCount={false}
					showBorder={false}
				/>
			),
		},
	].filter((s) => s.list.length > 0);

	return (
		<View className='randomContainer'>
			<View className='randomTitle'>
				<Text className='text'>为你推荐</Text>
				<View className='right' onClick={fetchSearch}>
					<View className='reload-icon'></View>
					<Text className='text'>换一批</Text>
				</View>
			</View>
			{/* 单卡片三分区：每组小标题 + 2 条内容，替代原先每屏一条的三段轮播 */}
			<View className='randomCard'>
				{sections.map((section) => (
					<View className='randomSection' key={section.key}>
						<View className='sectionHeader'>
							<Text className='sectionTitle'>{section.title}</Text>
							<Navigator
								className='sectionMore'
								hoverClass='none'
								url={section.moreUrl}
							>
								更多 ›
							</Navigator>
						</View>
						<View className='sectionBody'>
							{section.list.map(section.renderItem)}
						</View>
					</View>
				))}
				{sections.length === 0 ? (
					<View className='randomEmpty'>
						<Text>推荐加载中...</Text>
					</View>
				) : null}
			</View>
		</View>
	);
};

export default React.memo(RandomSearch);
