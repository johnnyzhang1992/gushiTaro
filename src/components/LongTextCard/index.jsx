import React, { useState, useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import { AtFloatLayout } from 'taro-ui';

import './style.scss';

// 长文本卡片渲染
// 默认渲染四行，多余支持半屏展示；支持全文展示
const LongTextCard = ({ showAll = false, text, title }) => {
	const [isOpen, openVisible] = useState(false);
	const [reference, setReference] = useState({
		title: '',
		content: [],
	});
	const limitLength = 99;
	// 要判断text 的字段类型，纯文本还是对象
	// 对象结构{ content: [], reference: { title: '', content:[] } }
	const cacheText = useMemo(() => {
		let cText = '';
		if (typeof text !== 'string') {
			const { content = [], reference: propRef = {} } = text;
			if (propRef) {
				setReference((pre) => ({
					...pre,
					...propRef,
					content: Array.isArray(propRef.content)
						? propRef.content
						: [],
				}));
			}
			content.forEach((item) => {
				cText +=
					item
						.replaceAll('<strong>', '【')
						.replaceAll('</strong>', '】') + '\n';
			});
		} else {
			cText = text;
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
					<Text userSelect decode className='text'>
						{showAll
							? cacheText
							: cacheText.substring(0, limitLength)}
						{!showAll && cacheText.length > limitLength
							? '...'
							: ''}
					</Text>
				</View>
			</View>
			{/* 资源引用 */}
			{reference.content.length > 0 ? (
				<View className='reference'>
					<View className='title'>{reference.title}</View>
					{(reference.content || []).map((ref, index) => (
						<View className='refItem' key={index}>
							<Text userSelect decode className='text'>
								{ref}
							</Text>
						</View>
					))}
				</View>
			) : null}
			{/* 操作区 */}
			<View className='textOperate'>
				{!showAll && cacheText.length > limitLength ? (
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
				<View className='fullText' catchMove>
					<Text userSelect decode className='text'>
						{cacheText}
					</Text>
				</View>
			</AtFloatLayout>
		</View>
	);
};

export default React.memo(LongTextCard);
