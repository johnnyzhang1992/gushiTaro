import { View, Text, Image } from '@tarojs/components';

import { getCurrentPoem } from '../util';

import './style.scss';

import playSvg from '../../../images/svg/audio/play.svg';
import pauseSvg from '../../../images/svg/audio/pause.svg';
import closeSvg from '../../../images/svg/audio/close.svg';

const AudioMini = (props) => {
	const {
		close,
		expand,
		playChange,
		style = {},
		lastTimes,
		isTabPage = false,
	} = props;
	const currentPoem = getCurrentPoem();

	return (
		<View
			data-times={lastTimes}
			className={`audio-mini-container ${isTabPage ? 'tabPage' : 'normalPage'}`}
			style={{
				...style,
			}}
		>
			<View className='audio-mini'>
				{/* 头像 */}
				{currentPoem.author_avatar ? (
					<View className='author_avatar'>
						<Image
							src={currentPoem.author_avatar}
							mode='heightFix'
							className='avatar'
						/>
					</View>
				) : null}
				<View className='mini-content'>
					{/* 标题 */}
					<View className='title' onClick={expand}>
						<Text>{currentPoem.title}</Text>
					</View>
					{/* 时长说明 */}
					<View className='audio-time'>
						<Text className='start'>{currentPoem.current_time || '00:00'}</Text>
						<Text>/</Text>
						<Text className='total'>{currentPoem.duration || '00:00'}</Text>
					</View>
				</View>
				{/* 播放暂停 */}
				<View className='status' onClick={playChange}>
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
				{/* 关闭按钮 */}
				<View className='close' onClick={close}>
					<Image src={closeSvg} mode='widthFix' className='svg' />
				</View>
			</View>
		</View>
	);
};

export default AudioMini;
