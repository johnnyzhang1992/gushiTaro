import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

import HighLightText from '../HighLightText';

import './style.scss';

const SentenceCard = ({
	id,
	title,
	origin,
	showCount = false,
	like_count,
	collect_count,
	showBorder = true,
	lightWord = '',
}) => {
	const handleNavigate = () => {
		Taro.navigateTo({
			url: `/pages/sentence/detail?keyWord=${lightWord || ''}&id=${id}`,
		});
	};
	return (
		<View
			className={`sentenceCard ${showBorder ? '' : 'hideBorder'}`}
			onClick={handleNavigate}
		>
			<View className='title'>
				<HighLightText text={title} lightWord={lightWord} />
			</View>
			<View className='origin'>{origin}</View>
			{showCount ? (
				<View className='count'>
					<Text className='num'>喜欢 {like_count || 0}</Text>
					<Text className='num'>收藏 {collect_count || 0}</Text>
				</View>
			) : null}
		</View>
	);
};

export default SentenceCard;
