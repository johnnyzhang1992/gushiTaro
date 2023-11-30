import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './style.scss';

const SentenceCard = (props) => {
	const handleNavigate = () => {
		Taro.navigateTo({
			url: '/pages/sentence/detail?id=' + props.id,
		});
	};
	return (
		<View className='sentenceCard' onClick={handleNavigate}>
			<View className='title'>
				<Text>{props.title}</Text>
			</View>
			<View className='origin'>{props.origin}</View>
			{props.showCount ? (
				<View className='count'>
					<Text className='num'>喜欢 {props.like_count || 0}</Text>
					<Text className='num'>收藏 {props.collect_count || 0}</Text>
				</View>
			) : null}
		</View>
	);
};

export default SentenceCard;
