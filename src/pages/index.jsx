import { View, Text, Snapshot, Image } from '@tarojs/components';
import { useState, useEffect, useCallback } from 'react';
import { AtButton, AtFloatLayout } from 'taro-ui';
import Taro, {
	usePullDownRefresh,
	useShareAppMessage,
	useShareTimeline,
	useLoad,
} from '@tarojs/taro';

import xcxPng from '../images/xcx.jpg';
import Utils from '../utils/util';
import { fetchRandomSentence } from '../services/global';

import PoemPostCard from '../components/PoemPost';

import './index.scss';

// 拆分词句
const splitSentence = (sentence) => {
	// 替代特殊符号 。。
	let pattern = new RegExp('[。，.、;；!！?？]', 'g');
	sentence = sentence.replace(/，/g, ',');
	sentence = sentence.replace(pattern, ',');
	return sentence
		.split(',')
		.filter((item) => {
			return item;
		})
		.reverse();
};

const Index = () => {
	const [date] = useState(() => {
		return Utils.formatDate().join('/');
	});
	const [sentence, setSentence] = useState({
		titleArr: [],
	});
	const [isOpen, setOpen] = useState(false);
	const [safeArea, setSafeArea] = useState({
		width: 375,
	});
	const MenuRect = Taro.getMenuButtonBoundingClientRect();

	// const handleShow = () => {
	// 	setOpen(true);
	// };

	const handleClose = () => {
		setOpen(false);
	};

	const handleReload = () => {
		fetchSentence(true);
	};

	const fetchSentence = useCallback((forceGet = false) => {
		const [year, m, d] = Utils.formatDate();
		const currentDate = `${year}/${m}/${d}`;
		const localSentence = Taro.getStorageSync('home_senetnce');
		if (!forceGet && localSentence && localSentence.date == currentDate) {
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
		Taro.getSystemInfo().then((sysRes) => {
			setSafeArea(sysRes.safeArea || {});
		});
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
		<View
			className='page homePage'
			style={{
				padding: `${MenuRect.top || 0}px 10px 10px`,
			}}
		>
			<Snapshot
				mode='view'
				className='poemShot'
				id='poemCard'
				style={{
					height: `calc(100% - ${MenuRect.height + 15}px)`,
				}}
			>
				<View
					className='poemCard'
					style={{
						padding: 10,
					}}
				>
					<View className='container'>
						<PoemPostCard
							sentence={sentence}
							width={safeArea.width - 40}
							type='redBorder'
						/>
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
			<View
				className='topShare'
				style={{
					top: `${MenuRect.top}px`,
					height: (MenuRect.height || 32) + 'px',
				}}
			>
				<View className='share-btn share' onClick={handleDownload}>
					<View className='at-icon at-icon-share'></View>
					<Text className='text'>分享</Text>
				</View>
				<View className='share-btn reload' onClick={handleReload}>
					<View className='at-icon at-icon-reload'></View>
					<Text className='text'>换一换</Text>
				</View>
			</View>
			{/* 半屏展示全文 */}
			<AtFloatLayout isOpened={isOpen} onClose={handleClose}>
				<View className='shareContainer'>
					<View className='shareLayout'>布局</View>
					<View className='shareLayout'>颜色、二维码</View>
					<View className='shareBottom'>
						<AtButton
							className='share-btn'
							type='primary'
							size='small'
							circle
							onClick={handleDownload}
						>
							保存到相册
						</AtButton>
						<AtButton
							className='share-btn'
							type='secondary'
							size='small'
							circle
							openType='share'
						>
							分享给朋友
						</AtButton>
					</View>
				</View>
			</AtFloatLayout>
		</View>
	);
};

export default Index;
