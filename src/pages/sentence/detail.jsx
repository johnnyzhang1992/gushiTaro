import { View, Text, Image, Snapshot, ScrollView } from '@tarojs/components';
import { useState, useRef } from 'react';
import Taro, {
	useLoad,
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

import shareSvg from '../../images/svg/share_blue.svg';
import returnSvg from '../../images/svg/return_dark.svg';
import homeSvg from '../../images/svg/home_dark.svg';
import copyPng from '../../images/svg/copy_blue.svg';

import './style.scss';

/** 屏内画报预览缩放比：导出仍走离屏全尺寸，分享图像素不受影响 */
const POSTER_SCALE = 0.75;

// 解析 origin 字段，拆分作者和标题
const parseOrigin = (origin) => {
	if (!origin) return { author: '', title: '' };

	// 匹配 "《书名·篇章》" 整体出处（古籍摘录），不含作者
	const match0 = origin.match(/^《(.+)》$/);
	if (match0) {
		return { author: '', title: match0[1] };
	}

	// 匹配 "作者《标题》" 格式
	const match1 = origin.match(/^(.+?)《(.+?)》$/);
	if (match1) {
		return { author: match1[1], title: match1[2] };
	}
	
	// 匹配 "作者·标题" 格式
	const match2 = origin.match(/^(.+?)·(.+)$/);
	if (match2) {
		return { author: match2[1], title: match2[2] };
	}
	
	// 无法解析，返回原文
	return { author: '', title: origin };
};

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
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const fetchDetail = (id) => {
		const sId = id || catchRef.current.id;
		setLoading(true);
		setError('');
		return fetchSentenceDetail('GET', {
			id: sId,
		})
			.then((res) => {
				const apiData = res.data?.data || res.data;
				if ((res.status || res.statusCode === 200) && apiData) {
					// 兼容新旧格式
					const sentenceData = apiData.sentence || apiData;
					const authorData = apiData.author || {};
					const poemData = apiData.poem || {};
					// 解析 origin 字段
					const originInfo = parseOrigin(sentenceData.origin || '');
					const fullTitle = originInfo.title || (poemData.title || '').split('/')[0];
					setDetail({
						author: authorData,
						poem: poemData,
						sentence: {
							...sentenceData,
							author: originInfo.author || poemData.author || sentenceData.author,
							poem_id: poemData.id || sentenceData.target_id,
							dynasty: poemData.dynasty || '',
							poem_title: fullTitle,
							poem_title_full: fullTitle,
							titleArr: splitSentence(sentenceData.title || ''),
						},
					});
					const { title } = sentenceData || {};
					Taro.setNavigationBarTitle({
						title: title,
					});
				} else {
					setError('名句内容不存在或已下架');
				}
			})
			.catch(() => {
				setError('名句加载失败，点击重试');
			})
			.finally(() => {
				setLoading(false);
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
				const node = res[0] && res[0].node;
				if (!node) {
					Taro.showToast({ icon: 'error', title: '保存失败' });
					return;
				}
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
							icon: 'none',
							title: '保存失败：' + ((res1 && res1.errMsg) || '未知错误'),
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

	const goPoem = () => {
		if (detail.sentence.poem_id) {
			Taro.navigateTo({ url: `/pages/poem/detail?id=${detail.sentence.poem_id}` });
		}
	};

	const goAuthor = () => {
		const authorId = detail.author?.id || detail.sentence.author_id;
		if (authorId > 0) {
			Taro.navigateTo({ url: `/pages/poet/detail?id=${authorId}` });
		}
	};

	useLoad((options) => {
		console.log('sentence--Detail:', options);
		const { id, scene } = options || {};
		let sentenceId = id;
		if (scene) {
			// scene（分享进入）无值时兜底回 id，仍无值按无效处理
			sentenceId = decodeURIComponent(options.scene).split('=')[1] || id;
		}
		catchRef.current = { ...options, id: sentenceId };
		if (!sentenceId) {
			Taro.showToast({
				title: '内容不存在或已下架',
				icon: 'none',
			});
			Taro.switchTab({
				url: '/pages/index',
			});
			return;
		}
		fetchDetail(sentenceId);
		setHList([...Taro.getCurrentPages()]);
	});
	useShareAppMessage(() => {
		const { sentence } = detail;
		return {
			title: sentence.title || '名句',
			path: '/pages/sentence/detail?id=' + (sentence.id || catchRef.current.id),
		};
	});

	useShareTimeline(() => {
		const { sentence } = detail;
		return {
			title: sentence.title || '名句',
			path: '/pages/sentence/detail?id=' + (sentence.id || catchRef.current.id),
		};
	});

	const MenuRect = Taro.getMenuButtonBoundingClientRect();
	const deviceInfo = Taro.getDeviceInfo();
	const systemInfo = Taro.getSystemInfoSync();
	const safeArea = systemInfo.safeArea;
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

	const authorId = detail.author?.id || detail.sentence.author_id;
	const hasAuthor = authorId > 0;
	// 原文：接口 content 即全文；与名句本身相同（古籍摘录）时不重复展示
	const normText = (s) => (s || '').replace(/[\s。，、；！？,.:;!?()（）]/g, '');
	const titleNorm = normText(detail.sentence.title);
	const originLines = (() => {
		// 接口 content 存的是字面 \n 转义串，先还原真实换行
		let raw = (detail.sentence.content || '').replace(/\\r/g, '').replace(/\\n/g, '\n').trim();
		if (!raw || normText(raw) === titleNorm) return [];
		// 校勘注（如「(肠断 一作：断肠)」）单独成行弱化展示
		let variant = '';
		const vm = raw.match(/[(（][^()（）]*一作[^()（）]*[)）]\s*$/);
		if (vm) {
			variant = vm[0].trim();
			raw = raw.slice(0, vm.index).trim();
		}
		const lines = [];
		raw.split(/\n+/).forEach((seg) => {
			(seg.match(/[^。！？]+[。！？]?/g) || []).forEach((s) => {
				const text = s.trim();
				if (text) lines.push({ text, variant: false, hit: false });
			});
		});
		if (variant) lines.push({ text: variant, variant: true, hit: false });
		return lines.map((ln) => ({
			...ln,
			hit:
				!ln.variant &&
				!!titleNorm &&
				(normText(ln.text).includes(titleNorm) || titleNorm.includes(normText(ln.text))),
		}));
	})();
	// 竖排落款防溢出：超出画报可用高度时截断，完整题名在出处卡展示
	const maxTitleChars = Math.max(6, Math.floor((contentHeight - 40) / 12));
	const posterSentence =
		detail.sentence.poem_title && detail.sentence.poem_title.length > maxTitleChars
			? {
					...detail.sentence,
					poem_title: detail.sentence.poem_title.slice(0, maxTitleChars - 1) + '…',
			  }
			: detail.sentence;

	// 导航实际占高（paddingTop + marginTop + 容器高），scroll-view 占剩余视口
	const navTotal = (isPc ? LeaveTop : 0) + (LeaveTop - 10) + (MenuRect.height || 32) + 20;
	const scrollHeight = systemInfo.windowHeight - navTotal;
	// 滚动内容底部预留 home 指示条安全区 + 呼吸留白
	const safeBottom = Math.max(
		0,
		systemInfo.screenHeight - (systemInfo.safeArea ? systemInfo.safeArea.bottom : systemInfo.screenHeight)
	);
	const bodyPadBottom = safeBottom + 24;

	return (
		<Layout>
			<View className='page sentenceDetail' style={{ height: systemInfo.windowHeight }}>
				{/* 顶部操作栏 */}
				{/* pc不支持自定义导航栏 */}
				<View
					className='topNavbar'
					style={{
						paddingTop: `${isPc ? LeaveTop : 0}px`,
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
				<ScrollView
					scrollY
					enhanced
					className='detailScroll'
					style={{ height: scrollHeight }}
					showScrollbar={false}
				>
				{loading ? (
					<View className='stateTip'>加载中...</View>
				) : error ? (
					<View className='stateTip'>
						<Text className='stateTipText'>{error}</Text>
						{error === '名句加载失败，点击重试' ? (
							<View className='retryBtn' onClick={() => fetchDetail()}>
								<Text className='retryBtnText'>重新加载</Text>
							</View>
						) : null}
					</View>
				) : (
					<View className='detailBody' style={{ paddingBottom: bodyPadBottom }}>
						<View className='post-container'>
							{/* 屏内预览按 POSTER_SCALE 缩放占位；导出走离屏全尺寸 snapshot，保证分享图像素不变 */}
							<View
								className='postScale'
								style={{ width: contentWidth * POSTER_SCALE, height: contentHeight * POSTER_SCALE }}
							>
								<View
									style={{
										width: contentWidth,
										height: contentHeight,
										transform: `scale(${POSTER_SCALE})`,
										transformOrigin: 'top left',
									}}
								>
									<Snapshot
										mode='view'
										className='poemShot'
										id='poemCardPreview'
										style={{
											width: contentWidth,
											height: contentHeight,
										}}
									>
										<PosterSnapshot
											safeArea={safeArea}
											sentence={posterSentence}
											posterConfig={posterConfig}
											showDate={false}
										/>
									</Snapshot>
								</View>
							</View>
						</View>
						{/* 离屏全尺寸画报：仅供 takeSnapshot 导出，不可 display:none/visibility:hidden */}
						<View
							className='postExport'
							style={{ width: contentWidth, height: contentHeight }}
						>
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
									sentence={posterSentence}
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
									status={detail.sentence.is_liked || detail.sentence.like_status}
									showText
								/>
							</View>
							<View className='btnItem'>
								<CollectButton
									type='sentence'
									id={detail.sentence.id}
									count={detail.sentence.collect_count}
									status={detail.sentence.is_favorited || detail.sentence.collect_status}
									showText
								/>
							</View>
						</View>
						{/* 出处与作者 */}
						<View className='sourceCard'>
							<View className='sourceHead'>
								<Text className='sourceLabel'>出处</Text>
								{detail.sentence.dynasty ? (
									<Text className='sourceDynasty'>{detail.sentence.dynasty}</Text>
								) : null}
							</View>
							<Text className='sourceTitle'>
								{detail.sentence.poem_title_full ||
									detail.sentence.poem_title ||
									detail.sentence.origin ||
									'佚名'}
							</Text>
							{detail.sentence.author ? (
								<Text className='sourceAuthor'>{detail.sentence.author}</Text>
							) : null}
							{originLines.length ? (
								<View className='sourceOrigin'>
									<Text className='sourceOriginLabel'>原文</Text>
									{originLines.map((ln, i) => (
										<Text
											key={`${i}_${ln.text}`}
											className={`sourceLine ${ln.hit ? 'hit' : ''} ${ln.variant ? 'variant' : ''}`}
										>
											{ln.text}
										</Text>
									))}
								</View>
							) : null}
							{detail.sentence.poem_id || hasAuthor ? (
								<View className='sourceLinks'>
									{detail.sentence.poem_id ? (
										<View className='sourceLinkTap' onClick={goPoem}>
											<View className='sourceLink'>
												<Text className='sourceLinkText'>查看全文</Text>
												<View className='sourceLinkArrow' />
											</View>
										</View>
									) : null}
									{hasAuthor ? (
										<View className='sourceLinkTap' onClick={goAuthor}>
											<View className='sourceLink'>
												<Text className='sourceLinkText'>诗人主页</Text>
												<View className='sourceLinkArrow' />
											</View>
										</View>
									) : null}
								</View>
							) : (
								<Text className='sourceNote'>
									来源：{detail.sentence.source || '古籍摘录'}
								</Text>
							)}
						</View>
					</View>
				)}
				</ScrollView>
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
