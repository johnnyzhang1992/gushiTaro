import { View, Text, ScrollView } from '@tarojs/components';
import { AtInput } from 'taro-ui';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';

import FloatLoayout from '../../components/FloatLayout';
import {
	fetchSchedules,
	createSchedule,
	updateSchedule,
	addPoemToSchedule,
} from '../../services/global';

import './style.scss';

const titleObj = {
	create: '新建学习计划',
	edit: '加入学习计划',
};

const ScheduleItem = (props) => {
	const {
		schedule_id,
		poem_id,
		poem_count,
		name,
		activeIds = [],
		onSuccess,
	} = props;
	// 直接选中某个计划
	const handleAddPoem = async () => {
		if (activeIds.includes(schedule_id)) {
			return false;
		}
		addPoemToSchedule('POST', {
			poem_id,
			schedule_id,
			schedule_name: name,
		})
			.then((res) => {
				if (res && res.statusCode === 200) {
					Taro.showToast({
						title: '加入成功！记得打卡哦',
						icon: 'none',
						duration: 2000,
					});
					if (onSuccess && typeof onSuccess === 'function') {
						onSuccess([schedule_id]);
					}
				}
			})
			.catch((err) => {
				console.log('updateUserCollect', err);
				Taro.showToast({
					title: '操作失败',
					icon: 'error',
					duration: 2000,
				});
			});
	};
	return (
		<View
			className={`schedule-item ${
				activeIds.includes(schedule_id) ? 'active' : ''
			}`}
		>
			<View className='schedule-item__content'>
				<View className='schedule-item__title'>
					<Text>{name}</Text>
				</View>
				<View className='schedule-item__poem_count'>
					<Text>{poem_count || 0}篇</Text>
				</View>
			</View>
			<View className='schedule-item__btn' onClick={handleAddPoem}>
				<Text>{activeIds.includes(schedule_id) ? '已加入' : '加入'}</Text>
			</View>
		</View>
	);
};

const ScheduleModal = ({
	show = false,
	targetId,
	initType = 'edit',
	initschedule = {},
	onSuccess,
	onClose,
}) => {
	const [schedules, setschedules] = useState([]);
	const [scheduleIds, setIds] = useState([]);
	const [scheduleForm, setForm] = useState({
		name: '',
		...initschedule,
	});
	const [modalType, setType] = useState(initType); // create edit
	const [showModal, setShowModal] = useState(false);

	const getschedules = async (target_id) => {
		if (!targetId) {
			return false;
		}
		const res = await fetchSchedules('GET', {
			poem_id: target_id || targetId || '',
		});
		if (res && res.statusCode === 200) {
			const { existIds = [], list = [] } = res.data || {};
			setschedules(list);
			setIds(existIds);
		}
	};

	const handleSaveschedule = async () => {
		console.log('handleSaveschedule', scheduleForm);
		if (modalType == 'edit_schedule') {
			handleUpdateschedule();
			return false;
		}
		const { name } = scheduleForm;
		if (!name) {
			Taro.showToast({
				title: '请输入标题',
				icon: 'error',
				duration: 2000,
			});
			return false;
		}
		const res = await createSchedule('POST', {
			name: name,
		}).catch((err) => {
			console.log('createschedule', err);
			Taro.showToast({
				title: '创建失败',
				icon: 'error',
				duration: 2000,
			});
		});
		if (res && res.statusCode === 200) {
			if (modalType == 'create_schedule') {
				if (onSuccess && typeof onSuccess === 'function') {
					onSuccess();
				}
				setShowModal(false);
			} else {
				await getschedules(targetId);
				setType('edit');
			}
		}
	};

	const handleUpdateschedule = async () => {
		const { name, id } = scheduleForm;
		console.log('handleUpdateschedule', scheduleForm);
		if (!name) {
			Taro.showToast({
				title: '请输入标题',
				icon: 'error',
				duration: 2000,
			});
			return false;
		}
		await updateSchedule('POST', {
			name: name,
			id,
		}).catch((err) => {
			console.log('updateschedule', err);
			Taro.showToast({
				title: '更新失败',
				icon: 'error',
				duration: 2000,
			});
		});
		if (id) {
			await getschedules(targetId);
			setType('edit');
		}
	};

	const handleNameChange = (value = '') => {
		setForm({
			...scheduleForm,
			name: value.slice(0, 10),
		});
	};

	const handleClose = () => {
		if (onClose && typeof onClose === 'function') {
			onClose();
		}
		setShowModal(false);
	};

	const updateIds = (ids) => {
		setIds([...scheduleIds, ...ids]);
		getschedules(targetId);
	};

	useEffect(() => {
		console.log('---show', show);
		setShowModal(show);
		setType(initType);
		setForm({
			name: '',
			...initschedule,
		});
		if (show) {
			getschedules(targetId);
		}
	}, [show]);

	return (
		<FloatLoayout isOpen={showModal} showTitle={false} close={handleClose}>
			<View className='scheduleTitle'>
				<View className='title'>{titleObj[modalType] || '选择学习计划'}</View>
				{modalType == 'edit' ? (
					<View
						className='create text-btn'
						onClick={() => {
							setType('create');
						}}
					>
						+新建
					</View>
				) : (
					<View className='confirm btn' onClick={handleSaveschedule}>
						完成
					</View>
				)}
			</View>
			{/* 编辑收藏集 */}
			<view
				className='modalScheduleContent'
				style={{
					display: modalType == 'edit' ? 'block' : 'none',
				}}
			>
				{/* 选择列表 */}
				<ScrollView
					className='scheduleListContainer'
					scrollY
					style={{
						height: '600rpx',
					}}
				>
					{/* 计划列表 */}
					{schedules.map((item) => (
						<ScheduleItem
							key={item.id}
							poem_id={targetId}
							schedule_id={item.id}
							name={item.name}
							poem_count={item.poem_count}
							activeIds={scheduleIds}
							onSuccess={updateIds}
						/>
					))}
				</ScrollView>
			</view>
			{/* 新建学习计划 */}
			<view
				className='modalScheduleContent'
				style={{
					display: ['create', 'edit_schedule', 'create_schedule'].includes(
						modalType
					)
						? 'block'
						: 'none',
				}}
			>
				{/* 标题 */}
				<AtInput
					title=''
					type='text'
					className='name'
					placeholderClass='placeholder'
					placeholder='填写标题(10字以内)'
					value={scheduleForm.name}
					onChange={handleNameChange}
				/>
				{/* 其他创建方式 */}
				<View className='extra'>
					<Text>除了自定义学习计划</Text>
					<Text>还可以从人物「诗词分类」或「收藏集」直接创建</Text>
				</View>
			</view>
		</FloatLoayout>
	);
};

export default ScheduleModal;
