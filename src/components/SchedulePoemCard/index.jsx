import { View, Text } from '@tarojs/components';
import { AtSwipeAction } from 'taro-ui';

import './style.scss';

const swiperOptions = [
	{
		text: '删除',
		style: {
			backgroundColor: '#FF4949',
		},
	},
];
const SchedulePoemCard = (props) => {
	const {
		poem_info = {},
		status = 0,
		_id: schedule_detail_id,
		schedule_id,
	} = props || {};
	const handleCheckIn = () => {
		console.log('打卡', {
			schedule_detail_id,
			schedule_id,
		});
	};
	return (
		<View className='schedule-poem-card'>
			<AtSwipeAction options={swiperOptions}>
				{/* 诗词信息，点击调整详情 */}
				<View className='poem_info'>
					<Text className='title'>
						{poem_info.author}《{poem_info.title}》
					</Text>
					<Text className='content'>{poem_info.text_content}</Text>
				</View>
				<View className='operate'>
					{/* 打卡、已打卡 */}
					{status === 0 ? (
						<View className='btn' onClick={handleCheckIn}>
							打卡
						</View>
					) : (
						<View className='btn disable'>已打卡</View>
					)}
				</View>
			</AtSwipeAction>
		</View>
	);
};

export default SchedulePoemCard;
