import { View } from '@tarojs/components';

import './style.scss';
// 诗词画报布局组件
const PoemPostLayout = ({
	type = 'default',
	activeType = '',
	style = {},
	update,
}) => {
	const isActive = activeType && activeType === type;
	const handleClick = () => {
		if (update && typeof update === 'function') {
			update(type);
		}
	};
	// type default letter 边线为letter
	return (
		<View
			className={`layout-container ${type} ${isActive ? 'active' : ''}`}
			style={style}
			onClick={handleClick}
		>
			<View className='thin'></View>
			<View className='thin'></View>
		</View>
	);
};
export default PoemPostLayout;
