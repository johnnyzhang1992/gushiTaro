import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';

import WordCell from '../../WordCell';

import './style.scss';

const removeDigitsAndParentheses = (str = '') => {
	// 使用正则表达式移除所有阿拉伯数字和括号
	return str.replace(/[0-9()（）\-]/g, '');
};

const WordCard = (props) => {
	const { type, pinyin = '', text = '', _id, cellType = 'black' } = props;
	const textArr = removeDigitsAndParentheses(text).split('');
	const pinyinArr = removeDigitsAndParentheses(pinyin).split(' ');
	const navigateToDetail = () => {
		Taro.navigateTo({
			url: `/pages/dictionary/detail?type=${type}&id=${_id}`,
		});
	};

	return (
		<View className={`wordCard ${type}`}>
			<View className='wordContainer' onClick={navigateToDetail}>
				{textArr.map((item, index) => (
					<View className='wordItemCell' key={index}>
						{pinyinArr[index] ? (
							<Text className='pinyin' userSelect selectable>
								{pinyinArr[index]}
							</Text>
						) : null}
						<WordCell type={cellType} fontSize={30} cellSize={60} text={item} />
					</View>
				))}
			</View>
		</View>
	);
};

export default WordCard;
