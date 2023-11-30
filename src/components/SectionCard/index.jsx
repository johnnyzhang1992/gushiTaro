import { View } from '@tarojs/components';

import './style.scss';

const SectionCard = (props) => {
	return (
		<View className='SectionCard'>
			<View className='title'>{props.title}</View>
			<View className='content'>
				{ props.children}
			</View>
		</View>
	)
}

export default SectionCard;
