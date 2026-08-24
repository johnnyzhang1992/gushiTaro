import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter, useLoad } from '@tarojs/taro';
import { useState } from 'react';

import PageHeader from '../../components/PageHeader';
import PoemSmallCard from '../../components/PoemSmallCard';
import SentenceCard from '../../components/SentenceCard';
import SectionCard from '../../components/SectionCard';
import { fetchPoetDetail } from './service';

import './detail.scss';

const AuthorDetail = () => {
	const router = useRouter();
	const id = router.params.id;

	const [author, setAuthor] = useState(null);
	const [tab, setTab] = useState('poems'); // poems | sentences

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
			<PageHeader showSearch={false} showBack />

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
					{author.dynasty ? (
						<Text className='dynasty'>{author.dynasty}</Text>
					) : null}
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

			{author.styled ? (
				<View className='authorBio'>
					<Text className='bioText'>{author.styled}</Text>
				</View>
			) : null}
		</View>
	);
};

export default AuthorDetail;