import {
	PageContainer,
	View,
	Text,
	Image,
	Navigator,
	ScrollView,
} from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useEffect, useState, useRef } from 'react';

import FloatLayout from '../FloatLayout';
import AudioProgress from './AudioProgress';
import AudioMini from './AudioMini';
import AudioWords from './AudioWords';

import {
	getPoemList,
	poemAudioUpdate,
	initPoem,
	updateCurrentPoem,
	getCurrentPoem,
} from './util';
import Utils from '../../utils/util';
import { fetchPoemAudio, fetchPoemPinyin } from '../../services/global';

import './style.scss';

import playSvg from '../../images/svg/audio/play.svg';
import pauseSvg from '../../images/svg/audio/pause.svg';
import listSvg from '../../images/svg/audio/list.svg';
import preSvg from '../../images/svg/audio/pre.svg';
import nextSvg from '../../images/svg/audio/next.svg';
import listLoopSvg from '../../images/svg/audio/list_loop.svg';
import oneLoopSvg from '../../images/svg/audio/one_loop.svg';
import randomLoopSvg from '../../images/svg/audio/random_loop.svg';
import settingSvg from '../../images/svg/audio/setting.svg';
import pinyinSvg from '../../images/svg/pinyin_black.svg';
import pinyinActiveSvg from '../../images/svg/pinyin.svg';
import closeSvg from '../../images/svg/audio/close.svg';

import AudioList from './AudioList';

// 参数放外面，多个页面引入该组件，内容可共享
let poemList = [];
let currentPoem = { ...initPoem };
let audioPlayer = null; // 音频播放器

