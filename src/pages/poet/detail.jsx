import { useState, useRef } from 'react';
import Taro, {
	useLoad,
	usePullDownRefresh,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';
import { useNavigationBar } from 'taro-hooks';
import {
	View,
	Image,
	OfficialAccount,
	Text,
	Swiper,
	SwiperItem,
	Navigator,
} from '@tarojs/components';

import { fetchPoetDetail } from './service';

import SectionCard from '../../components/SectionCard';
import LongTextCard from '../../components/LongTextCard';
import PoemSmallCard from '../../components/PoemSmallCard';
import LikeButton from '../../components/LikeButton';
import CollectButton from '../../components/CollectButton';

import './style.scss';

const PoetDetailPage = () => {
	const { setTitle } = useNavigationBar({ title: '古诗文小助手' });
	const [detail, setDetail] = useState({
		poet: {
			more_infos: [],
			author_name: '',
			dynasty: '',
			avatar: null,
			profile: '',
			like_count: 0,
			like_status: false,
			collect_count: 0,
			collect_status: false,
		},
		poems: {
			data: [],
		},
	});
	const cacheRef = useRef({
		poemId: 48769,
	});
	// 加载详情数据
	const fetchDetail = (id) => {
		const { poemId } = cacheRef.current;
		fetchPoetDetail('GET', {
			id: id || poemId,
		})
			.then((res) => {
				if (res && res.statusCode === 200) {
					console.log(res.data);
					// computeData(res.data);
					const { poet, poems } = res.data;
					setDetail({
						poems,
						poet: {
							...poet,
							more_infos: JSON.parse(poet.more_infos || ''),
						},
					});
					setTitle(poet.author_name);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	useLoad((options) => {
		const { id } = options;
		console.log('options', options);
		cacheRef.current.poemId = id;
		fetchDetail(id || 48769);
	});

	usePullDownRefresh(() => {
		fetchDetail();
		console.log('page-pullRefresh');
		Taro.stopPullDownRefresh();
	});

	useShareAppMessage(() => {
		const { poet } = detail;
		return {
			title: poet.title || '诗人详情',
			path: '/pages/poet/detail?id=' + poet.id,
		};
	});
	useShareTimeline(() => {
		const { poet } = detail;
		return {
			title: poet.title || '诗人详情',
			path: '/pages/poet/detail?id=' + poet.id,
		};
	});

	return (
		<View className='page poetDetail'>
			{/* 诗人图片 */}
			<View className='avatarContainer'>
				{detail.poet.avatar ? (
					<Image src={detail.poet.avatar} className='avatar' />
				) : null}
				<View className='author'>
					<View className='name'>{detail.poet.author_name}</View>
					{detail.poet.dynasty ? (
						<View className='dynasty'>
							「{detail.poet.dynasty}」
						</View>
					) : null}
				</View>
			</View>
			<View className='divide'></View>
			<OfficialAccount />
			{/* 介绍 */}
			<View className='poetProfile'>
				<Text className='text' decode userSelect>
					{detail.poet.profile}
				</Text>
			</View>
			<View className='divide'></View>
			{/* 热门诗词  */}
			<SectionCard
				title='热门诗词'
				extra={
					<Navigator
						className='navigator'
						hoverClass='none'
						url={`/pages/poem/index?from=poet&type=author&keyWord=${detail.poet.author_name}`}
					>
						查看更多
					</Navigator>
				}
			>
				<Swiper
					className='hotPoemsSwiper'
					indicatorColor='#999'
					indicatorActiveColor='#333'
					vertical={false}
					circular
					indicatorDots
					autoplay
					adjustHeight='highest'
				>
					{detail.poems.data.map((poem) => (
						<SwiperItem key={poem.id}>
							<PoemSmallCard
								{...poem}
								showCount={false}
								showBorder={false}
							/>
						</SwiperItem>
					))}
				</Swiper>
			</SectionCard>
			<View className='divide'></View>
			{/* 其他信息 */}
			{detail.poet.more_infos.map((info) => (
				<SectionCard title={info.title} key={info.title}>
					<LongTextCard
						title={info.title}
						showAll={false}
						text={info || ''}
					/>
				</SectionCard>
			))}
			{/* 底部 */}
			<View className='fixBottom'>
				<View className='buttonContainer'>
					<View className='btnItem'>
						<LikeButton
							type='author'
							id={detail.poet.id}
							count={detail.poet.like_count}
							status={detail.poet.like_status}
							showText
						/>
					</View>
					<View className='btnItem'>
						<CollectButton
							type='author'
							id={detail.poet.id}
							count={detail.poet.collect_count}
							status={detail.poet.collect_status}
							showText
						/>
					</View>
				</View>
			</View>
		</View>
	);
};

export default PoetDetailPage;
