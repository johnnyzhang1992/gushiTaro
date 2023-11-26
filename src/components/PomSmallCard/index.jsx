import { View, Text } from '@tarojs/components';

import './style.scss';

const PoemSmallCard = (props) => {
	const content = props.content.split('。')[0].replaceAll('　', '') + '。';
	return (
		<View className='poemCard' key={props.id}>
			<View className='title'>
				<Text className='name'>{props.title}</Text>
				<View className='right'>
					{props.dynasty ? (
						<Text className='dynasty'>[{props.dynasty}]</Text>
					) : null}
					<Text className='author'>{props.author}</Text>
				</View>
			</View>
			<View className='content'>
				{/* 一句话介绍，第一个句号前 */}
				<Text numberOfLines={1} decode space='ensp'>
					{content}
				</Text>
			</View>
		</View>
	);
};

export default PoemSmallCard;
