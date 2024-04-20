import { View, Text } from '@tarojs/components';

import './style.scss';

const convertChinesePunctuationToEnglish = (str) => {
	// 中文标点与对应英文标点的映射
	const map = {
		'「': '[',
		'」': ']',
		'『': '{',
		'』': '}',
		'【': '<',
		'】': '>',
		'（': '(',
		'）': ')',
		'：': ':',
		'；': ';',
		'，': ',',
		'。': '.',
		'！': '!',
		'？': '?',
		'「': '"',
		'」': '"',
		'，': ',',
	};

	// 遍历映射对象，将中文标点替换为英文标点
	Object.keys(map).forEach(function (chinese) {
		str = str.replace(new RegExp(chinese, 'g'), map[chinese]);
	});

	return str;
};
const PinyinText = ({ text, pinyin }) => {
	const textArr = text.split('');
	const pinyinArr = convertChinesePunctuationToEnglish(pinyin)
		.trim()
		.replaceAll('  ', ' ')
		.split(' ');
	console.log(textArr, pinyinArr);
	return (
		<View className='pinyin-text-container'>
			{textArr.map((item, index) => {
				return (
					<View className='pinyin-text' key={index}>
						<Text userSelect decode className='text pinyin'>
							{pinyinArr[index]}
						</Text>
						<Text userSelect decode className='text hanzi'>
							{item}
						</Text>
					</View>
				);
			})}
		</View>
	);
};

export default PinyinText;
