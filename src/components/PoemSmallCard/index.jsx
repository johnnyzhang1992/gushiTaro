import { useMemo } from "react";
import { View, Text, Navigator } from '@tarojs/components';

import HighLightText from '../HighLightText';

import './style.scss';

const removeSpecialText = (text) => {
	if (!text || typeof text !== 'string') return '';
	return text
		.replace(/<storng/g, '')
		.replace(/<\/strong/g, '')
		.replace(/&quot;/g, '')
		.trim();
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
	footerSlot = null,
}) => {
	// 优先使用 content.content 数组格式
	const _content = useMemo(() => {
		// 如果 content 是对象且有 content 数组，直接使用
		if (content && typeof content === 'object' && Array.isArray(content.content)) {
			return content.content
				.filter(t => t && t.trim())
				.map(t => removeSpecialText(t.replace(/　/g, '').trim()));
		}
		// 否则使用 text_content 或合并 content
		const rawContent = text_content || (typeof content === 'string'
			? content
			: (content?.content?.join?.('') || ''));
		return removeSpecialText(rawContent)
			.split('。')
			.filter(t => t.trim())
			.map((text) => text.replace(/　/g, '') + '。');
	}, [text_content, content]);

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
					display: (hideAudio && !showCount && !footerSlot) ? 'none' : 'flex',
				}}
			>
				{footerSlot ? (
					footerSlot
				) : showCount ? (
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
