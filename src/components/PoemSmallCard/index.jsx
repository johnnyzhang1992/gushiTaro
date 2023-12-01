import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './style.scss';

const PoemSmallCard = (props) => {
	const content = props.content.split('。')[0].replaceAll('　', '') + '。';
	const handleNavigate = () => {
		Taro.navigateTo({
			url: '/pages/poem/detail?id=' + props.id,
		});
	};
	return (
		<View
			className={`poemSmallCard ${props.showBorder ? '' : 'hideBorder'}`}
			key={props.id}
			onClick={handleNavigate}
		>
			<View className='title'>
				<Text className='name'>{props.title}</Text>
			</View>
			<View className='poet'>
				{props.dynasty ? (
					<Text className='dynasty'>{props.dynasty}</Text>
				) : null}
				<Text className='author'>{props.author}</Text>
			</View>
			<View className='content'>
				{/* 一句话介绍，第一个句号前 */}
				<Text numberOfLines={1} decode space='ensp'>
					{content}
				</Text>
			</View>
			{props.showCount ? (
				<View className='count'>
					<Text className='num'>喜欢 {props.like_count || 0}</Text>
					<Text className='num'>收藏 {props.collect_count || 0}</Text>
				</View>
			) : null}
		</View>
	);
};

export default PoemSmallCard;
