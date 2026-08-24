import { View, Text } from '@tarojs/components';
import Taro, { useRouter, useLoad } from '@tarojs/taro';
import { useState } from 'react';

import PageHeader from '../../components/PageHeader';
import CdnImage from '../../components/CdnImage';
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

	if (!author) return null;

	return (
		<View className='page authorDetailPage'>
			<PageHeader showSearch={false} showBack title={author.author_name || '诗人详情'} />

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
						<View className='statItem'>
							<Text className='statNum'>{author.poem_count ?? '-'}</Text>
							<Text className='statLabel'>作品</Text>
						</View>
						<View className='statItem'>
							<Text className='statNum'>{author.sentence_count ?? '-'}</Text>
							<Text className='statLabel'>摘录</Text>
						</View>
						<View className='statItem'>
							<Text className='statNum'>{author.pv_count ?? 0}</Text>
							<Text className='statLabel'>浏览</Text>
						</View>
					</View>
				</View>
			</View>

			{/* 生平简介 */}
			{author.profile ? (
				<View className='section'>
					<Text className='sectionTitle'>生平简介</Text>
					<Text className='sectionText'>{author.profile}</Text>
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
								<Text className='infoValue'>{author.styled}</Text>
							</View>
						) : null}
						{author.hao ? (
							<View className='infoRow'>
								<Text className='infoLabel'>号</Text>
								<Text className='infoValue'>{author.hao}</Text>
							</View>
						) : null}
						{author.era ? (
							<View className='infoRow'>
								<Text className='infoLabel'>时代</Text>
								<Text className='infoValue'>{author.era}</Text>
							</View>
						) : null}
						{author.birthplace ? (
							<View className='infoRow'>
								<Text className='infoLabel'>故里</Text>
								<Text className='infoValue'>{author.birthplace}</Text>
							</View>
						) : null}
					</View>
				</View>
			) : null}

			{/* 后人评价 */}
			{author.laterEvaluation ? (
				<View className='section'>
					<Text className='sectionTitle'>后人评价</Text>
					<Text className='sectionText'>{author.laterEvaluation}</Text>
				</View>
			) : null}

			{/* 更多信息 more_infos */}
			{author.more_infos && author.more_infos.length > 0 ? (
				author.more_infos.map((item, idx) => {
					if (!item.title || !item.content) return null;
					// content 是数组，取前 5 段，清理 HTML 标签和特殊字符
					const lines = (Array.isArray(item.content) ? item.content : [item.content])
						.slice(0, 5)
						.map((c) => c
							.replace(/<[^>]+>/g, '')        // 去 HTML 标签
							.replace(/&quot;/g, '"')        // "
							.replace(/&apos;/g, "'")        // '
							.replace(/&lt;/g, '<')          // <
							.replace(/&gt;/g, '>')          // >
							.replace(/&amp;/g, '&')         // &
							.replace(/&nbsp;/g, ' ')        // 空格
							.replace(/\u3000/g, '')        // 全角空格
							.trim()
						)
						.filter(Boolean);
					if (lines.length === 0) return null;
					return (
						<View key={`${item.title}_${idx}`} className='section'>
							<Text className='sectionTitle'>{item.title}</Text>
							{lines.map((line, i) => (
								<Text key={i} className='sectionText'>{line}</Text>
							))}
						</View>
					);
				})
			) : null}
		</View>
	);
};

export default AuthorDetail;