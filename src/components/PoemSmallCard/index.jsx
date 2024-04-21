import { View, Text, Navigator } from '@tarojs/components';
import { useState } from 'react';

import HighLightText from '../HighLightText';
import AudioCard from '../AudioCard';

import './style.scss';

const removeSpecialText = (text) => {
	return text
		.replaceAll('<storng', '')
		.replaceAll('</strong', '')
		.replaceAll('&quot;', '');
};
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
	hideAudio = false,
}) => {
	const [showAduio, audioVisible] = useState(false);
	const _content = removeSpecialText(content)
		.split('。')
		.map((text) => {
			return text.replaceAll('　', '') + '。';
		})
		.slice(0, 2);
	const handleAudioVisible = (e) => {
		audioVisible((pre) => !pre);
		e.stopPropagation();
	};
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
					{/* 一句话介绍，第一个句号前 */}
					{_content.map((text) => {
						return (
							<HighLightText key={text} text={text} lightWord={lightWord} />
						);
					})}
					<HighLightText key='other' text='......' />
				</View>
			</Navigator>
			<View
				className='bottom'
				style={{
					display: hideAudio && !showCount ? 'none' : 'flex',
				}}
			>
				{!hideAudio ? (
					<View
						className='at-icon at-icon-volume-plus audio icon'
						onClick={handleAudioVisible}
					>
						<Text className='text'>{showAduio ? '收起' : '播放'}</Text>
					</View>
				) : null}
				{showCount ? (
					<View className='count'>
						<Text className='num'>喜欢 {like_count || 0}</Text>
						<Text className='num'>收藏 {collect_count || 0}</Text>
					</View>
				) : null}
			</View>
			{showAduio ? <AudioCard id={id} showPoem={false} /> : null}
		</View>
	);
};

export default PoemSmallCard;
