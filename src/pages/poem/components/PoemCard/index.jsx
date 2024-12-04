import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useRef } from 'react';

import './style.scss';

import PoemContent from '../PoemContent';
import HighLightText from '../../../../components/HighLightText';
import PinyinText from '../../../../components/PinyinText';

import { fetchPoemPinyin } from '../../../../services/global';
import copySVg from '../../../../images/svg/copy_black.svg';
import shareSvg from '../../../../images/svg/share_black.svg';
import pinyinSvg from '../../../../images/svg/pinyin_black.svg';
import pinyinActiveSvg from '../../../../images/svg/pinyin.svg';

const PoemCard = ({
	id: poemId,
	author_id,
	title,
	dynasty,
	author,
	content,
	is_text,
	type,
	text_content,
	lightWord = '',
	author_avatar = '',
}) => {
	const [Pinyin, updatePinyin] = useState({
		title: '',
		xu: '',
		content: [],
	});
	const pinyinHistory = useRef({
		title: '',
		xu: '',
		content: [],
	})
	const handleNavigateAuthor = () => {
		if (author_id < 1) {
			return false;
		}
		Taro.navigateTo({
			url: '/pages/poet/detail?id=' + author_id,
		});
	};
	// 复制文本
	const handleCopy = () => {
		let _data =
			'《' + title + '》\n' + dynasty + '|' + author + '\n' + text_content;
		Taro.setClipboardData({
			data: _data,
			success: function () {
				Taro.showToast({
					title: '诗词复制成功',
					icon: 'success',
					duration: 2000,
				});
			},
		});
	};

	const getPinyin = () => {
		if (Pinyin.title) {
			updatePinyin({
				title: '',
				xu: '',
				content: [],
			});
			return false;
		}
		// 使用缓存
		if (pinyinHistory.current.title) {
			updatePinyin({
				...pinyinHistory.current,
			});
			return false;
		}
		Taro.showLoading({
			title: '转换中，请稍等',
			icon: 'none',
		});
		fetchPoemPinyin('POST', {
			dictType: 'complete',
			poem_id: poemId
		})
			.then((res) => {
				const { pinyin } = res.data;
				if (!pinyin) {
					Taro.hideLoading();
					Taro.showToast({
						icon: 'none',
						title: '转换失败，请重试！'
					})
					return false
				}
				const pinyinArr = pinyin.split('_');
				const [p_title, p_xu, ...p_content] = pinyinArr;
				updatePinyin({
					title: p_title,
					xu: p_xu,
					content: p_content,
				});
				pinyinHistory.current = {
					title: p_title,
					xu: p_xu,
					content: p_content,
				};
				Taro.hideLoading();
			})
			.catch(() => {
				Taro.hideLoading();
			});
	};
	return (
		<View className='poemCard'>
			{/* 作者 */}
			<View className='card-top'>
				<View className='author' onClick={handleNavigateAuthor}>
					{author_avatar ? (
						<Image
							src={author_avatar}
							mode='aspectFit'
							className='author_avatar'
						/>
					) : null}
					<Text userSelect className='name'>
						{author}
					</Text>
					{dynasty ? (
						<Text userSelect className='dynasty'>
							{dynasty}
						</Text>
					) : null}
				</View>
				{/* 操作区 */}
				<View className='operate-list'>
					<View className='operate-item' onClick={handleCopy}>
						<Image src={copySVg} mode='widthFix' className='icon' />
					</View>
					<View className='operate-item'>
						<Button openType='share' className='share-btn'>
							<Image src={shareSvg} mode='widthFix' className='icon' />
						</Button>
					</View>
					<View
						className='operate-item'
						onClick={getPinyin}
						style={{
							borderColor: Pinyin.title ? '#337ab7' : '#efefef',
						}}
					>
						<Image
							src={Pinyin.title ? pinyinActiveSvg : pinyinSvg}
							mode='widthFix'
							className='icon'
						/>
					</View>
				</View>
			</View>
			{/* 标题 */}
			<View className='title'>
				{Pinyin.title ? (
					<PinyinText
						text={title}
						pinyin={Pinyin.title}
						lightWord={lightWord}
						className='pinyin'
					/>
				) : (
					<HighLightText text={title} lightWord={lightWord} />
				)}
			</View>
			{/* 序文 内容 */}
			<PoemContent
				{...content}
				is_text={is_text}
				type={type}
				text_content={text_content}
				lightWord={lightWord}
				pinyin={Pinyin}
			/>
		</View>
	);
};

export default PoemCard;
