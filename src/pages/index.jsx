import { View, Text, Snapshot, Image } from '@tarojs/components';
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
		name: 'blackBorder',
		color: '#212321',
	},
	{
		name: 'redBorder',
		color: '#c01112',
	},
];
// 背景色 fontColor
const bgColorArr = [
	{
		value: '#fff',
	},
	{
		value: 'rgba(14,14,15)',
		fontColor: '#fff',
	},
	{
		value: 'rgba(204,189,153)',
	},
	{
		value: 'rgba(247,215,174)',
	},
	{
		value: 'rgba(170,134,83)',
	},
	{
		value: '#6c9180',
		fontColor: '#fff',
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
		type: 'default',
		showQrcode: true,
		letterBorder: 'default', // redBorder blankBorder
		bgColor: '#fff',
		fontColor: '#333',
		ratio: 0.75, // 显示比例 3:4 9:16
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

	const selectBgColor = (e) => {
		const { color, fontColor } = e.currentTarget.dataset;
		updateConfig({
			...postConfig,
			bgColor: color || '#fff',
			fontColor: fontColor || '#333',
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
				{!isPc ? (
					<View className='share-btn share' onClick={handleShow}>
						<View className='at-icon at-icon-share'></View>
						<Text className='text'>分享</Text>
					</View>
				) : null}
				<View className='share-btn reload' onClick={handleReload}>
					<View className='at-icon at-icon-reload'></View>
					<Text className='text'>换一换</Text>
				</View>
			</View>
			{/* 画报 */}
			<Snapshot
				mode='view'
				className='poemShot'
				style={{
					height: `calc(100% - ${LeaveTop + MenuRect.height - 20}px)`,
					marginTop: '10px',
				}}
			>
				<View
					className='poemCard'
					style={{
						padding: 10,
						backgroundColor: postConfig.bgColor || '#fff',
						color: postConfig.fontColor || '#333',
					}}
				>
					<View className='container'>
						<PoemPostCard
							bgColor={postConfig.bgColor || '#fff'}
							sentence={sentence}
							width={safeArea.width - 40}
							type={postConfig.letterBorder}
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
							<Image
								src={xcxPng}
								showMenuByLongpress
								className='xcxImg'
							/>
						</View>
					</View>
				</View>
			</Snapshot>
			{/* 半屏展示全文 */}
			<View
				style={{
					visibility: isOpen ? 'visible' : 'hidden',
				}}
				className={`postFloatLayout ${isOpen ? 'active' : ''}`}
			>
				<view className='overlay' onClick={handleClose}></view>
				<View className='layoutContainer'>
					<View
						className='post-container'
						style={{
							padding: 12,
						}}
					>
						<Snapshot
							mode='view'
							className='poemShot'
							id='poemCard'
							style={{
								width: safeArea.width - 60,
								height: (safeArea.width - 60) / 0.75,
							}}
						>
							<View
								className='poemCard'
								style={{
									padding: 10,
									backgroundColor:
										postConfig.bgColor || '#fff',
									color: postConfig.fontColor || '#333',
								}}
							>
								<View className='container'>
									<PoemPostCard
										bgColor={postConfig.bgColor || '#fff'}
										sentence={sentence}
										width={safeArea.width - 40}
										type={postConfig.letterBorder}
										mini
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
											<Text className='text'>
												甲辰龙年
											</Text>
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
					{/* 布局 */}
					<View className='shareLayout'>
						<View className='title'>
							<Text className='text'>布局</Text>
						</View>
						<View
							className='scrollContainer'
						>
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
					</View>
					{/* 背景色 */}
					<View className='shareLayout'>
						<View className='title'>
							<Text className='text'>背景色</Text>
						</View>
						<View className='layout-bottom'>
							<View
								className='scrollContainer'
								style={{
									width: 'calc(100% - 50px)',
								}}
							>
								{bgColorArr.map((color) => {
									return (
										<View
											key={color.value}
											className={`color-item bgColor ${
												postConfig.bgColor ===
												color.value
													? 'active'
													: ''
											}`}
											style={{
												backgroundColor: color.value,
												width: 25,
												height: 25,
												padding: 4,
												marginRight: 10,
											}}
											data-color={color.value}
											data-fontColor={
												color.fontColor || ''
											}
											onClick={selectBgColor}
										></View>
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
										height: 20,
										width: 20,
									}}
								/>
							</View>
						</View>
					</View>
					{/* 底部按钮 */}
					<View className='shareBottom'>
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
