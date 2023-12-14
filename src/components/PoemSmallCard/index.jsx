import { View, Text, Navigator } from '@tarojs/components';
import { useState } from 'react';

import HighLightText from '../HighLightText';
import AudioCard from '../AudioCard';

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
	const [showAduio, audioVisible] = useState(false);
	const _content = content.split('。')[0].replaceAll('　', '') + '。';
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
					<HighLightText
						className='name'
						text={title}
						lightWord={lightWord}
					/>
				</View>
				<View className='poet'>
					{dynasty ? (
						<Text className='dynasty'>{dynasty}</Text>
					) : null}
					<Text className='author'>{author}</Text>
				</View>
				<View className='content'>
					{/* 一句话介绍，第一个句号前 */}
					<HighLightText text={_content} lightWord={lightWord} />
				</View>
			</Navigator>
			<View className='bottom'>
				<View
					className='at-icon at-icon-volume-plus audio icon'
					onClick={handleAudioVisible}
				></View>
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
