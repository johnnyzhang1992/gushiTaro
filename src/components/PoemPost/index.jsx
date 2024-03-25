import { View, Text, Navigator } from '@tarojs/components';

// 诗词画报组件 ---
// 根据诗词内容和宽度，计算内容列数，然后填充内容
// type 布局类型
// bgColor 背景颜色

import './style.scss';

const TextItem = (props) => {
	const { text = '', type = 'poem', size = 24 } = props;
	const TextArr = text.split('');
	const style = {
		fontSize: size,
		width: size,
		height: type === 'poem' ? size * 1.3 : size * 1.2,
	};
	return TextArr.map((item, index) => {
		return (
			<Text key={index} className='text' style={style}>
				{item}
			</Text>
		);
	});
};

const PoemPostCard = (props) => {
	const {
		sentence = { titleArr: [] },
		width,
		type,
		bgColor = '#fff',
		mini = false
	} = props;
	let pSize = mini ? 22 :28; // 诗词字体大小
	let tSize = mini ? 18 : 24; // 标题字号
	let aSize = mini ? 12 : 16; // 作者字号
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
						{item.type === 'author' ? (
							<View className='author-container'>
								<TextItem {...item} />
							</View>
						) : (
							<TextItem {...item} />
						)}
					</View>
				);
			})}
		</Navigator>
	);
};

export default PoemPostCard;
