import { View, Text } from '@tarojs/components';

import './style.scss';

const SectionCard = ({ title, extra, children, style = {}, titleClick }) => {
	const handleTitleClick = () => {
		if (titleClick && typeof titleClick === 'function') {
			titleClick();
			console.log('--sectionCard--titleClick')
		}
	}
	return (
		<View className='SectionCard' style={style}>
			<View className='title' onClick={handleTitleClick}>
				<Text>{title}</Text>
				{extra ? <View className='extra'>{extra}</View> : null}
			</View>
			<View className='content'>{children}</View>
		</View>
	);
};

export default SectionCard;
