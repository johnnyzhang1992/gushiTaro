import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

import HighLightText from '../HighLightText';

import './style.scss';

const PoemSmallCard = ({
	id,
	content,
	dynasty,
	author,
	title,
	showBorder,
	showCount,
	like_count,
	collect_count,
	lightWord,
}) => {
	const _content = content.split('。')[0].replaceAll('　', '') + '。';
	const handleNavigate = () => {
		Taro.navigateTo({
			url: `/pages/poem/detail?keyWord=${lightWord || ''}&id=${id}`,
		});
	};
	return (
		<View
			className={`poemSmallCard ${showBorder ? '' : 'hideBorder'}`}
			key={id}
			onClick={handleNavigate}
		>
			<View className='title'>
				<HighLightText
					className='name'
					text={title}
					lightWord={lightWord}
				/>
			</View>
			<View className='poet'>
				{dynasty ? <Text className='dynasty'>{dynasty}</Text> : null}
				<Text className='author'>{author}</Text>
			</View>
			<View className='content'>
				{/* 一句话介绍，第一个句号前 */}

				<HighLightText text={_content} lightWord={lightWord} />
			</View>
			{showCount ? (
				<View className='count'>
					<Text className='num'>喜欢 {like_count || 0}</Text>
					<Text className='num'>收藏 {collect_count || 0}</Text>
				</View>
			) : null}
		</View>
	);
};

export default PoemSmallCard;
