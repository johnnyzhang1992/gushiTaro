import { useState, useRef } from 'react';
import Taro, {
	useLoad,
	useUnload,
	usePullDownRefresh,
	useReachBottom,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';
import { useNavigationBar } from 'taro-hooks';
import { View, Image, OfficialAccount, Text } from '@tarojs/components';

import { fetchPoetDetail } from './service';

import PoemSection from '../poem/components/PoemSection';
import LongTextCard from '../../components/LongTextCard';
import LikeButton from '../../components/LikeButton';
import CollectButton from '../../components/CollectButton';

import './style.scss';

const Page = () => {
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
		poems: {},
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
	useReachBottom(() => {
		console.log('--rearchBottom');
	});
	useUnload(() => {
		console.log('page-unload');
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
			<View className='avatarContainer'>
				<Image src={detail.poet.avatar} className='avatar' />
				<View className='author'>
					<View className='name'>{detail.poet.author_name}</View>
					<View className='dynasty'>「{detail.poet.dynasty}」</View>
				</View>
			</View>
			<View className='divide'></View>
			<OfficialAccount />
			<View className='poetProfile'>
				<Text className='text' decode userSelect>
					{detail.poet.profile}
				</Text>
			</View>
			<View className='divide'></View>
			{detail.poet.more_infos.map((info) => (
				<PoemSection title={info.title} key={info.title}>
					<LongTextCard
						title={info.title}
						showAll={false}
						text={info || ''}
					/>
				</PoemSection>
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

export default Page;
