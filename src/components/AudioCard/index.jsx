import { useEffect, useRef, useState } from 'react';
import { View } from '@tarojs/components';
import Taro, { useUnload } from '@tarojs/taro';
import { AtProgress } from 'taro-ui';

import { fetchPoemAudio } from '../../services/global';
import Utils from '../../utils/util';

import './style.scss';

const AudioCard = (props) => {
	const { title, author } = props;
	const [isPlay, updatePlay] = useState(false);
	const repeatRef = useRef(false);
	const audioRef = useRef();
	const timeRef = useRef(null);
	const [audioTime, updateTime] = useState({
		current: 0,
		duration: 0,
		percent: 0,
		playTime: '00:00',
		totalTime: '00:00',
	});

	const audioInit = (audioSrc) => {
		Taro.setInnerAudioOption({
			obeyMuteSwitch: false,
		});
		const innerAudioContext = Taro.createInnerAudioContext({
			useWebAudioImplement: true,
		});
		innerAudioContext.autoplay = false;
		innerAudioContext.src = audioSrc;
		innerAudioContext.onCanplay(() => {
			updateTime({
				...audioTime,
				playTime: Utils.formateSeconds(0),
				totalTime: Utils.formateSeconds(innerAudioContext.duration),
				current: innerAudioContext.currentTime,
				duration: innerAudioContext.duration,
			});
		});
		innerAudioContext.onPlay(() => {
			console.log('开始播放');
		});
		innerAudioContext.onEnded(() => {
			if (repeatRef.current) {
				updatePlay(true);
				innerAudioContext.play();
			} else {
				updatePlay(false);
				updateTime((pre) => {
					return {
						...pre,
						current: 0,
						percent: 0,
						playTime: Utils.formateSeconds(0),
					};
				});
			}
		});
		innerAudioContext.onStop(() => {
			updatePlay(false);
		});
		innerAudioContext.onError((result) => {
			console.log(result.errMsg);
			console.log(result.errCode);
		});
		audioRef.current = innerAudioContext;
	};

	const handlePlay = () => {
		audioRef.current.play();
		updatePlay(true);
	};

	const handlePause = () => {
		audioRef.current.pause();
		updatePlay(false);
	};

	const handleStop = () => {
		audioRef.current.stop();
		updatePlay(false);
		repeatRef.current = false;
		updateTime((pre) => {
			return {
				...pre,
				current: 0,
				percent: 0,
				playTime: Utils.formateSeconds(0),
			};
		});
	};

	const handleRepeatPlay = () => {
		audioRef.current.play();
		updatePlay(true);
		repeatRef.current = true;
	};

	useUnload(() => {
		// 关闭音频播放
		audioRef.current?.stop();
		audioRef.current?.destroy();
	});

	useEffect(() => {
		if (props.id) {
			fetchPoemAudio('GET', {
				id: props.id,
			}).then((res) => {
				console.log(res);
				if (res && res.statusCode === 200) {
					audioInit(res.data.src);
				}
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.id]);

	useEffect(() => {
		if (isPlay) {
			timeRef.current = setInterval(() => {
				const currentTime = audioRef.current.currentTime || 0;
				const duration = audioRef.current.duration || 0;
				updateTime((pre) => {
					return {
						...pre,
						current: currentTime,
						duration: duration,
						percent: (currentTime / duration) * 100,
						playTime: Utils.formateSeconds(currentTime),
						totalTime: Utils.formateSeconds(duration),
					};
				});
			}, 100);
			return () => {
				clearInterval(timeRef.current);
			};
		} else {
			clearInterval(timeRef.current);
		}
	}, [isPlay]);

	return (
		<View className='audioCard'>
			<View className='poem'>
				<View className='at-icon at-icon-volume-plus icon'></View>
				<View className='title'>{title}</View>
				<View className='author'>{author}</View>
			</View>
			<View className='progress'>
				<View className='time pre'>{audioTime.playTime}</View>
				<AtProgress
					color='#337ab7'
					strokeWidth={2}
					isHidePercent
					percent={audioTime.percent}
				/>
				<View className='time end'>{audioTime.totalTime}</View>
			</View>
			<View className='audio'>
				{isPlay ? (
					<>
						<View className='play' onClick={handlePause}>
							<View className='at-icon at-icon-pause'></View>
							<View className='text'>暂停</View>
						</View>
						<View className='play' onClick={handleStop}>
							<View className='at-icon at-icon-stop'></View>
							<View className='text'>停止</View>
						</View>
					</>
				) : (
					<>
						<View className='play' onClick={handlePlay}>
							<View className='at-icon at-icon-play'></View>
							<View className='text'>播放</View>
						</View>
						<View className='play' onClick={handleRepeatPlay}>
							<View className='at-icon at-icon-repeat-play'></View>
							<View className='text'>循环播放</View>
						</View>
					</>
				)}
			</View>
		</View>
	);
};

export default AudioCard;
