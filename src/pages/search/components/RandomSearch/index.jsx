import React, { useState, useEffect } from 'react';
import { View, Swiper, SwiperItem, Text, Navigator } from '@tarojs/components';

import SectionCard from '../../../../components/SectionCard';
import SentenceCard from '../../../../components/SentenceCard';
import PoemSmallCard from '../../../../components/PoemSmallCard';
import PoetCard from '../../../../components/PoetCard';

import { fetchRandomSearch } from '../../service';

import './style.scss';

const RandomSearch = () => {
	const [search, updateSearch] = useState({
		poems: [],
		poets: [],
		sentences: [],
	});
	const fetchSearch = () => {
		fetchRandomSearch('GET', {}).then((res) => {
			if (res && res.statusCode === 200) {
				const { poems = [], poets = [], sentences = [] } = res.data || {};
				updateSearch({ poems, poets, sentences });
			}
		});
	};

	useEffect(() => {
		fetchSearch();
	}, []);

	return (
		<View className='randomContainer'>
			<View className='randomTitle'>
				<Text className='text'>为你推荐</Text>
				<View className='right' onClick={fetchSearch}>
					<View className='at-icon at-icon-reload'></View>
					<Text className='text'>换一批</Text>
				</View>
			</View>
			{/* 诗人 */}
			<SectionCard
				title='作者'
				extra={
					<Navigator
						className='extraNav'
						hoverClass='none'
						url='/pages/poet/index'
					>
						更多
					</Navigator>
				}
			>
				<Swiper
					className='hotPoemsSwiper poets'
					indicatorColor='#999'
					indicatorActiveColor='#333'
					vertical={false}
					interval={4000}
					circular
					indicatorDots={search.poets.length > 1}
					autoplay
					adjustHeight='highest'
				>
					{search.poets.map((poem) => (
						<SwiperItem key={poem.id}>
							<PoetCard {...poem} showCount={false} hideBorder />
						</SwiperItem>
					))}
				</Swiper>
			</SectionCard>
			{/* 名句 */}
			<SectionCard
				title='摘录'
				extra={
					<Navigator
						className='extraNav'
						hoverClass='none'
						url='/pages/sentence/index'
					>
						更多
					</Navigator>
				}
			>
				<Swiper
					className='hotPoemsSwiper sentences'
					indicatorColor='#999'
					indicatorActiveColor='#333'
					vertical={false}
					circular
					indicatorDots={search.sentences.length > 1}
					autoplay
					adjustHeight='highest'
				>
					{search.sentences.map((poem) => (
						<SwiperItem key={poem.id}>
							<SentenceCard {...poem} showCount={false} showBorder={false} />
						</SwiperItem>
					))}
				</Swiper>
			</SectionCard>
			{/* 诗词 */}
			<SectionCard
				title='作品'
				extra={
					<Navigator
						className='extraNav'
						hoverClass='none'
						url='/pages/poem/index'
					>
						更多
					</Navigator>
				}
			>
				<Swiper
					className='hotPoemsSwiper poems'
					indicatorColor='#999'
					indicatorActiveColor='#333'
					vertical={false}
					interval={6000}
					circular
					indicatorDots={search.poems.length > 1}
					autoplay
					adjustHeight='highest'
				>
					{search.poems.map((poem) => (
						<SwiperItem key={poem.id}>
							<PoemSmallCard
								{...poem}
								hideAudio
								showCount={false}
								showBorder={false}
							/>
						</SwiperItem>
					))}
				</Swiper>
			</SectionCard>
		</View>
	);
};

export default React.memo(RandomSearch);
