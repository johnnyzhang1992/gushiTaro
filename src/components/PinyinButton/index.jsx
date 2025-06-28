import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import { useState, useRef } from 'react';

import { fetchPoemPinyin } from '../../services/global';
import pinyinSvg from '../../images/svg/pinyin.svg';

import './style.scss';

/**
 * 拼音按钮组件
 *
 * 用于显示和切换诗歌拼音的按钮组件
 * @param {Object} props - 组件属性
 * @param {string} props.className - 自定义类名
 * @param {string} props.poemId - 诗歌ID
 * @param {Function} props.handlePinyinChange - 拼音变化回调函数
 *
 * @returns {JSX.Element} 返回拼音按钮的React组件
 *
 * @example
 * <PinyinButton
 *   text="显示拼音"
 *   className="custom-class"
 *   poemId="123"
 *   handlePinyinChange={handleChange}
 * />
 */
const PinyinButton = (props) => {
	const { className, poemId, handlePinyinChange } = props;
	const [Pinyin, updatePinyin] = useState({
		title: '',
		xu: '',
		content: [],
	});
	const pinyinHistory = useRef({
		title: '',
		xu: '',
		content: [],
	});

	const updatePinyinForParent = (pinyinObj) => {
		if (handlePinyinChange && typeof handlePinyinChange === 'function') {
			handlePinyinChange({ ...pinyinObj });
		}
	};

	const getPinyin = () => {
		if (Pinyin.title) {
			updatePinyin({
				title: '',
				xu: '',
				content: [],
			});
			updatePinyinForParent({
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
			updatePinyinForParent({
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
			poem_id: poemId,
		})
			.then((res) => {
				const { pinyin } = res.data;
				if (!pinyin) {
					Taro.hideLoading();
					Taro.showToast({
						icon: 'none',
						title: '转换失败，请重试！',
					});
					return false;
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
				updatePinyinForParent({
					title: p_title,
					xu: p_xu,
					content: p_content,
				});
				Taro.hideLoading();
			})
			.catch(() => {
				Taro.hideLoading();
			});
	};

	return (
		<View className={['pinyinButton', className]} onClick={getPinyin}>
			<Image
				src={pinyinSvg}
				mode='widthFix'
				className='icon'
			/>
		</View>
	);
};
export default PinyinButton;
