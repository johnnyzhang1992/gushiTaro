import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Swipe } from '@nutui/nutui-react-taro';

import { deleteSchedule } from '../../services/global';

import './style.scss';

const swiperOptions = [
	{
		text: '编辑',
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

const ScheduleCard = (props) => {
	const {
		id: rawId,
		_id,
		name,
		total_study = 0,
		total_days = 0,
		precent = 0,
		poem_count = 0,
		navigate = true,
		canSwiper = true,
		onEdit,
		onDelete,
	} = props;
	const id = rawId || _id;
	const navigateTo = () => {
		if (!navigate) {
			return false;
		}
		Taro.navigateTo({
			url: '/pages/schedule/detail?id=' + id,
		});
	};

	const handleSwiperClick = (val) => {
		console.log(val, 'scheduleCard--click');
		const { text } = val || {};
		if (text == '编辑') {
			onEdit && onEdit(id);
		} else if (text == '删除') {
			Taro.showModal({
				title: '提示',
				content: `确定删除「${name}」？`,
				success: function (res) {
					if (res.confirm) {
						handleDelete();
					} else if (res.cancel) {
						console.log('用户点击取消');
					}
				},
			});
		}
	};

	const handleDelete = () => {
		deleteSchedule('POST', { id })
			.then((res) => {
				if (res && res.statusCode == 200) {
					onDelete && onDelete(id);
					Taro.showToast({
						// 删除成功
						title: '删除成功',
						icon: 'success',
						duration: 2000,
					});
				}
			})
			.catch((err) => {
				console.log(err, 'scheduleCard--delete');
				Taro.showToast({
					// 删除成功
					title: err.errmsg || '删除失败',
					icon: 'none',
					duration: 2000,
				});
			});
	};

	return (
		<View className='schedule-card'>
			<Swipe
				rightAction={
					<View style={{ display: 'flex', height: '100%' }}>
						<View
							className='swipe-btn edit'
							onClick={() => handleSwiperClick({ text: '编辑' })}
						>编辑</View>
						<View
							className='swipe-btn delete'
							onClick={() => handleSwiperClick({ text: '删除' })}
						>删除</View>
					</View>
				}
			>
				<View className='card_content' onClick={navigateTo}>
					<View className='name'>{name}</View>
					<View className='process'>
						<View
							className='process_bar'
							style={{ width: precent + '%' }}
						></View>
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
						<Text className='more'> › </Text>
					) : null}
				</View>
			</Swipe>
		</View>
	);
};

export default ScheduleCard;