const loopList = [
	{
		label: '列表循环',
		name: 'list',
		svg: listLoopSvg,
		next: 1,
	},
	{
		label: '单曲循环',
		name: 'one',
		svg: oneLoopSvg,
		next: 2,
	},
	{
		label: '随机循环',
		name: 'random',
		svg: randomLoopSvg,
		next: 0,
	},
];
const tabPages = ['pages/index', 'pages/find/index', 'pages/me/index'];
const GushiAudio = ({ close, show }) => {
	// 路由记录
	const pages = Taro.getCurrentPages();
	const [pageVisible, toggleVisible] = useState(false);
	// normal mini min-expand
	const [showMode, updateMode] = useState('mini');
	const [lastTimes, updateTimes] = useState(0);
	const [currentLoop, updateListMode] = useState(loopList[0]);
	const loopIds = useRef([]); // 当前poemList已播放的ID
	const [Pinyin, updatePinyin] = useState({
		title: '',
		xu: '',
		content: [],
	});
	// '' 'list' 'setting'
	const [floatType, updateFloatType] = useState('');

	// 当前页面路由信息
	const currentPath = pages[pages.length - 1];
	const isTabPage = tabPages.includes(currentPath.route);

	const listModeChange = () => {
		updateListMode(loopList[currentLoop.next]);
	};

	const audioInit = (audio_url) => {
		if (!audioPlayer) {
			audioPlayer = Taro.getBackgroundAudioManager();
		}
		audioPlayer.title = currentPoem.title;
		audioPlayer.epname = '古诗文小助手';
		audioPlayer.singer = currentPoem.author_name;
		audioPlayer.coverImgUrl = ''; // logo
		audioPlayer.src = audio_url;
		currentPoem = updateCurrentPoem(currentPoem, {
			isPlaying: true,
			total_time: audioPlayer.duration,
			duration: Utils.formateSeconds(Number(audioPlayer.duration)),
			audio_url: audio_url,
		});
		addPlayEvent(audio_url);
	};

	const addPlayEvent = (audio_url) => {
		audioPlayer.onTimeUpdate(() => {
			const { currentTime, duration = 0 } = audioPlayer;
			const {
				total_time = 0,
				duration: localDuration,
				isPlaying,
			} = currentPoem;
			// console.log(currentTime, duration);
			currentPoem = updateCurrentPoem(currentPoem, {
				audio_url: audio_url,
				current_time: Utils.formateSeconds(currentTime || 0),
				currentTime: currentTime,
				duration:
					total_time > 0
						? Utils.formateSeconds(total_time || 0)
						: localDuration,
				total_time: total_time > 0 ? total_time : duration,
				isPlaying: currentTime > 0 ? isPlaying : false,
			});
			updateTimes((pre) => pre + 1);
		});
		audioPlayer.onPlay(() => {
			console.log('--onPlay');
			currentPoem = updateCurrentPoem(currentPoem, {
				isPlaying: true,
			});
			loopIds.current = [...new Set([...loopIds.current, currentPoem.id])];
			updateTimes((pre) => pre + 1);
		});
		audioPlayer.onPause(() => {
			console.log('--onPause');
			currentPoem = updateCurrentPoem(currentPoem, {
				isPlaying: false,
			});
			updateTimes((pre) => pre + 1);
		});
		audioPlayer.onStop(() => {
			console.log('--onStop');
			currentPoem = updateCurrentPoem(currentPoem, {
				isPlaying: false,
			});
			updateTimes(0);
			handlePlayNewOne(0, 'loop');
		});
		audioPlayer.onEnded(() => {
			console.log('--onEnded');
			currentPoem = updateCurrentPoem(currentPoem, {
				isPlaying: false,
			});
			handlePlayNewOne(0, 'loop');
		});
	};

	const handlePlayPre = () => {
		handlePlayNewOne(-1, 'side');
	};

	const handlePlayNext = () => {
		handlePlayNewOne(1, 'side');
	};

	const getRandomNumberFromArray = (arr) => {
		// 生成一个随机索引
		const index = Math.floor(Math.random() * arr.length);
		// 从数组中移除并返回随机元素
		return arr.splice(index, 1)[0];
	};
	/**
	 * 播放新的音频
	 * @param {*} index
	 * @param {*} type
	 */
	const handlePlayNewOne = (index, type = 'side') => {
		// 0 当前 1 下一首 -1 上一首
		const poems = getPoemList();
		const currentIndex = poems.findIndex((item) => item.id === currentPoem.id);
		let nextIndex = index;
		let unPlayList = poems.filter((item) => {
			return !loopIds.current.includes(item.id);
		});
		// 全部播放过一遍，则置空
		if (unPlayList.length === 0) {
			loopIds.current = [];
			unPlayList = [...poemList];
		}
		console.log('index,type:', index, type);
		console.log('currentIndex:', currentIndex);
		console.log(unPlayList, poems);
		// 处理循环 list one random
		if (type === 'side') {
			if (index > 0) {
				if (currentIndex > 0) {
					nextIndex = currentIndex + 1;
				} else {
					nextIndex = 1;
				}
				nextIndex = nextIndex > poems.length - 1 ? 0 : nextIndex;
			}
			if (index < 0) {
				if (currentIndex > 0) {
					nextIndex = currentIndex - 1;
				} else {
					nextIndex = poems.length - 1;
				}
				nextIndex = nextIndex > 0 ? nextIndex : 0;
			}
		}
		if (type === 'loop') {
			console.log('currentLop', currentLoop);
			switch (currentLoop.name) {
				case 'list':
					nextIndex = currentIndex + 1;
					nextIndex = nextIndex > poems.length - 1 ? 0 : nextIndex;
					break;
				case 'one':
					nextIndex = 0;
					break;
				case 'random':
					nextIndex = parseInt(
						getRandomNumberFromArray(Object.keys(unPlayList))
					);
					break;
			}
		}
		console.log('nextIndex', nextIndex);
		if (nextIndex === currentIndex) {
			audioPlayer.play();
			return false;
		}
		let nextPoem = poems[nextIndex] || {};
		currentPoem = updateCurrentPoem(currentPoem, nextPoem);
		if (nextPoem.audio_url) {
			audioInit(nextPoem.audio_url);
		} else {
			fetchAudioUrl(nextPoem.id);
		}
	};

	const changePlayStatus = () => {
		if (!audioPlayer) {
			audioPlayer = Taro.getBackgroundAudioManager();
		}
		const isPause = !!audioPlayer.paused;
		const isInit = audioPlayer.src;
		console.log('paused', isPause, audioPlayer, isInit);
		console.log('isPlaying', !isPause);
		if (isPause || !isInit) {
			if (audioPlayer.currentTime) {
				audioPlayer.play();
			} else {
				console.log(currentPoem.audio_url, 'audio_url');
				if (!currentPoem.audio_url) {
					fetchAudioUrl(currentPoem.id);
					return false;
				}
				audioPlayer.src = currentPoem.audio_url;
				audioPlayer.title = currentPoem.title;
				currentPoem = updateCurrentPoem(currentPoem, {
					duration: Utils.formateSeconds(audioPlayer.duration),
				});
				audioPlayer.play();
				addPlayEvent(currentPoem.audio_url);
			}
		} else {
			audioPlayer.pause();
		}
		updateTimes((pre) => pre + 1);
	};

	// 获取音频地址
	const fetchAudioUrl = (id) => {
		if (id === currentPoem.id && currentPoem.audio_url) {
			audioInit(currentPoem.audio_url);
			return false;
		}
		fetchPoemAudio('GET', {
			id: id,
		}).then((res) => {
			if (res && res.statusCode === 200) {
				if (!res.data.src) {
					Taro.showToast({
						title: res.data.msg || '音频生成失败',
						icon: 'none',
						duration: 2500,
					});
				} else {
					currentPoem = updateCurrentPoem(currentPoem, {
						audio_url: res.data.src,
					});
					audioInit(res.data.src);
				}
			}
		});
	};

	const handlePoemAdd = (payload) => {
		audioPlayer = null;
		console.log(payload, 'poemAudioAdd');
		currentPoem = updateCurrentPoem(initPoem, {
			...initPoem,
			...payload,
			isPlaying: false,
			currentTime: 0,
			current_time: '00:00',
		});
		poemList = poemAudioUpdate(payload);
		console.log(currentPoem, poemList);
		toggleVisible(true);
		show();
		fetchAudioUrl(payload.id);
	};

	const handleExpand = () => {
		updateMode('normal');
	};

	const handleClose = () => {
		toggleVisible(false);
		updateMode('normal');
		currentPoem = updateCurrentPoem(initPoem, {});
		if (audioPlayer && !audioPlayer.paused) {
			audioPlayer.stop();
		}
		close();
	};

	// 半屏组件关闭
	const handleContainerLeave = () => {
		// toggleVisible(false);
		updateMode('mini');
	};

	const handleClickOverlay = (e) => {
		updateMode('mini');
		e.stopPropagation();
		e.preventDefault();
	};

	const showSetting = () => {
		updateFloatType('setting');
	};

	const showList = () => {
		updateFloatType('list');
	};

	const floatClose = () => {
		updateFloatType('');
	};

	const getPinyin = () => {
		if (Pinyin.title) {
			updatePinyin({
				title: '',
				xu: '',
				content: [],
			});
			return false;
		}
		// 使用缓存
		if (currentPoem.pinyin.title) {
			updatePinyin({
				...currentPoem.pinyin,
			});
			return false;
		}
		Taro.showLoading({
			title: '转换中，请稍等',
			icon: 'none',
		});
		const { title, content, author, dynasty } = currentPoem;
		fetchPoemPinyin('POST', {
			text: `${title}_${content.xu || ''}_${author}·${dynasty}_${(
				content.content || []
			).join('_')}`.replaceAll('&quot;', '"'),
			dictType: 'complete',
		})
			.then((res) => {
				const { pinyin } = res.data;
				if (!pinyin) {
					Taro.hideLoading();
					Taro.showToast({
						icon: 'none',
						title: '转换失败，请重试！',
					});
					return false;
				}
				const pinyinArr = pinyin.split('_');
				const [p_title, p_xu, p_author, ...p_content] = pinyinArr;
				updatePinyin({
					title: p_title,
					xu: p_xu,
					author: p_author,
					content: p_content,
				});
				currentPoem = updateCurrentPoem(currentPoem, {
					pinyin: {
						title: p_title,
						xu: p_xu,
						content: p_content,
						author: p_author,
					},
				});
				Taro.hideLoading();
			})
			.catch(() => {
				Taro.hideLoading();
			});
	};

	useDidShow(() => {
		console.log('--didShow:gushiAudio');
		currentPoem = getCurrentPoem();
		updateMode('mini');
		if (audioPlayer) {
			addPlayEvent();
		}
		updateTimes((pre) => pre + 1);
	});

	useEffect(() => {
		currentPoem = getCurrentPoem();
		// console.log(currentPoem, poemList);
		if (currentPoem.id) {
			toggleVisible(true);
		}
		if (!currentPath.route.includes('pages/poem/detail')) {
			updateMode('mini');
		}
		Taro.eventCenter.on('poemAudioAdd', handlePoemAdd);
		Taro.eventCenter.on('poemAudioShow', () => {
			toggleVisible(true);
		});
		return () => {
			Taro.eventCenter.off('poemAudioAdd', handlePoemAdd);
			Taro.eventCenter.on('poemAudioShow');
		};
	}, []);

	useEffect(() => {
		if (pageVisible) {
			show();
		} else {
			close();
		}
	}, [pageVisible, show, close]);

	poemList = getPoemList();

	return (
		<View className='gushi-audio' data-time={lastTimes}>
			<PageContainer
				show={pageVisible && showMode === 'normal'}
				close-on-slide-down
				overlay
				round
				onClickOverlay={handleClickOverlay}
				onLeave={handleContainerLeave}
				customStyle={{
					height: '100vh',
					display: showMode === 'normal' ? 'block' : 'none',
				}}
			>
				<View
					className={`gushi-page-container ${
						isTabPage ? 'tabPage' : 'normalPage'
					}`}
				>
					{/* 关闭按钮 */}
					<View className='top-close' onClick={handleClickOverlay}>
						<Image src={closeSvg} className='svg' mode='widthFix' />
					</View>
					{/* 诗词内容展示区 */}
					<View
						className='gushi-content'
						style={{
							display: showMode === 'normal' ? 'block' : 'none',
						}}
					>
						{/* 标题 */}
						<Navigator
							hoverClass='none'
							url={`/pages/poem/detail?id=${currentPoem.id}`}
							className='link title'
						>
							<AudioWords
								content={{
									content: [currentPoem.title],
								}}
								pinyin={{ content: [Pinyin.title || ''] }}
							/>
						</Navigator>
						{/* 朝代、作者 */}
						<Navigator
							hoverClass='none'
							url={`/pages/poet/detail?id=${currentPoem.author_id}`}
							className='link author'
							style={{
								display: currentPoem.author_id ? 'block' : 'none',
							}}
						>
							<AudioWords
								content={{
									content: [
										`${currentPoem.author || ''}·${currentPoem.dynasty || ''}`,
									],
								}}
								pinyin={{ content: [Pinyin.author || ''] }}
							/>
						</Navigator>
						{/* 内容*/}
						{currentPoem.content ? (
							<ScrollView
								scrollY
								enhanced
								enableFlex
								refresherEnabled={false}
								showScrollbar={false}
								className={`content ci ${Pinyin.title ? 'pinyin' : ''}`}
							>
								<AudioWords content={currentPoem.content} pinyin={Pinyin} />
							</ScrollView>
						) : null}
						{/* 是否展示拼音 */}
					</View>
					{/* 定时、语速等设置、加入诗单 */}
					<View className='audio-setting'>
						<View className='setting' onClick={showSetting}>
							<Image src={settingSvg} mode='widthFix' className='svg' />
						</View>
						<View className='setting pinyin' onClick={getPinyin}>
							<Image
								src={Pinyin.title ? pinyinActiveSvg : pinyinSvg}
								mode='widthFix'
								className='svg'
							/>
						</View>
					</View>
					{/* 播放器 */}
					<View className='audio-player'>
						{/* 进度条 */}
						{/* 当前时间、总时长 */}
						<View className='player-progress'>
							<AudioProgress
								lastTimes={lastTimes}
								current_time={currentPoem.current_time}
								total_time={currentPoem.total_time}
								duration={currentPoem.duration}
								currentTime={currentPoem.currentTime}
							/>
						</View>
						{/* 操作区 */}
						<View className='operate-container'>
							{/* 播放模式、上一首、播放、暂停、下一首、列表 */}
							<View className='loop' onClick={listModeChange}>
								<Image src={currentLoop.svg} mode='widthFix' className='svg' />
							</View>
							<View className='pre' onClick={handlePlayPre}>
								<Image src={preSvg} mode='widthFix' className='svg' />
							</View>
							<View className='status' onClick={changePlayStatus}>
								<Image
									src={
										currentPoem.isPlaying && currentPoem.currentTime
											? playSvg
											: pauseSvg
									}
									mode='widthFix'
									className='svg'
								/>
							</View>
							<View className='next' onClick={handlePlayNext}>
								<Image src={nextSvg} mode='widthFix' className='svg' />
							</View>
							<View className='list' onClick={showList}>
								<Image src={listSvg} mode='widthFix' className='svg' />
							</View>
						</View>
					</View>
				</View>
			</PageContainer>
			{/* mini操作区，可全屏拖动 */}
			{/* 移动结束后，自动贴边，计算离那边近，自动移动到哪边 */}
			{currentPoem.id ? (
				<AudioMini
					close={handleClose}
					expand={handleExpand}
					playChange={changePlayStatus}
					lastTimes={lastTimes}
					isTabPage={isTabPage}
					style={{
						display: showMode === 'mini' ? 'block' : 'none',
					}}
				/>
			) : null}
			{/* 列表和设置 */}
			<FloatLayout
				showTitle={false}
				isOpen={!!floatType}
				close={floatClose}
				containerStyle={{
					width: '90%',
					bottom: '10vh',
					height: '70vh',
					left: '5%',
					borderRadius: '20rpx',
					paddingTop: '20rpx',
				}}
			>
				{floatType === 'list' ? (
					<AudioList
						update={updateTimes}
						currentPoem={currentPoem}
						updatePoem={handlePoemAdd}
					/>
				) : (
					<>
						<View className='fl-title'>
							<View className='setting-tiitle'>
								<Text className='text'>播放设置</Text>
							</View>
						</View>
						<View className='audio-setting'>设置</View>
					</>
				)}
			</FloatLayout>
		</View>
	);
};

export default GushiAudio;
