import { useState, useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import { AtFloatLayout } from 'taro-ui';

import './style.scss';

// 长文本卡片渲染
// 默认渲染四行，多余支持半屏展示；支持全文展示
const LongTextCard = (props) => {
	const { showAll = false, text, title } = props;
	const [isOpen, openVisible] = useState(false);
	const [fullText, setFullText] = useState('');
	const [reference, setReference] = useState({
		title: '',
		content: [],
	});
	// 要判断text 的字段类型，纯文本还是对象
	// 对象结构{ content: [], reference: { title: '', content:[] } }
	const cacheText = useMemo(() => {
		let cText = '';
		if (typeof text !== 'string') {
			const { content, reference: propRef = {} } = text;
			if (propRef) {
				setReference((pre) => ({
					...pre,
					...propRef,
					content: Array.isArray(propRef.content)
						? propRef.content
						: [propRef.content],
				}));
			}
			content.forEach((item) => {
				cText += item + '\n';
			});
			setFullText(cText);
		} else {
			cText = text;
			setFullText(text);
		}
		return cText;
	}, [text]);
	const handleClose = () => {
		openVisible(false);
	};
	const handleShow = () => {
		openVisible(true);
	};

	return (
		<View className='longTextCard'>
			{/* 内容展示 */}
			<View className={`textContainer ${showAll ? 'all' : ''}`}>
				<View className='longText'>
					<Text selectable userSelect decode className='text'>
						{showAll ? cacheText : cacheText.substring(0, 100)}
						{!showAll && cacheText.length > 100 ? '...' : ''}
					</Text>
				</View>
			</View>
			{/* 资源引用 */}
			{reference.content.length > 0 ? (
				<View className='reference'>
					<View className='title'>{reference.title}</View>
					{(reference.content || []).map((ref, index) => (
						<View className='refItem' key={index}>
							<Text selectable userSelect decode className='text'>
								{ref}
							</Text>
						</View>
					))}
				</View>
			) : null}
			{/* 操作区 */}
			<View className='textOperate'>
				{!showAll ? (
					<Button plain size='mini' onClick={handleShow}>
						阅读全文
					</Button>
				) : null}
			</View>
			{/* 半屏展示全文 */}
			<AtFloatLayout
				isOpened={isOpen}
				title={title}
				scrollY
				onClose={handleClose}
			>
				<View className='fullText'>
					<Text selectable userSelect decode className='text'>
						{fullText}
					</Text>
				</View>
			</AtFloatLayout>
		</View>
	);
};

export default LongTextCard;
