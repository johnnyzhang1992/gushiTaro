import { View } from '@tarojs/components';
import Taro, {
	useLoad,
	usePullDownRefresh,
	useReachBottom,
} from '@tarojs/taro';
import { useEffect, useRef, useState } from 'react';
import { Tabs, TabPane } from '@nutui/nutui-react-taro';

import SchedulePoemModal from '../../components/SchedulePoemModal';
import RootFixed from '../../components/RootFixed';
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
	const [showModal, modalVisible] = useState(false);
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
	});

	const fetchDetail = async (options) => {
		const { id } = options || optionsRef.current;
		const { page: currentPage, size: currentSize } = paginationRef.current;
		console.log(id, 'id');
		Taro.showLoading({
			title: '加载中',
		});
		const res = await fetchScheduleDetail('GET', {
			schedule_id: id,
			page: currentPage,
			size: currentSize,
			status: status,
		}).catch((err) => {
			console.log(err);
		}).finally(() => {
			Taro.hideLoading()
		});
		if (res && (res.status || res.statusCode === 200)) {
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
		if (type == 'add') {
			const poemCount = detail.poem_count + 1;
			setDetail({
				...scheduleDetail,
				detail: {
					...detail,
					poem_count: poemCount,
					precent: Math.floor((detail.studyTotal / poemCount) * 100),
				},
			});
			paginationRef.current = {
				...paginationRef.current,
				page: 1,
				total: 0,
			};
			fetchDetail();
		}
		if (type == 'add_again') {
			const { poem_count, studyTotal } = detail;
			const temList = list.filter((sche) => {
				return sche._id !== schedule_detail_id;
			});
			setDetail({
				...scheduleDetail,
				lisy: temList,
				detail: {
					...detail,
					precent: Math.floor((studyTotal - 1 / poem_count) * 100),
				},
			});
			paginationRef.current = {
				...paginationRef.current,
				page: 1,
				total: 0,
			};
			fetchDetail();
		}
	};

	// 显示搜索弹窗
	const handleShowModal = () => {
		modalVisible(true);
	};

	const handleModalClose = () => {
		modalVisible(false);
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
		console.log('reachBottom', page * size, total);
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
			{/* 诗词列表 */}
			{/* 待学习，已学习 */}
			<Tabs value={status} onChange={handleStatusChange}>
				<TabPane title='待学习'>
					<View className='poemList'>
						{scheduleDetail.list.length > 0 ? (
							scheduleDetail.list.map((item) => (
								<SchedulePoemCard
									{...item}
									key={item._id}
									status={0}
									onSuccess={handlePoemCallback}
								/>
							))
						) : (
							<View className='empty'>
								<View>已完成学习计划🎉</View>
							</View>
						)}
					</View>
				</TabPane>
				<TabPane title='已打卡'>
					<View className='poemList'>
						{scheduleDetail.list.length > 0 ? (
							scheduleDetail.list.map((item) => (
								<SchedulePoemCard
									{...item}
									key={item._id}
									status={1}
									onSuccess={handlePoemCallback}
								/>
							))
						) : (
							<View className='empty'>
								<View>已完成学习计划🎉</View>
							</View>
						)}
					</View>
				</TabPane>
			</Tabs>
			{/* 新增诗词按钮 */}
			<RootFixed>
			<View className='createBtn' onClick={handleShowModal}>
				<View className='add-icon icon'></View>
			</View>
			</RootFixed>
			{/* 诗词弹窗 */}
			<SchedulePoemModal
				show={showModal}
				schedule_id={scheduleDetail.detail._id}
				schedule_name={scheduleDetail.detail.name}
				onSuccess={handlePoemCallback}
				onClose={handleModalClose}
			/>
		</View>
	);
};

export default ScheduleDetail;
