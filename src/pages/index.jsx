import { View, Text, Snapshot, Image, Navigator } from '@tarojs/components';
import { useState, useEffect, useCallback } from 'react';
import { AtButton } from 'taro-ui';
import Taro, {
	usePullDownRefresh,
	useShareAppMessage,
	useShareTimeline,
	useLoad,
} from '@tarojs/taro';

import xcxPng from '../images/xcx.jpg';
import Utils from '../utils/util';
import { fetchRandomSentence } from '../services/global';

import './index.scss';

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

const Index = () => {
	const [date] = useState(() => {
		return Utils.formatDate().join('/');
	});
	const [sentence, setSentence] = useState({
		titleArr: [],
	});

	const fetchSentence = useCallback(() => {
		const [year, m, d] = Utils.formatDate();
		const currentDate = `${year}/${m}/${d}`;
		const localSentence = Taro.getStorageSync('home_senetnce');
		if (localSentence && localSentence.date == currentDate) {
			const temSen = localSentence.data;
			setSentence({
				...temSen,
				titleArr: temSen.titleArr || splitSentence(temSen.title),
			});
			return false;
		}
		fetchRandomSentence()
			.then((res) => {
				if (res && res.statusCode == 200) {
					const temSen = {
						...res.data[0],
						titleArr: splitSentence(res.data[0].title) || [],
					};
					setSentence(temSen);
					Taro.setStorageSync('home_senetnce', {
						date: currentDate,
						data: temSen,
					});
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	useEffect(() => {
		fetchSentence();
	}, [fetchSentence]);

	// 下载图片到本地
	const handleDownload = () => {
		console.log('点击生成图片');
		Taro.createSelectorQuery()
			.select('#poemCard')
			.node()
			.exec((res) => {
				console.log(res[0]);
				const node = res[0].node;
				node.takeSnapshot({
					type: 'arraybuffer',
					format: 'png',
					success: (res1) => {
						const randomNum = Math.floor(Math.random() * 1000000);
						const f = `${Taro.env.USER_DATA_PATH}/gushiPoemCard_${randomNum}.png`;
						const fs = Taro.getFileSystemManager();
						fs.writeFileSync(f, res1.data, 'binary');
						Taro.saveImageToPhotosAlbum({
							filePath: f,
							success() {
								Taro.showToast({
									title: '保存成功',
								});
							},
							complete(res2) {
								console.log('saveImageToPhotosAlbum:', res2);
							},
						});
					},
					fail(res1) {
						console.log(res1);
					},
				});
			});
	};

	useLoad(() => {
	});

	usePullDownRefresh(() => {
		Taro.stopPullDownRefresh();
	});

	useShareAppMessage(() => {
		return {
			title: '古诗文小助手',
			path: '/pages/index',
		};
	});

	useShareTimeline(() => {
		return {
			title: '古诗文小助手',
			path: '/pages/index',
		};
	});

	return (
		<View className='page homePage'>
			<Snapshot mode='view' className='poemShot' id='poemCard'>
				<View className='poemCard'>
					<View className='container'>
						<View className='poem-context'>
							<View className='author-container'>
								<Text className='text'>{sentence.author}</Text>
							</View>
							<Navigator
								className='title-container'
								url={`/pages/poem/detail?id=${sentence.poem_id}`}
								hoverClass='none'
							>
								<Text className='text'>
									{sentence.poem_title || ''}
								</Text>
							</Navigator>
							<View className='poem'>
								{sentence.titleArr.map((text) => {
									return (
										<View className='poem-text' key={text}>
											<Text className='text'>{text}</Text>
										</View>
									);
								})}
							</View>
						</View>
					</View>
					<View className='bottom'>
						<View className='date'>
							<View className='yangli'>
								<Text className='text'>{date}</Text>
							</View>
							<View className='nongli'>
								<Text className='text'>甲辰龙年</Text>
							</View>
						</View>
						<View className='desc'>
							<Image
								src={xcxPng}
								showMenuByLongpress
								className='xcxImg'
							/>
						</View>
					</View>
				</View>
			</Snapshot>
			<View className='outShare'>
				<AtButton
					className='share-btn'
					type='primary'
					size='small'
					circle
					onClick={handleDownload}
				>
					保存图片
				</AtButton>
				<AtButton
					className='share-btn'
					type='secondary'
					size='small'
					circle
					openType='share'
				>
					收藏分享
				</AtButton>
			</View>
		</View>
	);
};

export default Index;
