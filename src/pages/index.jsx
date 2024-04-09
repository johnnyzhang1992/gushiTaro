import { View, Text, Snapshot, Image } from '@tarojs/components';
import { useState, useEffect, useCallback } from 'react';
import Taro, {
	useShareAppMessage,
	useShareTimeline,
	useLoad,
	useUnload,
	Events,
} from '@tarojs/taro';

import Layout from '../layout';
import PoemPostCard from '../components/PoemPost';
import FloatLayout from '../components/FloatLayout';
import PostLayoutConfig from '../components/PostLayoutConfig';

import xcxPng from '../images/xcx.jpg';
import shareSvg from '../images/svg/share.svg';
import refreshSvg from '../images/svg/refresh.svg';
import Utils from '../utils/util';
import { fetchRandomSentence } from '../services/global';
import { postBgImages, FontFaceList } from '../const/config';
import LoadLocalFont from '../utils/loadFont';

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
	const [postConfig, updateConfig] = useState({
		type: 'default', // default center letter horiv
		showQrcode: true,
		letterBorder: 'default', // redBorder blankBorder
		bgColor: '#fff',
		bgImg: postBgImages[0], // 背景图
		fontColor: '#333',
		ratio: 1, // 显示比例 0.75 0.46
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
				updateReload(false);
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
			...postConfig,
		});
	};

	useLoad(() => {
		Taro.getSystemInfo().then((sysRes) => {
			setSafeArea(sysRes.safeArea || {});
		});
		LoadLocalFont(false, handleGlobalFontLoad);
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
	if (maxHeight < contentWidth / postConfig.ratio) {
		contentWidth = maxHeight * postConfig.ratio;
	}
	const contentHeight =
		postConfig.ratio === 1
			? safeArea.height - LeaveTop - MenuRect.height - 60
			: contentWidth / postConfig.ratio;
	if (postConfig.ratio === 1) {
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
						transform: `translateY(${isPc ? 0 : 5}px)`,
					}}
				>
					<View className='share-btn share' onClick={handleShow}>
						{/* <View className='at-icon at-icon-share'></View> */}
						<Image src={shareSvg} mode='widthFix' className='icon' />
						<Text className='text'>分享</Text>
					</View>
					<View
						className={`share-btn reload ${isReload ? 'active' : ''}`}
						onClick={handleReload}
					>
						{/* <View className='at-icon at-icon-reload'></View> */}
						<Image src={refreshSvg} mode='widthFix' className={`icon `} />
						<Text className='text'>换一换</Text>
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
						<View
							className='poemCard'
							style={{
								padding: 10,
								backgroundColor: postConfig.bgColor || '#fff',
								color: postConfig.fontColor || '#333',
								backgroundImage: postConfig.bgImg
									? `url(${postConfig.bgImg})`
									: 'unset',
							}}
						>
							<View className='container'>
								<PoemPostCard
									bgColor={postConfig.bgColor || '#fff'}
									sentence={sentence}
									fontColor={postConfig.fontColor}
									width={safeArea.width - 40}
									type={postConfig.letterBorder}
									mode={postConfig.ratio === 0.75 ? 'post' : 'bg'}
								/>
							</View>
							<View
								className='bottom'
								style={{
									display: postConfig.showQrcode ? 'flex' : 'none',
								}}
							>
								<View className='date'>
									<View className='yangli'>
										<Text className='text'>{date}</Text>
									</View>
									<View className='nongli'>
										<Text className='text'>甲辰龙年</Text>
									</View>
								</View>
								<View className='desc'>
									<Image src={xcxPng} showMenuByLongpress className='xcxImg' />
								</View>
							</View>
						</View>
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
					<PostLayoutConfig
						safeArea={safeArea}
						isPc={isPc}
						update={updateConfig}
						handleDownload={handleDownload}
					/>
				</FloatLayout>
			</View>
		</Layout>
	);
};

export default Index;
