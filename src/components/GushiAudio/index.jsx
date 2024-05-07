import { PageContainer, View, Text, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useEffect, useState } from 'react';

import AudioMini from './AudioMini';

import {
	getPoemList,
	updatePoemList,
	initPoem,
	updateCurrentPoem,
	getCurrentPoem,
} from './util';
import Utils from '../../utils/util';
import { fetchPoemAudio } from '../../services/global';

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
// import closeSvg from '../../images/svg/audio/close.svg';

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
const GushiAudio = ({ close, show }) => {
	// 路由记录
	const pages = Taro.getCurrentPages();
	const [pageVisible, toggleVisible] = useState(false);
	// normal mini min-expand
	const [showMode, updateMode] = useState('mini');
	const [lastTimes, updateTimes] = useState(0);
	const [currentLoop, updateListMode] = useState(loopList[0]);

	// 当前页面路由信息
	const currentPath = pages[pages.length - 1];

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
		});
	};

	const changePlayStatus = () => {
		if (!audioPlayer) {
			audioPlayer = Taro.getBackgroundAudioManager();
		}
		const isPause = !!audioPlayer.paused;
		const isInit = audioPlayer.src;
		console.log('paused', isPause, audioPlayer);
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
			changePlayStatus();
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
		console.log(payload, 'poemAudioAdd');
		currentPoem = updateCurrentPoem(currentPoem, {
			...initPoem,
			...payload,
		});
		poemList = updatePoemList(poemList, payload);
		console.log(currentPoem, poemList);
		toggleVisible(true);
		show();
		fetchAudioUrl(payload.id);
	};

	const handlePackUp = () => {
		updateMode('mini');
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

	useDidShow(() => {
		console.log('--didShow:gushiAudio');
		currentPoem = getCurrentPoem();
		poemList = getPoemList();
		updateMode('mini');
		if (audioPlayer) {
			addPlayEvent();
		}
		updateTimes((pre) => pre + 1);
	});

	useEffect(() => {
		currentPoem = getCurrentPoem();
		poemList = getPoemList();
		console.log(currentPoem, poemList);
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

	return (
		<View className='gushi-audio' data-time={lastTimes}>
			<PageContainer
				show={pageVisible && showMode === 'normal'}
				close-on-slide-down
				overlay={false}
				customStyle={{
					height: '10vh',
					display: showMode === 'normal' ? 'block' : 'none',
				}}
			>
				<View className='gushi-page-container'>
					<View className='top'>
						<View onClick={handleClose}>关闭</View>
						<View onClick={handlePackUp}>缩小</View>
					</View>
					{/* 诗词内容展示区 */}
					<View
						className='gushi-content'
						style={{
							display: showMode === 'normal' ? 'block' : 'none',
						}}
					>
						<View className='title'>{currentPoem.title}</View>
						{/* 标题 */}
						{/* 朝代、作者 */}
						<View className='author'>
							<Text>
								{currentPoem.dynasty} | {currentPoem.author}
							</Text>
						</View>
						{/* 内容*/}
						<View className='content ci'>
							{currentPoem.content.content.map((item, index) => (
								<View className='contentItem' key={index}>
									<Text userSelect decode space='ensp' className='text block'>
										{item}
									</Text>
								</View>
							))}
						</View>
						{/* 是否展示拼音 */}
					</View>
					{/* 定时、语速等设置、加入诗单 */}
					<View className='audio-setting'>
						<View className='setting'>
							<Image src={settingSvg} mode='widthFix' className='svg' />
						</View>
					</View>
					{/* 播放器 */}
					<View className='audio-player'>
						{/* 进度条 */}
						<View className='player-progress'>{/* 当前时间、总时长 */}</View>
						{/* 操作区 */}
						<View className='operate-container'>
							{/* 播放模式、上一首、播放、暂停、下一首、列表 */}
							<View className='loop' onClick={listModeChange}>
								<Image src={currentLoop.svg} mode='widthFix' className='svg' />
							</View>
							<View className='pre'>
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
							<View className='next'>
								<Image src={nextSvg} mode='widthFix' className='svg' />
							</View>
							<View className='list'>
								<Image src={listSvg} mode='widthFix' className='svg' />
							</View>
						</View>
					</View>
				</View>
			</PageContainer>
			{/* mini操作区，可全屏拖动 */}
			{/* 移动结束后，自动贴边，计算离那边近，自动移动到哪边 */}
			<AudioMini
				close={handleClose}
				expand={handleExpand}
				playChange={changePlayStatus}
				lastTimes={lastTimes}
				style={{
					display: showMode === 'mini' ? 'block' : 'none',
				}}
			/>
		</View>
	);
};

export default GushiAudio;
