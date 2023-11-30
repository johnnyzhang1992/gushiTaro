import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './style.scss';

import PoemContent from '../PoemContent';

const PoemCard = (props) => {
	const handleNavigateAuthor = () => {
		if (props.author_id < 1) {
			return false;
		}
		Taro.navigateTo({
			url: '/pages/poet/detail?id=' + props.author_id,
		});
	};
	return (
		<View className='poemCard'>
			{/* 标题 */}
			<View className='title'>
				<Text userSelect>{props.title}</Text>
			</View>
			{/* 作者 */}
			<View className='author' onClick={handleNavigateAuthor}>
				{props.dynasty ? (
					<Text userSelect>[{props.dynasty}]</Text>
				) : null}
				<Text userSelect className='name'>
					{props.author}
				</Text>
			</View>
			{/* 序文 内容 */}
			<PoemContent
				{...props.content}
				is_text={props.is_text}
				type={props.type}
				text_content={props.text_content}
			/>
		</View>
	);
};

export default PoemCard;
