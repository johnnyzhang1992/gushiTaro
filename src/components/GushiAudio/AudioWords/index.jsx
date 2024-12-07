// 诗词音频播放词版 --- 歌词
import { View, Text } from '@tarojs/components';

import PinyinText from '../../PinyinText';

import './style.scss';

const splitWord = (text) => {
	const regex = /[,，.!?？。！:：；;'‘’"]/; // 匹配句号、感叹号或问号
	const sentences = text.split(regex);
	return sentences.filter((item) => item.trim());
};

const AudioWords = ({
	content = { content: [] },
	pinyin = { content: [] },
}) => {
	let contentArr = [];
	content.content.forEach((item) => {
		contentArr = [...contentArr, ...splitWord(item)];
	});
	let pinyinArr = [];
	pinyin.content.forEach((item) => {
		pinyinArr = [...pinyinArr, ...splitWord(item)];
	});

	// 根据标点将内容拆分
	return contentArr.map((_item, _index) => (
		<View className='audioWords' key={_index}>
			{pinyinArr[_index] ? (
				<PinyinText
					className='text block pinyin'
					text={_item + ''}
					pinyin={pinyinArr[_index] + ''}
				/>
			) : (
				<Text userSelect decode space='ensp' className='text block'>
					{_item}
				</Text>
			)}
		</View>
	));
};

export default AudioWords;
