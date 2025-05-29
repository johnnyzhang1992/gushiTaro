import { View, Text } from '@tarojs/components';
import { AtSwipeAction } from 'taro-ui';
import Taro from '@tarojs/taro';

import {
	removePoemToSchedule,
	checkInPoemToSchedule,
	addPoemToScheduleAgain,
} from '../../services/global';

import './style.scss';

const swiperOptions = [
	{
		text: '复习',
		style: {
			backgroundColor: '#337ab7',
		},
	},
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
		updated_at,
		check_count = 1,
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

	const handlePreCheckIn = () => {
		Taro.showModal({
			title: '确认打卡',
			confirmText: '确认',
			content: `${poem_info.author}《${poem_info.title}》？`,
			success: function (res) {
				if (res.confirm) {
					handleCheckIn();
				} else if (res.cancel) {
					console.log('用户点击取消');
				}
			},
		});
	}


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

	const handleAddAgain = async () => {
		console.log('add_again', {
			schedule_detail_id,
			schedule_id,
		});
		const res = await addPoemToScheduleAgain('POST', {
			schedule_detail_id,
			schedule_id,
		}).catch((err) => {
			handleError(err, '操作失败');
		});
		if (res && res.statusCode == 200) {
			Taro.showToast({
				title: '操作成功',
				icon: 'success',
				duration: 2000,
			});
			if (onSuccess && typeof onSuccess == 'function') {
				onSuccess({
					type: 'add_again',
					schedule_detail_id,
					schedule_id,
				});
			}
		}
	};

	const handlePreAddAgain = () => {
		Taro.showModal({
			title: '提示',
			content: `再次学习《${poem_info.title}》？`,
			success: function (res) {
				if (res.confirm) {
					handleAddAgain();
				} else if (res.cancel) {
					console.log('用户点击取消');
				}
			},
		});
	};

	const handleSwiperClick = (val) => {
		const { text } = val || {};
		if (text == '删除') {
			handlePreDelete();
		}
		if (text == '复习') {
			handlePreAddAgain();
		}
	};

	const navigateToPoem = () => {
		Taro.navigateTo({
			url: '/pages/poem/detail?id=' + poem_id,
		});
	};
	return (
		<View className='schedule-poem-card'>
			<AtSwipeAction options={swiperOptions} onClick={handleSwiperClick}>
				<View className='card_content'>
					{/* 诗词信息，点击调整详情 */}
					<View className='poem_info' onClick={navigateToPoem}>
						<Text className='title'>
							{poem_info.author}《{poem_info.title}》
						</Text>
						<Text className='content'>
							{status === 0 ? poem_info.text_content : updated_at}
						</Text>
					</View>
					<View className='operate'>
						{/* 打卡、已打卡 */}
						{status === 0 ? (
							<View className='btn' onClick={handlePreCheckIn}>
								打卡
							</View>
						) : (
							<View className='btn disable'>
								<Text>已打卡</Text>
								{check_count > 1 && (
									<Text className='check_count'>{check_count}</Text>
								)}
							</View>
						)}
					</View>
				</View>
			</AtSwipeAction>
		</View>
	);
};

export default SchedulePoemCard;
