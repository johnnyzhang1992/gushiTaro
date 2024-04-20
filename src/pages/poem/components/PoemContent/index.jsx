import { View, Text } from '@tarojs/components';

import HighLightText from '../../../../components/HighLightText';

import './style.scss';

const PoemContent = ({ type, lightWord, xu = '', content = [] }) => {
	const typeObj = {
		'诗': 'shi',
		'词': 'ci',
		'文言文': 'wyw',
	}
	return (
		<View className='poemContent'>
			{xu ? (
				<View className='xu'>
					<Text userSelect decode className='text block'>
						{xu}
					</Text>
				</View>
			) : null}
			<View className={`content ${typeObj[type] || 'ci'}`}>
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
