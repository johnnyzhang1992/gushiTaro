import { View, Text } from '@tarojs/components';
import Taro, { useRouter, useLoad, usePullDownRefresh } from '@tarojs/taro';
import { useState } from 'react';

import CdnImage from '../../components/CdnImage';
import LongTextCard from '../../components/LongTextCard';
import { fetchPoetDetail } from './service';

import './detail.scss';

const AuthorDetail = () => {
	const router = useRouter();
	const id = router.params.id;

	const [author, setAuthor] = useState(null);

	useLoad(() => {
		if (!id) return;
		Taro.showLoading({ title: '加载中' });
		fetchPoetDetail('GET', { id })
			.then((res) => {
				if (res && res.status && res.data) {
					setAuthor(res.data);
					Taro.setNavigationBarTitle({ title: res.data.author_name || '诗人详情' });
				}
			})
			.finally(() => Taro.hideLoading());
	});

	usePullDownRefresh(() => {
		Taro.stopPullDownRefresh();
	});

	if (!author) return null;

	return (
		<View className='page authorDetailPage'>

			{/* 作者头部信息 */}
			<View className='authorInfo'>
				{author.avatar ? (
					<CdnImage className='avatar' src={author.avatar} mode='widthFix' lazyLoad fadeIn />
				) : null}
				<View className='info'>
					<Text className='name'>{author.author_name}</Text>
					<View className='meta'>
						{author.dynasty ? (
							<Text className='dynasty'>{author.dynasty}</Text>
						) : null}
						{author.title ? (
							<Text className='titleTag'>「{author.title}」</Text>
						) : null}
					</View>
					<View className='stats'>
						<View
							className='statItem clickable'
							onClick={() => Taro.navigateTo({ url: '/pages/poem/index?author=' + (author.author_name || '') })}
						>
							<Text className='statNum'>{author.poem_count ?? '-'}</Text>
							<Text className='statLabel'>作品</Text>
						</View>
						<View className='dividerV' />
						<View
							className='statItem clickable'
							onClick={() => Taro.navigateTo({ url: '/pages/sentence/index?author_source_id=' + (author.source_id || '') })}
						>
							<Text className='statNum'>{author.sentence_count ?? '-'}</Text>
							<Text className='statLabel'>摘录</Text>
						</View>
					</View>
				</View>
			</View>

			{/* 生平简介 */}
			{author.profile ? (
				<View className='section'>
					<Text className='sectionTitle'>生平简介</Text>
					<LongTextCard text={author.profile} title='生平简介' showAll={false} />
				</View>
			) : null}

			{/* 基本信息 */}
			{(author.styled || author.hao || author.birthplace || author.era) ? (
				<View className='section'>
					<Text className='sectionTitle'>基本信息</Text>
					<View className='infoGrid'>
						{author.styled ? (
							<View className='infoRow'>
								<Text className='infoLabel'>字</Text>
								<Text className='infoValue' selectable>{author.styled}</Text>
							</View>
						) : null}
						{author.hao ? (
							<View className='infoRow'>
								<Text className='infoLabel'>号</Text>
								<Text className='infoValue' selectable>{author.hao}</Text>
							</View>
						) : null}
						{author.era ? (
							<View className='infoRow'>
								<Text className='infoLabel'>时代</Text>
								<Text className='infoValue' selectable>{author.era}</Text>
							</View>
						) : null}
						{author.birthplace ? (
							<View className='infoRow'>
								<Text className='infoLabel'>故里</Text>
								<Text className='infoValue' selectable>{author.birthplace}</Text>
							</View>
						) : null}
					</View>
				</View>
			) : null}

			{/* 后人评价 */}
			{author.laterEvaluation ? (
				<View className='section'>
					<Text className='sectionTitle'>后人评价</Text>
					<LongTextCard text={author.laterEvaluation} title='后人评价' showAll={false} />
				</View>
			) : null}

						{/* 更多信息 more_infos */}
			{author.more_infos && author.more_infos.length > 0 ? (
				author.more_infos.map((item, idx) => {
					if (!item.title || !item.content) return null;
					// 清理 HTML 标签
					const cleanedContent = (Array.isArray(item.content) ? item.content : [item.content])
						.map((c) => c.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim())
						.filter(Boolean);
					if (cleanedContent.length === 0) return null;
					const fullText = cleanedContent.join('\n');
					return (
						<View key={`${item.title}_${idx}`} className='section'>
							<Text className='sectionTitle'>{item.title}</Text>
							<LongTextCard text={fullText} title={item.title} showAll={false} />
						</View>
					);
				})
			) : null}
		</View>
	);
};

export default AuthorDetail;