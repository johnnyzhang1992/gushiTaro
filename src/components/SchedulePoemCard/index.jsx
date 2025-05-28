import { View, Text } from '@tarojs/components';
import { AtSwipeAction } from 'taro-ui';
import Taro from '@tarojs/taro';

import {
	removePoemToSchedule,
	checkInPoemToSchedule,
} from '../../services/global';

import './style.scss';

const swiperOptions = [
	{
		text: '删除',
		style: {
			backgroundColor: '#FF4949',
		},
	},
];

const handleError = (err, errTxt) => {
	console.log(err);
	const errmsg = err.errmsg || errTxt;
	Taro.showToast({
		title: errmsg,
		icon: 'none',
		duration: 2000,
	});
};

const SchedulePoemCard = (props) => {
	const {
		poem_info = {},
		status = 0,
		_id: schedule_detail_id,
		schedule_id,
		onSuccess,
		poem_id,
	} = props || {};

	const handleCheckIn = async () => {
		console.log('打卡', {
			schedule_detail_id,
			schedule_id,
		});
		const res = await checkInPoemToSchedule('POST', {
			schedule_detail_id,
			schedule_id,
		}).catch((err) => {
			handleError(err, '打卡失败');
		});
		if (res && res.statusCode == 200) {
			Taro.showToast({
				title: '打卡成功',
				icon: 'success',
				duration: 2000,
			});
			if (onSuccess && typeof onSuccess == 'function') {
				onSuccess({
					type: 'check_in',
					schedule_detail_id,
					schedule_id,
				});
			}
		}
	};

	const handleDelete = async () => {
		console.log('delete', {
			schedule_detail_id,
			schedule_id,
		});
		const res = await removePoemToSchedule('POST', {
			schedule_detail_id,
			schedule_id,
		}).catch((err) => {
			handleError(err, '删除失败');
		});
		if (res && res.statusCode == 200) {
			Taro.showToast({
				title: '删除成功',
				icon: 'success',
				duration: 2000,
			});
			if (onSuccess && typeof onSuccess == 'function') {
				onSuccess({
					type: 'delete',
					schedule_detail_id,
					schedule_id,
				});
			}
		}
	};

	const handlePreDelete = () => {
		Taro.showModal({
			title: '提示',
			content: `确定删除《${poem_info.title}》？`,
			success: function (res) {
				if (res.confirm) {
					handleDelete();
				} else if (res.cancel) {
					console.log('用户点击取消');
				}
			},
		});
	};

	const navigateToPoem = () => {
		Taro.navigateTo({
			url: '/pages/poem/detail?id=' + poem_id,
		});
	};
	return (
		<View className='schedule-poem-card'>
			<AtSwipeAction options={swiperOptions} onClick={handlePreDelete}>
				<View className='card_content'>
					{/* 诗词信息，点击调整详情 */}
					<View className='poem_info' onClick={navigateToPoem}>
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
				</View>
			</AtSwipeAction>
		</View>
	);
};

export default SchedulePoemCard;
