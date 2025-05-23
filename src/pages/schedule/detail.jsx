import { View } from '@tarojs/components';
import Taro, {
	useLoad,
	usePullDownRefresh,
	useReachBottom,
} from '@tarojs/taro';
import { useEffect, useRef, useState } from 'react';
import { AtTabs, AtTabsPane } from 'taro-ui';

import ScheduleCard from '../../components/ScheduleCard';
import SchedulePoemCard from '../../components/SchedulePoemCard';

import './detail.scss';

import { fetchScheduleDetail } from '../../services/global';

const ScheduleDetail = () => {
	const optionsRef = useRef({});
	const paginationRef = useRef({
		page: 1,
		size: 15,
		total: 0,
	});
	const [status, setStatus] = useState(0);
	const [scheduleDetail, setDetail] = useState({
		detail: {},
		list: [],
	});

	useLoad(async (options) => {
		console.log(options);
		optionsRef.current = options;
		await fetchDetail(options);
	});

	const fetchDetail = async (options) => {
		const { id } = options || optionsRef.current;
		const { page: currentPage, size: currentSize } = paginationRef.current;
		console.log(id, 'id');
		const res = await fetchScheduleDetail('GET', {
			schedule_id: id,
			page: currentPage,
			size: currentSize,
			status: status,
		}).catch((err) => {
			console.log(err);
		});
		if (res && res.statusCode === 200) {
			const { detail = {}, page, size, total, list = [] } = res.data || {};
			Taro.setNavigationBarTitle({
				title: detail.name,
			});
			setDetail({
				...res.data,
				list: page > 1 ? [...scheduleDetail.list] : list,
			});
			paginationRef.current = {
				...paginationRef.current,
				page,
				size,
				total,
			};
		}
		console.log(res.data);
	};

	const handleStatusChange = (value) => {
		setStatus(value);
		if (value !== status) {
			paginationRef.current = {
				...paginationRef.current,
				page: 1,
			};
		}
	};

	usePullDownRefresh(() => {
		fetchDetail();
		paginationRef.current = {
			page: 1,
			size: 15,
			total: 0,
		};
		Taro.stopPullDownRefresh();
	});

	useReachBottom(() => {
		const { page, size, total } = paginationRef.current;
		if (page * size < total) {
			paginationRef.current = {
				...paginationRef.current,
				page: page + 1,
			};
			fetchDetail();
		}
	});

	useEffect(() => {
		fetchDetail();
	}, [status]);

	return (
		<View className='page schedule-detail'>
			<View className='detail-top'>
				<ScheduleCard
					{...scheduleDetail.detail}
					total_study={scheduleDetail.detail.studyTotal}
					total_days={scheduleDetail.detail.studyDays}
					navigate={false}
				/>
			</View>
			<View className='divider'></View>
			{/* 诗词列表 */}
			{/* 待学习，已学习 */}
			<AtTabs
				swipeable={false}
				current={status}
				tabList={[{ title: '待学习' }, { title: '已学习' }]}
				onClick={handleStatusChange}
			>
				<AtTabsPane current={status} index={0}>
					{scheduleDetail.list.map((item) => (
						<SchedulePoemCard key={item._id} {...item} status={0} />
					))}
				</AtTabsPane>
				<AtTabsPane current={status} index={1}>
					{scheduleDetail.list.map((item) => (
						<SchedulePoemCard key={item._id} {...item} status={1} />
					))}
				</AtTabsPane>
			</AtTabs>
		</View>
	);
};

export default ScheduleDetail;
