import { View, Text } from '@tarojs/components';
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
			{/* 标题 */}
			<View className='title'>
				<HighLightText text={title} lightWord={lightWord} />
			</View>
			{/* 作者 */}
			<View className='author' onClick={handleNavigateAuthor}>
				{dynasty ? <Text userSelect>[{dynasty}]</Text> : null}
				<Text userSelect className='name'>
					{author}
				</Text>
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
