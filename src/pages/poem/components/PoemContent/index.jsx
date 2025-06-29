import { View, Text } from '@tarojs/components';

import HighLightText from '../../../../components/HighLightText';
import PinyinText from '../../../../components/PinyinText';

import './style.scss';

const splitStringWithPunctuation = (_str, type) => {
	if (type && type === '文言文') {
		return _str;
	}
	const str = _str.join('').replaceAll('&quot;', '"');
	// 定义标点符号的正则表达式
	const punctuationRegex = /[.，。？；,!！?;]/g;

	// 使用正则表达式分割字符串，同时保留标点符号
	const parts = str.split(punctuationRegex).filter(Boolean);
	const punctuation = str.match(punctuationRegex) || [];

	// 将标点符号插入到数组中
	const result = [];
	let partIndex = 0;
	let punctuationIndex = 0;

	while (partIndex < parts.length || punctuationIndex < punctuation.length) {
		let text = '';
		if (partIndex < parts.length) {
			//result.push(parts[partIndex]);
			text = parts[partIndex];
			partIndex++;
		}
		if (punctuationIndex < punctuation.length) {
			//result.push(punctuation[punctuationIndex]);
			text += punctuation[punctuationIndex];
			punctuationIndex++;
		}
		result.push(text);
	}

	return result;
};

const PoemContent = ({ type, lightWord, xu = '', content = [], pinyin }) => {
	const typeObj = {
		诗: 'shi',
		词: 'ci',
		文言文: 'wyw',
	};
	const { xu: pinyinXu = '', content: pinyinContent = [] } = pinyin || {};
	let hanzi_Content = content;
	let pinyin_Content = pinyinContent;
	if (pinyinContent[0]) {
		hanzi_Content = splitStringWithPunctuation(content, type);
		pinyin_Content = splitStringWithPunctuation(pinyinContent, type);
	}
	return (
		<View className='poemContent'>
			{pinyinXu.trim() ? (
				<View className='xu'>
					<PinyinText
						className='text block pinyin'
						text={xu}
						pinyin={pinyinXu}
					/>
				</View>
			) : null}
			{xu && !pinyinXu.trim() ? (
				<View className='xu'>
					<Text userSelect decode className='text block'>
						{xu}
					</Text>
				</View>
			) : null}
			<View className={`content ${typeObj[type] || 'ci'}`}>
				{hanzi_Content.map((item, index) => (
					<View className='contentItem' key={index}>
						{pinyin_Content[index] ? (
							<PinyinText
								className='text block pinyin'
								text={item}
								pinyin={pinyin_Content[index]}
							/>
						) : (
							<HighLightText
								className='text block'
								text={item}
								lightWord={lightWord}
							/>
						)}
					</View>
				))}
			</View>
		</View>
	);
};

export default PoemContent;
