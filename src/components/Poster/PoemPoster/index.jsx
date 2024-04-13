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

const PoemPosterCard = (props) => {
	const {
		sentence = { titleArr: [] },
		width,
		type,
		letterBorder = '',
		mode = 'post',
	} = props;
	let pSize = 28; // 诗词字体大小
	let tSize = 24; // 标题字号
	let aSize = 16; // 作者字号
	if (type === 'center') {
		pSize = mode === 'bg' ? 28 : 30;
		aSize = 14;
	}
	if (type === 'horizontal') {
		pSize = 30;
		tSize = 16;
	}
	const minColumn = sentence.titleArr.length + 1; // 最小列数
	const column = Math.round(width / 60); // 计算列数
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
	let maxPoemHeight = 0;
	let ratio = 1.3 // 放大比例
	if (type === 'horizontal') {
		ratio = 1
	}
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
			let text = sentence.poem_title;
			if (type === 'center') {
				text = '︽' + sentence.poem_title + '︾';
			}
			if (type === 'horizontal') {
				text = sentence.author + '《' + sentence.poem_title + '》';
			}
			textArr.push({
				id: i,
				text: text,
				type: 'title',
				size: tSize,
			});
		}
		if (i < gap && i > 1 && type !== 'center') {
			textArr.push({
				id: i,
				text: '',
				type: 'blank',
				size: 0,
			});
		}
		if (i >= gap) {
			let text = sentence.titleArr[i - gap];
			textArr.push({
				id: i,
				text,
				type: 'poem',
				size: pSize,
			});
			if (maxPoemHeight < text.length * pSize * ratio) {
				maxPoemHeight = text.length * pSize * ratio;
			}
		}
	}
	const styleName = type !== 'horizontal' ? 'minHeight' : 'minWidth';
	const poemStyle = {
		title: {},
		poem: {},
		author: {},
	};
	poemStyle.author[styleName] = maxPoemHeight;
	poemStyle.title[styleName] = type === 'horizontal' ? maxPoemHeight : 'auto';
	poemStyle.poem[styleName] = maxPoemHeight;

	return (
		<Navigator
			url={`/pages/poem/detail?id=${sentence.poem_id}`}
			hoverClass='none'
			className={`postCard ${type} ${letterBorder}`}
		>
			{textArr.map((item) => {
				return (
					<View className={`postItem ${item.type}`} key={item.id}>
						{item.type === 'author' ? (
							<View className='poem-container' style={poemStyle['author']}>
								<View className='author-container'>
									<TextItem {...item} />
								</View>
							</View>
						) : (
							<View className='poem-container' style={poemStyle[item.type]}>
								<TextItem {...item} />
							</View>
						)}
					</View>
				);
			})}
		</Navigator>
	);
};

export default PoemPosterCard;
