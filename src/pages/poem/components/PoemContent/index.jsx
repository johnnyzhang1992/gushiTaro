import { View, Text } from '@tarojs/components';

import './style.scss';

const PoemContent = (props = { xu: '', content: [] }) => {
	const { xu = '', content = [] } =
		typeof props.content === 'string' ? { xu: '', content: [] } : props;
	return (
		<View className='poemContent'>
			{xu ? (
				<View className='xu'>
					<Text selectable userSelect decode className='text block'>
						{xu}
					</Text>
				</View>
			) : null}
			<View className={`content ${props.type !== '诗' ? 'wyw' : ''}`}>
				{content.map((item, index) => (
					<View className='contentItem' key={index}>
						<Text selectable userSelect decode className='text block'>
							{item}
						</Text>
					</View>
				))}
			</View>
		</View>
	);
};

export default PoemContent;
