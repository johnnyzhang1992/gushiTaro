import { View, Text, Navigator } from '@tarojs/components';

// 诗词画报组件 ---
// 根据诗词内容和宽度，计算内容列数，然后填充内容
// type 布局类型
// bgColor 背景颜色

import './style.scss';

const PoemPostCard = (props) => {
	const {
		sentence = { titleArr: [] },
		width,
		type,
		bgColor = '#fff',
	} = props;
	let pSize = 28; // 诗词字体大小
	let tSize = 24; // 标题字号
	let aSize = 16; // 作者字号
	const minColumn = sentence.titleArr.length + 2; // 最小列数
	const column = Math.round(width / 50); // 计算列数
	// 说明屏幕宽度过下，字体要缩小
	if (column < minColumn) {
		const ratio = column / minColumn;
		pSize = Math.floor(pSize * ratio);
		tSize = Math.floor(tSize * ratio);
		aSize = Math.floor(aSize * ratio);
	}
	const textArr = [];
	const totalColumn = column > minColumn ? column : minColumn;
	const gap = totalColumn - sentence.titleArr.length;
	for (let i = 0; i < totalColumn; i++) {
		if (0 === i) {
			textArr.push({
				id: i,
				text: sentence.author,
				type: 'author',
				size: aSize,
			});
		}
		if (1 === i) {
			textArr.push({
				id: i,
				text: sentence.poem_title,
				type: 'title',
				size: tSize,
			});
		}
		if (i < gap && i > 1) {
			textArr.push({
				id: i,
				text: '',
				type: 'blank',
				size: 0,
			});
		}
		if (i >= gap) {
			textArr.push({
				id: i,
				text: sentence.titleArr[i - gap],
				type: 'poem',
				size: pSize,
			});
		}
	}

	return (
		<Navigator
			url={`/pages/poem/detail?id=${sentence.poem_id}`}
			hoverClass='none'
			className={`postCard ${type}`}
			style={{
				backgroundColor: bgColor,
			}}
		>
			{textArr.map((item) => {
				return (
					<View className={`postItem ${item.type}`} key={item.id}>
						<Text
							className='text'
							style={{
								fontSize: item.size,
								width: item.size + 2,
								maxHeight:
									item.type === 'title'
										? (item.size + 2) * 10
										: '100%',
							}}
						>
							{item.text}
						</Text>
					</View>
				);
			})}
		</Navigator>
	);
};

export default PoemPostCard;
