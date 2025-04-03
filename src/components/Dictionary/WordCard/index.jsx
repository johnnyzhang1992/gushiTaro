import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';

import WordCell from '../../WordCell';

import './style.scss';

const WordCard = (props) => {
	const { type, pinyin = '', text = '', _id, cellType = 'black' } = props;
	const textArr = text.split('');
	const pinyinArr = pinyin.split(' ');
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
