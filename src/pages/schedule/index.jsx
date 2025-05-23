import { View, Text } from '@tarojs/components';
import Taro, { useLoad, usePullDownRefresh } from '@tarojs/taro';
import { useEffect, useState } from 'react';

import ScheduleCard from '../../components/ScheduleCard';

import { fetchSchedules, fetchScheduleStats } from '../../services/global';

import './style.scss';

const SchedulePage = () => {
	const [scheduleList, setList] = useState(null);
	const [stats, setStats] = useState({
		total_poem: 0, // 学习诗词数量
		continue_days: 0, // 连续打卡天数
		total_days: 0, // 总打卡天数
	});

	useLoad((options) => {
		console.log(options);
	});

	const fetchList = async () => {
		const res = await fetchSchedules('GET', {});
		if (res && res.statusCode === 200) {
			const { list = [] } = res.data || {};
			setList(list);
		}
	};

	const fetchStats = async () => {
		const res = await fetchScheduleStats('GET', {});
		if (res && res.statusCode === 200) {
			setStats(res.data);
		}
	};

	usePullDownRefresh(() => {
		fetchList();
		fetchStats();
		Taro.stopPullDownRefresh();
	});

	useEffect(() => {
		fetchStats();
		fetchList();
	}, []);

	return (
		<View className='page schedulePage'>
			{/* 概况 */}
			<View className='statsCard'>
				<View className='card_item'>
					<View className='top'>
						<Text className='num'>{stats.total_poem || 0}</Text>
						<Text className='text'>篇</Text>
					</View>
					<View className='info'>学习诗词</View>
				</View>
				<View className='card_item'>
					<View className='top'>
						<Text className='num'>{stats.continue_days || 0}</Text>
						<Text className='text'>天</Text>
					</View>
					<View className='info'>连续打卡</View>
				</View>
				<View className='card_item'>
					<View className='top'>
						<Text className='num'>{stats.total_days || 0}</Text>
						<Text className='text'>天</Text>
					</View>
					<View className='info'>总打卡</View>
				</View>
			</View>
			<View className='divider'></View>
			{/* 列表 */}
			<View className='listContainer'>
				{scheduleList && scheduleList.length ? (
					<View className='scheduleList'>
						{scheduleList.map((item) => (
							<ScheduleCard key={item.id} {...item} />
						))}
					</View>
				) : (
					<View className='empty'>暂无内容</View>
				)}
			</View>
		</View>
	);
};

export default SchedulePage;
