import { View, Text } from '@tarojs/components';

import HighLightText from '../../../../components/HighLightText';
import PinyinText from '../../../../components/PinyinText';

import './style.scss';

const PoemContent = ({ type, lightWord, xu = '', content = [], pinyin }) => {
	const typeObj = {
		诗: 'shi',
		词: 'ci',
		文言文: 'wyw',
	};
	const { xu: pinyinXu = '', content: pinyinContent = '' } = pinyin || {};
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
				{content.map((item, index) => (
					<View className='contentItem' key={index}>
						{pinyinContent[index] ? (
							<PinyinText
								className='text block pinyin'
								text={item}
								pinyin={pinyinContent[index]}
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
