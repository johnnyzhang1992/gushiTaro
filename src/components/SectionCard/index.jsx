import { View, Text } from '@tarojs/components';

import './style.scss';

const SectionCard = ({ title, extra, children, style = {} }) => {
	return (
		<View className='SectionCard' style={style}>
			<View className='title'>
				<Text>{title}</Text>
				{extra ? <View className='extra'>{extra}</View> : null}
			</View>
			<View className='content'>{children}</View>
		</View>
	);
};

export default SectionCard;
