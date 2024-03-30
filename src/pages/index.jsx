import { View, Text, Snapshot, Image, ScrollView } from '@tarojs/components';
import { useState, useEffect, useCallback } from 'react';
import { AtButton } from 'taro-ui';
import Taro, {
	usePullDownRefresh,
	useShareAppMessage,
	useShareTimeline,
	useLoad,
} from '@tarojs/taro';

import xcxPng from '../images/xcx.jpg';
import Qrcode from '../images/icon/qrcode.png';
import Utils from '../utils/util';
import { fetchRandomSentence } from '../services/global';
import { postBgImages } from '../const/config';

import PoemPostCard from '../components/PoemPost';
import PoemPostLayout from '../components/Skeleton/PoemPostLayout';

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

// 边框颜色配置
const letterLayoutConfig = [
	{
		name: 'default',
		color: '#333',
	},
	{
		name: 'center',
		color: '#333',
	},
	{
		name: 'blackBorder',
		color: '#212321',
	},
	{
		name: 'redBorder',
		color: '#c01112',
	},
];
// 背景色 fontColor
// const bgColorArr = [
// 	{
// 		value: '#fff',
// 	},
// 	{
// 		value: 'rgba(14,14,15)',
// 		fontColor: '#fff',
// 	},
// 	{
// 		value: 'rgba(204,189,153)',
// 	},
// 	{
// 		value: 'rgba(247,215,174)',
// 	},
// 	{
// 		value: 'rgba(170,134,83)',
// 	},
// 	{
// 		value: '#6c9180',
// 		fontColor: '#fff',
// 	},
// ];
// 字体颜色
const fontColorArr = ['#fff', '#333'];
// 模式
const ratioConfig = [
	{
		name: '默认',
		value: 1,
	},
	{
		name: '小红书',
		value: 0.75,
	},
	{
		name: '手机壁纸',
		value: 0.4615,
	},
];
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
	const MenuRect = Taro.getMenuButtonBoundingClientRect();
	const deviceInfo = Taro.getDeviceInfo();

	const handleShow = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleReload = () => {
		fetchSentence(true);
	};

	const handleToggleBottom = () => {
		updateConfig({
			...postConfig,
			showQrcode: !postConfig.showQrcode,
		});
	};

	const updateLayout = ({ type, letterBorder }) => {
		updateConfig({
			...postConfig,
			type: type,
			letterBorder: letterBorder || '',
		});
	};

	const selectFontColor = (e) => {
		const { fontColor } = e.currentTarget.dataset;
		updateConfig({
			...postConfig,
			fontColor: fontColor || '#333',
		});
	};
	const selectBgImg = (e) => {
		const { img } = e.currentTarget.dataset;
		updateConfig({
			...postConfig,
			bgImg: img,
		});
	};

	const selecrRatio = (e) => {
		const { ratio } = e.currentTarget.dataset;
		updateConfig({
			...postConfig,
			ratio: ratio || 0.75,
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

	const isPc = ['mac', 'windows'].includes(deviceInfo.platform);
	const LeaveTop = isPc ? 10 : MenuRect.top;
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

	return (
		<View
			className='page homePage'
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
					<View className='at-icon at-icon-share'></View>
					<Text className='text'>分享</Text>
				</View>
				<View className='share-btn reload' onClick={handleReload}>
					<View className='at-icon at-icon-reload'></View>
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
								display: postConfig.showQrcode
									? 'flex'
									: 'none',
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
								<Image
									src={xcxPng}
									showMenuByLongpress
									className='xcxImg'
								/>
							</View>
						</View>
					</View>
				</Snapshot>
			</View>
			{/* 半屏展示全文 */}
			<View
				style={{
					visibility: isOpen ? 'visible' : 'hidden',
				}}
				className={`postFloatLayout ${isOpen ? 'active' : ''}`}
			>
				<view className='overlay' onClick={handleClose}></view>
				<View className='layoutContainer'>
					{/* 布局 */}
					<View className='shareLayout'>
						<View className='title'>
							<Text className='text'>布局</Text>
						</View>
						<View className='layout-bottom'>
							<View className='scrollContainer'>
								{letterLayoutConfig.map((layout) => {
									return (
										<PoemPostLayout
											type={layout.name}
											key={layout.name}
											style={{
												width: 30,
												height: 40,
												marginRight: 10,
												borderColor: layout.color,
											}}
											borderColor={layout.color}
											letterBorder={layout.name}
											update={updateLayout}
											activeType={postConfig.letterBorder}
										/>
									);
								})}
							</View>
							<View
								className={`qrcode-container  ${
									postConfig.showQrcode ? 'active' : ''
								}`}
								onClick={handleToggleBottom}
							>
								<Image
									src={Qrcode}
									className='qrcode'
									style={{
										height: 25,
										width: 25,
									}}
								/>
							</View>
						</View>
					</View>
					{/* 模式，小红书和壁纸 */}
					<View className='shareLayout'>
						<View className='title'>
							<Text className='text'>展示模式</Text>
						</View>
						<View className='scrollContainer ratio-list'>
							{ratioConfig.map((ratio) => {
								return (
									<View
										key={ratio.value}
										data-ratio={ratio.value}
										onClick={selecrRatio}
										className={`ratio-item ${
											postConfig.ratio == ratio.value
												? 'active'
												: ''
										}`}
									>
										{ratio.name}
									</View>
								);
							})}
						</View>
					</View>
					{/* 字体颜色 */}
					<View className='shareLayout'>
						<View className='title'>
							<Text className='text'>字体颜色</Text>
						</View>
						<View className='layout-bottom'>
							<View
								className='scrollContainer'
								style={{
									width: '100%',
								}}
							>
								{fontColorArr.map((color) => {
									return (
										<View
											key={color}
											className={`color-item bgColor ${
												postConfig.fontColor === color
													? 'active'
													: ''
											}`}
											style={{
												backgroundColor: color,
												width: 30,
												height: 30,
												padding: 4,
												marginRight: 10,
											}}
											data-fontColor={color || ''}
											onClick={selectFontColor}
										></View>
									);
								})}
							</View>
						</View>
					</View>
					{/* 背景图 */}
					<View className='shareLayout'>
						<View className='title'>
							<Text className='text'>背景色</Text>
						</View>
						<View className='layout-bottom'>
							<ScrollView
								scrollX
								enableFlex
								enhanced
								showScrollbar={false}
								className='scrollContainer bgImgList'
								style={{
									height: 44,
									width: safeArea.width - 30,
								}}
							>
								{postBgImages.map((img) => {
									return (
										<View
											key={img}
											className={`color-item bgImg ${
												postConfig.bgImg === img
													? 'active'
													: ''
											}`}
											style={{
												width: 30,
												height: 30,
												marginRight: 8,
											}}
											data-img={img}
											onClick={selectBgImg}
										>
											<Image
												src={img}
												mode='widthFix'
												className='bg-img'
												style={{
													width: 30,
													height: 30,
												}}
											/>
										</View>
									);
								})}
							</ScrollView>
						</View>
					</View>
					{/* 底部按钮 */}
					<View className='shareBottom'>
						{!isPc ? (
							<AtButton
								className='share-btn'
								type='primary'
								size='small'
								circle
								onClick={handleDownload}
							>
								<View className='at-icon at-icon-download'></View>
								<Text>保存</Text>
							</AtButton>
						) : null}
						<AtButton
							className='share-btn'
							type='secondary'
							size='small'
							circle
							openType='share'
						>
							<View className='at-icon at-icon-share'></View>
							<Text>分享</Text>
						</AtButton>
					</View>
				</View>
			</View>
		</View>
	);
};

export default Index;
