import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter, useLoad } from '@tarojs/taro';
import { useState } from 'react';

import PageHeader from '../../components/PageHeader';
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
					<Image className='avatar' src={author.avatar} mode='aspectFill' />
				) : (
					<View className='avatar avatarPlaceholder'>
						<Text className='avatarText'>
							{(author.author_name || '').slice(0, 1)}
						</Text>
					</View>
				)}
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
		</View>
	);
};

export default AuthorDetail;