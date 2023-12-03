import { View, Text } from '@tarojs/components';

import HighLightText from '../../../../components/HighLightText';

import './style.scss';

const PoemContent = ({ type, lightWord, xu = '', content = [] }) => {
	return (
		<View className='poemContent'>
			{xu ? (
				<View className='xu'>
					<Text userSelect decode className='text block'>
						{xu}
					</Text>
				</View>
			) : null}
			<View className={`content ${type !== '诗' ? 'wyw' : ''}`}>
				{content.map((item, index) => (
					<View className='contentItem' key={index}>
						<HighLightText
							className='text block'
							text={item}
							lightWord={lightWord}
						/>
					</View>
				))}
			</View>
		</View>
	);
};

export default PoemContent;
