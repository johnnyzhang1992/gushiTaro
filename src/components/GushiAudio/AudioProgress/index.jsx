// 播放进度展示，以及控制(参考微信读书)
import { View } from '@tarojs/components';
import { AtProgress } from 'taro-ui';

import './style.scss';

const AudioProgress = (props) => {
	const {
		duration = '00:00',
		current_time = '00:00',
		total_time = 0,
		currentTime = 0,
		lastTimes = 0,
	} = props;
	const percent = (currentTime / total_time) * 100;
	console.log(currentTime, total_time, lastTimes);
	return (
		<View className='audio-progress'>
			<AtProgress
				color='#337ab7'
				strokeWidth={2}
				isHidePercent
				percent={percent}
			/>
			<View className='progress-time'>
				<View className='start'>{current_time}</View>
				<View className='end'>{duration}</View>
			</View>
		</View>
	);
};

export default AudioProgress;
