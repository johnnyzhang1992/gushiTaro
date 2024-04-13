import { View } from '@tarojs/components';

import './style.scss';
// 诗词画报布局组件
const PoemPostLayout = ({
	type = 'default',
	activeType = '',
	style = {},
	update,
	letterBorder = '',
	borderColor = '#333',
}) => {
	const isActive = activeType && activeType === type;
	const handleClick = () => {
		if (update && typeof update === 'function') {
			update({
				type,
				letterBorder: letterBorder || '',
			});
		}
	};
	// type default letter 边线为letter
	return (
		<View
			className={`layout-container ${type} ${isActive ? 'active' : ''}`}
			style={style}
			onClick={handleClick}
		>
			<View
				className='thin'
				style={{
					backgroundColor: borderColor,
					height: type.includes('Border') ? '100%' : '80%',
				}}
			></View>
			<View
				className='thin'
				style={{
					backgroundColor: borderColor,
					height: type.includes('Border') ? '100%' : '80%',
				}}
			></View>
			<View
				className='border-container'
				style={{
					display: type.includes('Border') ? 'flex' : 'none',
				}}
			>
				{[1, 2, 3, 4].map((it) => {
					return <View className='thin-border' key={it}></View>;
				})}
			</View>
		</View>
	);
};
export default PoemPostLayout;
