import React, { useState, useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';

import FloatLayout from '../FloatLayout';

import './style.scss';

// 长文本卡片渲染
// 默认渲染五行，多余支持半屏展示；支持全文展示
const LongTextCard = ({ showAll = false, text, title }) => {
	const [isOpen, openVisible] = useState(false);
	// 正文区宽约 680rpx、字号 28rpx → 每行约 24 字，五行约 120 字，留几个字给省略号
	const limitLength = 114;
	// reference 由 props 派生，避免在 useMemo 计算体内 setState
	const reference = useMemo(() => {
		if (text && typeof text !== 'string' && text.reference) {
			const { title, content } = text.reference;
			return {
				title: title || '',
				content: Array.isArray(content)
					? content
					: typeof content === 'string'
						? [content]
						: [],
			};
		}
		return { title: '', content: [] };
	}, [text]);
	// 要判断text 的字段类型，纯文本还是对象
	// 对象结构{ content: [], reference: { title: '', content:[] } }
	const cacheText = useMemo(() => {
		let cText = '';
		if (text && typeof text !== 'string') {
			// 支持两种对象格式：
			// 1. { content: [...], reference: {...} }
			// 2. { reference: { title, content } } — poem_detail 格式
			const { content: topContent, reference: propRef } = text;
			const refContent = propRef?.content;
			const contentArr = (Array.isArray(topContent) && topContent.length > 0)
				? topContent
				: (Array.isArray(refContent) ? refContent : (typeof refContent === 'string' ? [refContent] : []));

			contentArr.forEach((item = '') => {
				cText +=
					(item || '').replace(/<strong>/g, '【').replace(/<\/strong>/g, '】') +
					'\n';
			});
		} else {
			cText = text || '';
		}
		return cText;
	}, [text]);
	const handleClose = () => {
		openVisible(false);
	};
	const handleShow = () => {
		openVisible(true);
	};

	const isLimit = cacheText.length > limitLength && !showAll;
	return (
		<View className='longTextCard'>
			{/* 内容展示 */}
			<View
				className={`textContainer ${isLimit ? 'limit' : ''} ${
					showAll ? 'all' : ''
				}`}
			>
				<View className={`longText ${isLimit ? 'isLimited' : ''}`}>
					<Text
						userSelect
						decode
						space={isLimit ? 'ensp' : 'nbsp'}
						className='text'
					>
						{showAll
							? cacheText
							: isLimit
								? `${cacheText.slice(0, limitLength)}…`
								: cacheText}
					</Text>
				</View>
			</View>
			{/* 资源引用 */}
			{reference.content.length > 0 ? (
				<View
					className='reference'
					style={{
						display: `${isLimit ? 'none' : 'block'}`,
					}}
				>
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
					<Button className='full-btn' plain size='mini' onClick={handleShow}>
						阅读全文 &gt;
					</Button>
				) : null}
			</View>
			{/* 半屏展示全文 */}
			<FloatLayout
				showTitle
				close={handleClose}
				title={title}
				isOpen={isOpen}
				scrollY
			>
				<View className='fullText'>
					<Text userSelect decode className='text'>
						{cacheText}
					</Text>
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
				</View>
			</FloatLayout>
		</View>
	);
};

export default React.memo(LongTextCard);
