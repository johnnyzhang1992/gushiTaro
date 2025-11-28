import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';

import './style.scss';

import PoemContent from '../PoemContent';
import HighLightText from '../../../../components/HighLightText';
import PinyinText from '../../../../components/PinyinText';
import PinyinButton from '../../../../components/PinyinButton';
import CdnImage from '../../../../components/CdnImage';

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
	id,
}) => {
	const [Pinyin, updatePinyin] = useState({ title: '', xu: '', content: [] });
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
						<CdnImage
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
				<View className='operate-list'>
					<PinyinButton poemId={id} handlePinyinChange={updatePinyin} />
				</View>
			</View>
			{/* 标题 */}
			<View className='title'>
				{Pinyin.title ? (
					<PinyinText
						text={title}
						pinyin={Pinyin.title}
						lightWord={lightWord}
						className='pinyin'
					/>
				) : (
					<HighLightText text={title} lightWord={lightWord} />
				)}
			</View>
			{/* 序文 内容 */}
			<PoemContent
				{...content}
				is_text={is_text}
				type={type}
				text_content={text_content}
				lightWord={lightWord}
				pinyin={Pinyin}
			/>
		</View>
	);
};

export default PoemCard;
