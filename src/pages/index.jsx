import { View, Snapshot } from '@tarojs/components';
import { useState, useEffect, useCallback } from 'react';
import Taro, {
	useShareAppMessage,
	useShareTimeline,
	useLoad,
	useUnload,
	Events,
} from '@tarojs/taro';

import Layout from '../layout';
import FloatLayout from '../components/FloatLayout';
import PosterLayoutConfig from '../components/Poster/PosterLayoutConfig';
import PosterSnapshot from '../components/Poster/PosterSnapshot';

import Utils from '../utils/util';
import { fetchRandomSentence } from '../services/global';
import { FontFaceList } from '../const/config';
import { initConfig } from '../const/posterConfig';

import './index.scss';

const events = new Events();

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
let timer = null;

const Index = () => {
	const [sentence, setSentence] = useState({
		titleArr: [],
	});
	const [isOpen, setOpen] = useState(false);
	const [safeArea, setSafeArea] = useState({
		width: 375,
	});
	const [posterConfig, updateConfig] = useState({
		...initConfig,
	});
	const [isReload, updateReload] = useState(false);
	const MenuRect = Taro.getMenuButtonBoundingClientRect();
	const deviceInfo = Taro.getDeviceInfo();

	const handleShow = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleReload = () => {
		updateReload(true);
		fetchSentence(true);
	};

	const navigateToSearch = () => {
		Taro.navigateTo({
			url: '/pages/search/index',
		});
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
					timer = setTimeout(() => {
						updateReload(false);
						setSentence(temSen);
						Taro.setStorageSync('home_senetnce', {
							date: currentDate,
							data: temSen,
						});
						clearTimeout(timer);
					}, 800);
				} else {
					updateReload(false);
				}
			})
			.catch((err) => {
				console.log(err);
				updateReload(false);
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
									icon: 'success',
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
						Taro.showToast({
							icon: 'error',
							title: '保存失败',
						});
					},
				});
			});
	};

	const handleGlobalFontLoad = () => {
		console.log('---字体加载成功通知');
		updateConfig({
			...posterConfig,
		});
	};

	useLoad(() => {
		Taro.getSystemInfo().then((sysRes) => {
			setSafeArea(sysRes.safeArea || {});
		});
		events.on('loadFont', handleGlobalFontLoad);
	});

	useUnload(() => {
		events.off('loadFont', handleGlobalFontLoad);
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

	// PC端样式比较特殊，且不支持图片导出
	const isPc = ['mac', 'windows'].includes(deviceInfo.platform);
	const LeaveTop = isPc ? 10 : MenuRect.top;
	// 根据设置的图片比例和实际的屏幕视图大小来计算最终的画报尺寸
	let contentWidth = safeArea.width * 0.9;
	const maxHeight = safeArea.height - LeaveTop - MenuRect.height - 60;
	if (maxHeight < contentWidth / posterConfig.ratio) {
		contentWidth = maxHeight * posterConfig.ratio;
	}
	const contentHeight =
		posterConfig.ratio === 1
			? safeArea.height - LeaveTop - MenuRect.height - 60
			: contentWidth / posterConfig.ratio;
	if (posterConfig.ratio === 1) {
		contentWidth = safeArea.width - 30;
	}

	// 自定义字体
	const currentFont = FontFaceList.find((font) => {
		return font.extra_name === Taro.getStorageSync('fontName');
	});

	return (
		<Layout>
			<View
				className={`page homePage ${currentFont && currentFont.name}`}
				style={{
					padding: `10px 10px`,
				}}
			>
				{/* 顶部操作栏 */}
				<View
					className='topShare'
					style={{
						marginTop: `${LeaveTop - 10}px`,
						height: (MenuRect.height || 32) + 'px',
						paddingLeft: '10px',
						// transform: `translateY(${isPc ? 0 : 5}px)`,
					}}
				>
					<View className='share-btn share' onClick={handleShow}>
						<View className='at-icon at-icon-share-2'></View>
						{/* <Text className='text'>分享</Text> */}
					</View>
					<View
						className={`share-btn reload ${isReload ? 'active' : ''}`}
						onClick={handleReload}
					>
						<View className='at-icon at-icon-reload'></View>
						{/* <Text className='text'>换一换</Text> */}
					</View>
					<View className='share-btn share' onClick={navigateToSearch}>
						<View className='at-icon at-icon-search'></View>
					</View>
				</View>
				{/* 画报 */}
				<View className='post-container'>
					<Snapshot
						mode='view'
						className='poemShot'
						id='poemCard'
						style={{
							width: contentWidth,
							height: contentHeight,
						}}
					>
						<PosterSnapshot
							isReload={isReload}
							safeArea={safeArea}
							sentence={sentence}
							posterConfig={posterConfig}
						/>
					</Snapshot>
				</View>
				{/* 半屏展示全文 */}
				<FloatLayout
					showTitle={false}
					isOpen={isOpen}
					close={handleClose}
					className='postFloatLayout'
					style={{
						visibility: isOpen ? 'visible' : 'hidden',
					}}
				>
					<PosterLayoutConfig
						safeArea={safeArea}
						isPc={isPc}
						isTab
						update={updateConfig}
						handleDownload={handleDownload}
					/>
				</FloatLayout>
			</View>
		</Layout>
	);
};

export default Index;
