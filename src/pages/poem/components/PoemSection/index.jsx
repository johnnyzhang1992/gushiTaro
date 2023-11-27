import { View } from '@tarojs/components';

import './style.scss';

const PoemSection = (props) => {
	return (
		<View className='poemSection'>
			<View className='title'>{props.title}</View>
			<View className='content'>
				{ props.children}
			</View>
		</View>
	)
}

export default PoemSection;
