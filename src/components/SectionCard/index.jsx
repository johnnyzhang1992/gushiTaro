import { View, Text } from '@tarojs/components';

import './style.scss';

const SectionCard = ({
	title = '',
	extra,
	children,
	style = {},
	titleClick,
	className = '',
}) => {
	const handleTitleClick = () => {
		if (titleClick && typeof titleClick === 'function') {
			titleClick();
		}
	};
	return (
		<View className={`SectionCard ${className}`} style={style}>
			<View
				className='title'
				onClick={handleTitleClick}
				style={{
					display: `${title ? 'flex' : 'none'}`,
				}}
			>
				<Text>{title}</Text>
				{extra ? <View className='extra'>{extra}</View> : null}
			</View>
			<View className='content'>{children}</View>
		</View>
	);
};

export default SectionCard;
