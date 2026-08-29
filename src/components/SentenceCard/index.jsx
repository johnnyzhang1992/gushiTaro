import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

import HighLightText from '../HighLightText';

import './style.scss';

// 解析 origin 字段，拆分作者和标题
// 格式："作者《诗词标题》" 或 "作者·诗词标题"
const parseOrigin = (origin) => {
	if (!origin) return { author: '', title: '' };
	
	// 匹配 "作者《标题》" 格式
	const match1 = origin.match(/^(.+?)《(.+?)》$/);
	if (match1) {
		return { author: match1[1], title: match1[2] };
	}
	
	// 匹配 "作者·标题" 格式
	const match2 = origin.match(/^(.+?)·(.+)$/);
	if (match2) {
		return { author: match2[1], title: match2[2] };
	}
	
	// 无法解析，返回原文
	return { author: '', title: origin };
};

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
			<View className='origin'>
				{(() => {
					const { author, title: originTitle } = parseOrigin(origin);
					if (author && originTitle) {
						return (
							<Text>
								<Text className='originAuthor'>{author}</Text>
								<Text className='originDot'>·</Text>
								<Text className='originTitle'>{originTitle}</Text>
							</Text>
						);
					}
					return <Text>{origin}</Text>;
				})()}
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

export default SentenceCard;
