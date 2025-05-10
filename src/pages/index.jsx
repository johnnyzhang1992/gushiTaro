import { View, Snapshot, Text, Image } from '@tarojs/components';
import { useState, useEffect, useCallback } from 'react';
import Taro, {
	useShareAppMessage,
	useShareTimeline,
	useLoad,
} from '@tarojs/taro';

import Layout from '../layout';
import FloatLayout from '../components/FloatLayout';
import PosterLayoutConfig from '../components/Poster/PosterLayoutConfig';
import PosterSnapshot from '../components/Poster/PosterSnapshot';
import FilterModal from '../components/FilterModal';

import Utils from '../utils/util';
import { fetchRandomSentence } from '../services/global';
import { initConfig } from '../const/posterConfig';

import searchSvg from '../images/svg/search.svg';

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
	const [queryParams, setQueryParams] = useState({
		author: '',
		theme: ''
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
		updateReload(true);
		fetchSentence(true);
	};

	const navigateToSearch = () => {
		Taro.navigateTo({
			url: '/pages/search/index',
		});
	};

	const fetchSentence = useCallback(
		(forceGet = false) => {
			const [year, m, d] = Utils.formatDate();
			const currentDate = `${year}/${m}/${d}`;
			const localSentence = Taro.getStorageSync('home_senetnce');
			if (!forceGet && localSentence && localSentence.date == currentDate) {
				const temSen = localSentence.data;
				setSentence({
					...temSen,
					poem_title: temSen.poem_title.split('/')[0],
					titleArr: temSen.titleArr || splitSentence(temSen.title),
				});
				return false;
			}
			fetchRandomSentence('GET', queryParams)
				.then((res) => {
					if (res && res.statusCode == 200) {
						const sentenceRes = res.data[0];
						const temSen = {
							...sentenceRes,
							poem_title: sentenceRes.poem_title.split('/')[0],
							titleArr: splitSentence(sentenceRes.title) || [],
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
		},
		[queryParams]
	);

	const updateQueryParams = (params) => {
		if(JSON.stringify(params) !== JSON.stringify(queryParams)) {
			setQueryParams({
				...queryParams,
				...params,
			});
		}
	}

	// useEffect(() => {
	// 	fetchSentence();
	// }, [fetchSentence]);

	useEffect(() => {
		console.log('queryParams:', queryParams);
		fetchSentence(true);
	}, [fetchSentence, queryParams]);

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

	useLoad(() => {
		Taro.getSystemInfo().then((sysRes) => {
			setSafeArea(sysRes.safeArea || {});
		});
		const localSentence = Taro.getStorageSync('home_senetnce') || {};
		const temSen = localSentence.data || null;
		if (localSentence && temSen) {
			setSentence({
				...temSen,
				poem_title: temSen.poem_title.split('/')[0],
				titleArr: temSen.titleArr || splitSentence(temSen.title),
			});
			return false;
		}
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

	return (
		<Layout>
			<View className='page homePage'>
				{/* 顶部操作栏 */}
				<View
					className='topShare'
					style={{
						paddingTop: `${LeaveTop}px`,
					}}
				>
					<View
						className='search'
						onClick={navigateToSearch}
						style={{
							height: (MenuRect.height || 32) + 'px',
						}}
					>
						<Image src={searchSvg} className='icon' mode='widthFix' />
					</View>
					<FilterModal handleSelect={updateQueryParams} />
				</View>
				{/* 画报 */}
				<View
					className='post-container'
					style={{
						padding: `10px 10px`,
					}}
				>
					<Snapshot
						mode='view'
						className='poemShot'
						id='poemCard'
						style={{
							width: contentWidth * 0.9,
							height: contentHeight * 0.85,
						}}
					>
						<PosterSnapshot
							isReload={isReload}
							safeArea={safeArea}
							sentence={sentence}
							posterConfig={posterConfig}
						/>
					</Snapshot>
					<View className='post-bottom'>
						<View
							className={`share-btn reload ${isReload ? 'active' : ''}`}
							onClick={handleReload}
						>
							<View className='at-icon at-icon-reload'></View>
							<Text className='text'>换一换</Text>
						</View>
						<View className='share-btn share' onClick={handleShow}>
							<View className='at-icon at-icon-share-2'></View>
							<Text className='text'>分享</Text>
						</View>
					</View>
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
