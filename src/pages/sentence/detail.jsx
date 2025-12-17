import { View, Text, Image, Snapshot } from '@tarojs/components';
import { useState, useRef } from 'react';
import Taro, {
	useLoad,
	usePullDownRefresh,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';

import Layout from '../../layout';
import FloatLayout from '../../components/FloatLayout';
import PosterLayoutConfig from '../../components/Poster/PosterLayoutConfig';
import PosterSnapshot from '../../components/Poster/PosterSnapshot';
import LikeButton from '../../components/LikeButton';
import CollectButton from '../../components/CollectButton';

import { fetchSentenceDetail } from './service';
import { initConfig } from '../../const/posterConfig';

import shareSvg from '../../images/svg/share.svg';
import returnSvg from '../../images/svg/return.svg';
import homeSvg from '../../images/svg/home.svg';
import copyPng from '../../images/svg/copy.svg';

import './style.scss';

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
const SentenceDetail = () => {
	const catchRef = useRef({});
	const [isOpen, setOpen] = useState(false);
	const [detail, setDetail] = useState({
		poem: {
			dynasty: '',
			author: '',
		},
		author: {},
		sentence: {
			title: '',
			titleArr: [],
			like_count: 0,
			collect_count: 0,
			collect_status: false,
			like_status: false,
			author: '',
			poem_id: '',
			dynasty: '',
			poem_title: '',
		},
	});
	const [posterConfig, updateConfig] = useState({
		...initConfig,
	});
	const [historyList, setHList] = useState([]);

	const fetchDetail = (id) => {
		const sId = id || catchRef.id;
		fetchSentenceDetail('GET', {
			id: sId,
		}).then((res) => {
			if (res && res.statusCode === 200) {
				const { sentence = {}, author = {}, poem = {} } = res.data;
				setDetail({
					author: author || {},
					poem,
					sentence: {
						...sentence,
						author: poem.author,
						poem_id: poem.id,
						dynasty: poem.dynasty,
						poem_title: poem.title.split('/')[0],
						titleArr: splitSentence(sentence.title || ''),
					},
				});
				const { title } = sentence || {};
				Taro.setNavigationBarTitle({
					title: title,
				});
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

	const handleShow = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleNavigateBack = () => {
		if (historyList.length > 1) {
			Taro.navigateBack();
		} else {
			Taro.switchTab({
				url: '/pages/index',
			});
		}
	};

	useLoad((options) => {
		console.log('sentence--Detail:', options);
		const { id, scene } = options || {};
		let sentenceId = id;
		if (scene) {
			sentenceId = decodeURIComponent(options.scene).split('=')[1];
		}
		catchRef.current = { ...options, id: sentenceId };
		fetchDetail(sentenceId);
		setHList([...Taro.getCurrentPages()]);
	});
	usePullDownRefresh(() => {
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

	const MenuRect = Taro.getMenuButtonBoundingClientRect();
	const deviceInfo = Taro.getDeviceInfo();
	const safeArea = Taro.getSystemInfoSync().safeArea;
	// PC端样式比较特殊，且不支持图片导出
	const isPc = ['mac', 'windows'].includes(deviceInfo.platform);
	const LeaveTop = isPc ? 10 : MenuRect.top;
	// 根据设置的图片比例和实际的屏幕视图大小来计算最终的画报尺寸
	let contentWidth = safeArea.width * 0.9;
	const maxHeight = safeArea.height - LeaveTop - MenuRect.height - 20;
	if (maxHeight < contentWidth / posterConfig.ratio) {
		contentWidth = maxHeight * posterConfig.ratio;
	}
	const contentHeight =
		posterConfig.ratio === 1
			? safeArea.height - LeaveTop - MenuRect.height - 40
			: contentWidth / posterConfig.ratio;
	if (posterConfig.ratio === 1) {
		contentWidth = safeArea.width - 30;
	}
	const titleWidth = (safeArea.width / 2 - MenuRect.width - 15) * 2;

	return (
		<Layout>
			<View className='page sentenceDetail'>
				{/* 顶部操作栏 */}
				{/* pc不支持自定义导航栏 */}
				<View
					className='topNavbar'
					style={{
						display: isPc ? 'none' : 'block',
					}}
				>
					<View
						className='topNavbar-container'
						style={{
							marginTop: `${LeaveTop - 10}px`,
							height: (MenuRect.height || 32) + 20 + 'px',
							paddingLeft: 15,
						}}
					>
						<View className='share-btn return' onClick={handleNavigateBack}>
							<Image
								src={historyList.length > 1 ? returnSvg : homeSvg}
								mode='widthFix'
								className='icon'
							/>
						</View>
						<View
							className='title'
							style={{
								width: titleWidth,
							}}
						>
							{detail.sentence.title}
						</View>
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
							safeArea={safeArea}
							sentence={detail.sentence}
							posterConfig={posterConfig}
							showDate={false}
						/>
					</Snapshot>
				</View>
				{/* 按钮区域 */}
				<View className='top-btns'>
					<View className='btnItem share-btn share' onClick={handleShow}>
						<Image src={shareSvg} mode='widthFix' className='icon' />
						<Text className='text'>分享</Text>
					</View>
					<View className='btnItem share-btn' onClick={handlecopy}>
						<Image src={copyPng} className='icon copy' />
						<Text className='text'>复制</Text>
					</View>
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
						update={updateConfig}
						handleDownload={handleDownload}
					/>
				</FloatLayout>
			</View>
		</Layout>
	);
};

export default SentenceDetail;
