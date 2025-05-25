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
		detail: {
			studyTotal: 0,
			studyDays: 0,
			poem_count: 0,
			precent: 0,
		},
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

	const handlePoemCallback = (options) => {
		const { type = '', schedule_detail_id } = options;
		const { detail, list = [] } = scheduleDetail;
		if (type == 'check_in') {
			const temList = list.filter((sche) => {
				return sche._id !== schedule_detail_id;
			});
			const studyTotal = detail.studyTotal + 1;
			setDetail({
				...scheduleDetail,
				list: temList,
				detail: {
					...detail,
					studyTotal,
					precent: Math.floor((studyTotal / detail.poem_count) * 100),
				},
			});
		}
		if (type == 'delete') {
			// 更新detail.poem_count
			// 更新detail.list
			const temList = list.filter((sche) => {
				return sche._id !== schedule_detail_id;
			});
			const poemCount = detail.poem_count - 1;
			setDetail({
				...scheduleDetail,
				list: temList,
				detail: {
					...detail,
					poem_count: poemCount,
					precent:
						poemCount > 0
							? Math.floor((detail.studyTotal / poemCount) * 100)
							: 0,
				},
			});
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
					canSwiper={false}
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
						<SchedulePoemCard
							{...item}
							key={item._id}
							status={0}
							onSuccess={handlePoemCallback}
						/>
					))}
				</AtTabsPane>
				<AtTabsPane current={status} index={1}>
					{scheduleDetail.list.map((item) => (
						<SchedulePoemCard
							{...item}
							key={item._id}
							status={1}
							onSuccess={handlePoemCallback}
						/>
					))}
				</AtTabsPane>
			</AtTabs>
		</View>
	);
};

export default ScheduleDetail;
