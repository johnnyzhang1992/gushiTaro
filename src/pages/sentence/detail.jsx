import { View, OfficialAccount, Text, Navigator, Image } from '@tarojs/components';
import { useState, useRef } from 'react';
import Taro, {
	useLoad,
	usePullDownRefresh,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';
import { useNavigationBar } from 'taro-hooks';

import LikeButton from '../../components/LikeButton';
import CollectButton from '../../components/CollectButton';

import { fetchSentenceDetail } from './service';

import copyPng from '../../images/icon/copy.png';

import './style.scss';

const SentenceDetail = () => {
	const { setTitle } = useNavigationBar({ title: '古诗文小助手' });
	const catchRef = useRef({});
	const [detail, setDetail] = useState({
		poem: {
			dynasty: '',
			author: '',
		},
		author: {},
		sentence: {
			title: '',
			sentenceArr: [],
			like_count: 0,
			collect_count: 0,
			collect_status: false,
			like_status: false,
		},
	});

	// 拆分词句
	const splitSentence = (sentence) => {
		// 替代特殊符号 。。
		let pattern = new RegExp('[。，.、!！?？]', 'g');
		sentence = sentence.replace(/，/g, ',');
		sentence = sentence.replace(pattern, ',');
		return sentence.split(',').filter((item) => {
			return item;
		});
	};

	const fetchDetail = (id) => {
		const sId = id || catchRef.id;
		fetchSentenceDetail('GET', {
			id: sId,
		}).then((res) => {
			if (res && res.statusCode === 200) {
				console.log(res.data);
				const { sentence = {}, author = {}, poem = {} } = res.data;
				setDetail({
					author: author || {},
					poem,
					sentence: {
						...sentence,
						sentenceArr: splitSentence(sentence.title || ''),
					},
				});
				setTitle(sentence.title);
			}
		});
	};

	// 复制文本
	const handlecopy = () => {
		Taro.setClipboardData({
			data: detail.sentence.title,
			success: function () {
				Taro.showToast({
					title: '复制成功',
					icon: 'success',
					duration: 2000,
				});
			},
		});
	};

	useLoad((options) => {
		console.log('sentence--Detail:', options);
		setTitle('名句 | 古诗文助手');
		catchRef.current = options;
		fetchDetail(options.id);
	});
	usePullDownRefresh(() => {
		console.log('page-pullRefresh');
		fetchDetail();
		Taro.stopPullDownRefresh();
	});
	useShareAppMessage(() => {
		const { sentence } = detail;
		return {
			title: sentence.title || '名句',
			path: '/pages/sentence/detail?id=' + sentence.id,
		};
	});
	useShareTimeline(() => {
		const { sentence } = detail;
		return {
			title: sentence.title || '名句',
			path: '/pages/sentence/detail?id=' + sentence.id,
		};
	});

	return (
		<View className='page sentenceDetail'>
			<View className='topCard'>
				<View class='sentence-section'>
					<View class='sentence-title'>
						{detail.sentence.sentenceArr.map((item) => (
							<Text
								class='content text'
								decode
								userSelect
								key={item}
							>
								{item}
							</Text>
						))}
					</View>
					<view class='sentence-origin'>
						<Text class='text author' decode userSelect>
							{detail.author.author_name}
						</Text>
					</view>
				</View>
			</View>
			{/* 公众号 */}
			<OfficialAccount />
			{/* 诗词卡片 */}
			<view class='poemCard'>
				<Navigator
					url={`/pages/poem/detail?id=${detail.poem.id}`}
					hover-class='none'
					class='poem-item'
				>
					<View class='poem-title title'>{detail.poem.title}</View>
					<View class='poem-author'>
						{'[' + detail.poem.dynasty + '] ' + detail.poem.author}
					</View>
					<View class='poem-title content'>
						{detail.poem.content}
					</View>
				</Navigator>
			</view>
			{/* 操作栏 复制 */}
			<View className='copyContainer' onClick={handlecopy}>
				<Image src={copyPng} className='copy' />
			</View>
			{/* 底部 */}
			<View className='fixBottom'>
				<View className='buttonContainer'>
					<View className='btnItem'>
						<LikeButton
							type='sentence'
							id={detail.sentence.id}
							count={detail.sentence.like_count}
							status={detail.sentence.like_status}
							showText
						/>
					</View>
					<View className='btnItem'>
						<CollectButton
							type='sentence'
							id={detail.sentence.id}
							count={detail.sentence.collect_count}
							status={detail.sentence.collect_status}
							showText
						/>
					</View>
				</View>
			</View>
		</View>
	);
};

export default SentenceDetail;
