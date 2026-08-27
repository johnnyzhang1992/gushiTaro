import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useEffect, useState, useRef } from 'react';

import SectionCard from '../../components/SectionCard';
import WordCard from '../../components/Dictionary/WordCard';
import WordCell from '../../components/WordCell';

import './detail.scss';

import { fetchDictionaryDetail } from '../../pages/dictionary/service';

const typeArr = ['word', 'ci', 'chengyu'];

const removeDigitsAndParentheses = (str = '') => {
	// 使用正则表达式移除所有阿拉伯数字和括号
	return str.replace(/[0-9()（）\-]/g, '');
};

// 详情页
const DictionaryDetail = () => {
	const [detail, setDetail] = useState({});
	const optionsRef = useRef({});

	const computeData = (res = {}) => {
		console.log(res, 'res');
		const { explanation = '', more = '', word } = res;
		const { type = '' } = optionsRef.current;
		if (type == 'ci') {
			return {
				...res,
				ci: removeDigitsAndParentheses(res.ci),
				pinyin: removeDigitsAndParentheses(res.pinyin),
				explanationObj: explanation.split('\n'),
			};
		}
		if (type == 'chengyu') {
			return { ...res };
		}
		const splitWord = explanation.includes(`\n\n ${word}（`)
			? `\n\n ${word}（`
			: `\n\n ${word}`;
		const explanationObj = explanation.split(splitWord).map((item, index) => {
			const firstWord = index > 0 ? word : '';
			return (firstWord + item).split('\n\n').map((_item) => {
				return _item;
				// return `${_index > 0 ? `(${_index})` : ''}${_item}`;
			});
		});
		const moreObj = more.split(`\n${word}\n`).map((item, index) => {
			const firstWord = index > 0 ? word : '';
			return (firstWord + item).split(`\n${word}`).map((_item, _index) => {
				const word1 = _index > 0 ? word : '';
				return (word1 + _item).replace(/\n/g, '');
			});
		});
		return {
			...res,
			explanationObj,
			moreObj,
		};
	};
	const fetchDetail = (options) => {
		if (typeArr.includes(options.type)) {
			Taro.showLoading({
				title: '加载中',
			});
			// 请求详情
			fetchDictionaryDetail('GET', options)
				.then((res) => {
					setDetail(computeData(res.data));
					Taro.setNavigationBarTitle({
						title: options.type == 'ci' ? res.data.ci : res.data.word,
					});
				})
				.catch((err) => {
					console.log(err, 'err');
					Taro.showToast({
						title: '请求失败',
						icon: 'none',
					});
				})
				.finally(() => {
					Taro.hideLoading();
				});
		}
	};
	useLoad((options) => {
		console.log('DictionaryPage loaded', options);
		optionsRef.current = options;
		fetchDetail(options);
	});

	return (
		<View className='page dictionaryDetailPage'>
			{/* 字详情 */}
			{optionsRef.current.type === 'word' && detail._id ? (
				<View className='wordDetail'>
					<WordCell
						type='red'
						fontSize={80}
						cellSize={120}
						text={detail.word}
					/>
					<View className='hor-item'>
						<Text className='lable'>拼音</Text>
						<Text className='value' userSelect selectable>
							{detail.pinyin}
						</Text>

						<Text className='lable'>繁体</Text>
						<Text className='value' userSelect selectable>
							{detail.oldword}
						</Text>
					</View>
					<View className='hor-item'>
						<Text className='lable'>部首</Text>
						<Text className='value' userSelect selectable>
							{detail.radicals}
						</Text>

						<Text className='lable'>总笔画</Text>
						<Text className='value' userSelect selectable>
							{detail.strokes}
						</Text>
					</View>
					{/* 多音字 */}
					{detail.isPolyphone && detail.pinyinMultiple && detail.pinyinMultiple.length > 0 ? (
						<View className='hor-item'>
							<Text className='lable'>多音字</Text>
							<Text className='value' userSelect selectable>
								{detail.pinyinMultiple.join(' / ')}
							</Text>
						</View>
					) : null}
					{/* 基本解释 */}
					<SectionCard className='explanation' title='解释'>
						<View className='exp_content'>
							{detail.explanationObj && detail.explanationObj.length > 0
								? detail.explanationObj.map((items, index) => {
										return (
											<View className='more_item' key={index}>
												{items.map((item, _index) => (
													<View className='exp_item' key={_index}>
														<Text className='lable' userSelect selectable>
															{item}
														</Text>
													</View>
												))}
											</View>
										);
								  })
								: null}
						</View>
					</SectionCard>
				</View>
			) : null}
			{/* 词语详情 */}
			{optionsRef.current.type === 'ci' && detail._id ? (
				<View className='ciDetail'>
					<View className='top_title'>
						{detail.ci.split('').map((item, index) => (
							<WordCell
								key={index}
								type='red'
								fontSize={60}
								cellSize={100}
								text={item}
							/>
						))}
					</View>
					<View className='hor-item'>
						<Text className='lable'>拼音</Text>
						<Text className='value' userSelect selectable>
							{detail.pinyin}
						</Text>
					</View>
					{detail.pinyinNum ? (
						<View className='hor-item'>
							<Text className='lable'>声调</Text>
							<Text className='value' userSelect selectable>
								{detail.pinyinNum}
							</Text>
						</View>
					) : null}
					{detail.firstCharPinyin && detail.lastCharPinyin ? (
						<View className='hor-item'>
							<Text className='lable'>首尾拼音</Text>
							<Text className='value' userSelect selectable>
								{detail.firstCharPinyin} ... {detail.lastCharPinyin}
							</Text>
						</View>
					) : null}
					{/* 基本解释 */}
					<SectionCard className='explanation' title='解释'>
						<View className='exp_content'>
							{detail.explanationObj && detail.explanationObj.length > 0
								? detail.explanationObj.map((item, index) => {
										return (
											<View className='more_item' key={index}>
												<View className='exp_item'>
													<Text className='lable' userSelect selectable>
														{item}
													</Text>
												</View>
											</View>
										);
								  })
								: null}
						</View>
					</SectionCard>
				</View>
			) : null}
			{/* 成语详情 */}
			{optionsRef.current.type === 'chengyu' && detail._id ? (
				<View className='chengyuDetail'>
					<View className='top_title'>
						{detail.word.split('').map((item, index) => (
							<WordCell
								key={index}
								type='red'
								fontSize={40}
								cellSize={80}
								text={item}
							/>
						))}
					</View>
					<View className='hor-item center'>
						<Text className='lable'>拼音</Text>
						<Text className='value' userSelect selectable>
							{detail.pinyin}
						</Text>

						<Text className='lable center'>拼音缩写</Text>
						<Text className='value' userSelect selectable>
							{detail.abbreviation || detail.pinyinShort}
						</Text>
					</View>
					{detail.firstCharPinyin && detail.lastCharPinyin ? (
						<View className='hor-item'>
							<Text className='lable'>首尾拼音</Text>
							<Text className='value' userSelect selectable>
								{detail.firstCharPinyin} ... {detail.lastCharPinyin}
							</Text>
						</View>
					) : null}
					{/* 解释 */}
					<View className='hor-item'>
						<Text className='lable'>解释</Text>
						<Text className='value'>{detail.explanation}</Text>
					</View>
					{/* 出处 */}
					<View className='hor-item'>
						<Text className='lable'>出处</Text>
						<Text className='value' userSelect selectable>
							{detail.derivation}
						</Text>
					</View>
					{/* 例子 */}
					<View className='hor-item'>
						<Text className='lable'>例子</Text>
						<Text className='value' userSelect selectable>
							{detail.example}
						</Text>
					</View>
				</View>
			) : null}
			{/* ----推荐---- */}
			{/* 相同部首 */}
			{optionsRef.current.type === 'word' && detail.relatedRadicals && detail.relatedRadicals.length > 0 ? (
				<SectionCard title='相同部首'>
					<ScrollView
						className='scrollContainer ci'
						scrollX
						scrollWithAnimation
						enableFlex
						showScrollbar={false}
					>
						{detail.relatedRadicals.map((item) => (
							<WordCard
								{...item}
								key={item._id}
								type='word'
								pinyin={item.pinyin}
								text={item.word}
							/>
						))}
					</ScrollView>
				</SectionCard>
			) : null}
			{/* 关联的字（成语详情显示） */}
			{optionsRef.current.type === 'chengyu' && detail.relatedWords && detail.relatedWords.length > 0 ? (
				<SectionCard title='相关字'>
					<ScrollView
						className='scrollContainer ci'
						scrollX
						scrollWithAnimation
						enableFlex
						showScrollbar={false}
					>
						{detail.relatedWords.map((item) => (
							<WordCard
								{...item}
								key={item._id}
								type='word'
								pinyin={item.pinyin}
								text={item.word}
							/>
						))}
					</ScrollView>
				</SectionCard>
			) : null}
			{/* 关联的字（词语详情显示） */}
			{optionsRef.current.type === 'ci' && detail.relatedWords && detail.relatedWords.length > 0 ? (
				<SectionCard title='相关字'>
					<ScrollView
						className='scrollContainer ci'
						scrollX
						scrollWithAnimation
						enableFlex
						showScrollbar={false}
					>
						{detail.relatedWords.map((item) => (
							<WordCard
								{...item}
								key={item._id}
								type='word'
								pinyin={item.pinyin}
								text={item.word}
							/>
						))}
					</ScrollView>
				</SectionCard>
			) : null}
			{/* 关联的词语（字详情显示） */}
			{optionsRef.current.type === 'word' && detail.relatedWords && detail.relatedWords.length > 0 ? (
				<SectionCard title='相关词语'>
					<ScrollView
						className='scrollContainer'
						scrollX
						scrollWithAnimation
						enableFlex
						showScrollbar={false}
					>
						{detail.relatedWords.map((item) => (
							<WordCard
								{...item}
								key={item._id}
								type='ci'
								pinyin={item.pinyin}
								text={item.word}
							/>
						))}
					</ScrollView>
				</SectionCard>
			) : null}
			{/* 关联的成语（字/词语详情显示） */}
			{(optionsRef.current.type === 'word' || optionsRef.current.type === 'ci') && detail.relatedIdioms && detail.relatedIdioms.length > 0 ? (
				<SectionCard title='相关成语'>
					<ScrollView
						className='scrollContainer'
						scrollX
						scrollWithAnimation
						enableFlex
						showScrollbar={false}
					>
						{detail.relatedIdioms.map((item) => (
							<WordCard
								{...item}
								key={item._id}
								type='chengyu'
								pinyin={item.pinyin}
								text={item.word}
							/>
						))}
					</ScrollView>
				</SectionCard>
			) : null}
			{/* 关联的词语（成语详情显示） */}
			{optionsRef.current.type === 'chengyu' && detail.relatedIdioms && detail.relatedIdioms.length > 0 ? (
				<SectionCard title='相关词语'>
					<ScrollView
						className='scrollContainer'
						scrollX
						scrollWithAnimation
						enableFlex
						showScrollbar={false}
					>
						{detail.relatedIdioms.map((item) => (
							<WordCard
								{...item}
								key={item._id}
								type='ci'
								pinyin={item.pinyin}
								text={item.word}
							/>
						))}
					</ScrollView>
				</SectionCard>
			) : null}
		</View>
	);
};

export default DictionaryDetail;
