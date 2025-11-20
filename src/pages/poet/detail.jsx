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
	Navigator,
} from '@tarojs/components';

import { fetchPoetDetail } from './service';
import { getAuthkey } from '../../utils/alioss';


import SectionCard from '../../components/SectionCard';
import LongTextCard from '../../components/LongTextCard';
import LikeButton from '../../components/LikeButton';
import CollectButton from '../../components/CollectButton';
import FabButton from '../../components/FabButton';

import './style.scss';

const PoetDetailPage = () => {
	const { setTitle } = useNavigationBar({ title: '古诗文小助手' });
	const [avatar, setAvatar] = useState('');
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
			poems_count: 0,
			sentences_count: 0,
		},
		poems: [],
	});
	const cacheRef = useRef({
		poemId: 48769,
	});

	const getCdnAvatar = async (_avatar) => {
		if (_avatar) {
			const authkey = await getAuthkey(_avatar);
			setAvatar(_avatar + '?auth_key=' + authkey);
		}
	};

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
							more_infos: poet.more_infos || [],
						},
					});
					if (poet.avatar) {
						getCdnAvatar(poet.avatar);
					}
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
			title: poet.author_name || '诗人详情',
			path: '/pages/poet/detail?id=' + poet.id,
		};
	});
	useShareTimeline(() => {
		const { poet } = detail;
		return {
			title: poet.author_name || '诗人详情',
			path: '/pages/poet/detail?id=' + poet.id,
		};
	});

	return (
		<View
			className='page poetDetail'
			style={{
				display: detail.poet.id ? 'block' : 'none',
			}}
		>
			{/* 诗人图片 */}
			<View className='avatarContainer'>
				{avatar ? (
					<Image src={avatar} className='avatar' mode='widthFix' />
				) : null}
				<View className='author'>
					<View className='name'>{detail.poet.author_name}</View>
					{detail.poet.dynasty ? (
						<View className='dynasty'>{detail.poet.dynasty}</View>
					) : null}
				</View>
				<View className='data'>
					<Navigator
						className='navigator'
						hoverClass='none'
						url={`/pages/poem/index?from=poet&type=author&keyWord=${detail.poet.author_name}`}
					>
						<Text>作品：{detail.poet.poems_count}</Text>
					</Navigator>
					<Navigator
						className='navigator'
						hoverClass='none'
						url={`/pages/sentence/index?from=poet&author=${detail.poet.author_name}&author_source_id=${detail.poet.source_id}`}
					>
						<Text>摘录：{detail.poet.sentences_count}</Text>
					</Navigator>
				</View>
			</View>
			<OfficialAccount />
			{/* 介绍 */}
			<SectionCard title='简介'>
				<View className='poetProfile'>
					<Text className='text' decode userSelect>
						{detail.poet.profile}
					</Text>
				</View>
			</SectionCard>
			{/* 其他信息 */}
			{detail.poet.more_infos.map((info) => (
				<SectionCard title={info.title} key={info.title}>
					<LongTextCard title={info.title} showAll={false} text={info || ''} />
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
			{/* 悬浮按钮 */}
			<FabButton
				style={{
					bottom: '240rpx',
				}}
			/>
		</View>
	);
};

export default PoetDetailPage;
