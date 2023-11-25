import { View, Text } from '@tarojs/components';

import './style.scss';

const PoemSmallCard = (props) => {
	return (
		<View className='poemCard' key={props.id}>
		<View className='title'>
			<Text>{props.title}</Text>
			<Text className='author'>{props.author}</Text>
		</View>
		<View className='content'>
			<Text>{props.content}</Text>
		</View>
	</View>
	);
};

export default PoemSmallCard;
