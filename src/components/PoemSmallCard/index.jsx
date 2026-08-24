import { View, Text, Navigator } from '@tarojs/components';

import HighLightText from '../HighLightText';

import './style.scss';

const removeSpecialText = (text) => {
	if (!text || typeof text !== 'string') return '';
	return text
		.replace(/<storng/g, '')
		.replace(/<\/strong/g, '')
		.replace(/&quot;/g, '');
};
const PoemSmallCard = ({
	id,
	content,
	text_content,
	dynasty,
	author,
	title,
	showBorder,
	showCount,
	like_count,
	collect_count,
	lightWord,
	hideAudio = false,
}) => {
	const rawContent = text_content || (typeof content === 'string'
		? content
		: (content?.content?.join?.('') || ''));
	const _content = removeSpecialText(rawContent)
		.split('。')
		.filter(t => t.trim())
		.map((text) => {
			return text.replace(/　/g, '') + '。';
		});

	return (
		<View
			className={`poemSmallCard ${showBorder ? '' : 'hideBorder'}`}
			key={id}
		>
			<Navigator
				url={`/pages/poem/detail?keyWord=${lightWord || ''}&id=${id}`}
				className='top'
				hoverClass='none'
			>
				<View className='title'>
					<HighLightText className='name' text={title} lightWord={lightWord} />
				</View>
				<View className='poet'>
					{dynasty ? <Text className='dynasty'>{dynasty}</Text> : null}
					<Text className='author'>{author}</Text>
				</View>
				<View className='content'>
					{/* 全部内容 */}
					{_content.map((text) => {
						return (
							<HighLightText key={text} text={text} lightWord={lightWord} />
						);
					})}
				</View>
			</Navigator>
			<View
				className='bottom'
				style={{
					display: hideAudio && !showCount ? 'none' : 'flex',
				}}
			>
				{showCount ? (
					<View className='count'>
						<Text className='num'>喜欢 {like_count || 0}</Text>
						<Text className='num'>收藏 {collect_count || 0}</Text>
					</View>
				) : null}
			</View>
		</View>
	);
};

export default PoemSmallCard;
