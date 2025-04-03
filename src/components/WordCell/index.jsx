import { View, Text } from '@tarojs/components';

import './style.scss';

/**
 *
 * @param {*} props
 * type: black | white
 * fontSize: number 字体大小
 * text: string
 * cellSize: number 米字格大小
 * @returns
 */
const WordCell = (props) => {
	const { type = 'black', text = '', fontSize = 50, cellSize = 80 } = props;
	return (
		<View
			className={`wordCell ${type}`}
			style={{
				width: `${cellSize}rpx`,
				height: `${cellSize}rpx`,
			}}
		>
			<Text
				className='text'
				style={{
					fontSize: `${fontSize}rpx`,
				}}
			>
				{props.children || text}
			</Text>
		</View>
	);
};
export default WordCell;
