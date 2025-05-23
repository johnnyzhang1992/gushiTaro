import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './style.scss';

const ScheduleCard = (props) => {
	const {
		id,
		name,
		total_study = 0,
		total_days = 0,
		precent = 0,
		poem_count = 0,
		navigate = true,
	} = props;
	const navigateTo = () => {
		if (!navigate) {
			return false;
		}
		Taro.navigateTo({
			url: '/pages/schedule/detail?id=' + id,
		});
	};

	return (
		<View className='schedule-card' onClick={navigateTo}>
			<View className='name'>{name}</View>
			<View className='process'>
				<View className='process_bar' style={{ width: precent + '%' }}></View>
			</View>
			<View className='card_info'>
				<View className='info_item'>
					<View className='info_top'>
						<Text className='num'>{total_study}</Text>
						<Text className='text'>篇</Text>
					</View>
					<View className='desc'>已学习</View>
				</View>
				<View className='info_item'>
					<View className='info_top'>
						<Text className='num'>{poem_count - total_study}</Text>
						<Text className='text'>篇</Text>
					</View>
					<View className='desc'>待学习</View>
				</View>
				<View className='info_item'>
					<View className='info_top'>
						<Text className='num'>{total_days}</Text>
						<Text className='text'>天</Text>
					</View>
					<View className='desc'>天数</View>
				</View>
				<View className='info_item'>
					<View className='info_top'>
						<Text className='num'>{precent}</Text>
						<Text className='text'>%</Text>
					</View>
					<View className='desc'>进度</View>
				</View>
			</View>
			{navigate ? (
				<View className='at-icon at-icon-chevron-right more'></View>
			) : null}
		</View>
	);
};

export default ScheduleCard;
