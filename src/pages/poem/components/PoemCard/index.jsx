import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './style.scss';

import PoemContent from '../PoemContent';
import HighLightText from '../../../../components/HighLightText';

const PoemCard = ({
	author_id,
	title,
	dynasty,
	author,
	content,
	is_text,
	type,
	text_content,
	lightWord = '',
	author_avatar = '',
}) => {
	const handleNavigateAuthor = () => {
		if (author_id < 1) {
			return false;
		}
		Taro.navigateTo({
			url: '/pages/poet/detail?id=' + author_id,
		});
	};
	return (
		<View className='poemCard'>
			{/* 作者 */}
			<View className='card-top'>
				<View className='author' onClick={handleNavigateAuthor}>
					{author_avatar ? (
						<Image
							src={author_avatar}
							mode='aspectFit'
							className='author_avatar'
						/>
					) : null}
					<Text userSelect className='name'>
						{author}
					</Text>
					{dynasty ? (
						<Text userSelect className='dynasty'>
							{dynasty}
						</Text>
					) : null}
				</View>
				{/* 操作区 */}
				<View
					className='operate-list'
					style={{
						display: 'none',
					}}
				>
					<View className='operate-item'>复</View>
					<View className='operate-item'>享</View>
					<View className='operate-item'>拼</View>
				</View>
			</View>
			{/* 标题 */}
			<View className='title'>
				<HighLightText text={title} lightWord={lightWord} />
			</View>
			{/* 序文 内容 */}
			<PoemContent
				{...content}
				is_text={is_text}
				type={type}
				text_content={text_content}
				lightWord={lightWord}
			/>
		</View>
	);
};

export default PoemCard;
