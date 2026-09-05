import { View, Text, ScrollView } from '@tarojs/components';
import { Input } from '@nutui/nutui-react-taro';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import Request from '../../apis/request';

import FloatLoayout from '../../components/FloatLayout';
import { userIsLogin } from '../../utils/auth';
import {
	fetchSchedules,
	createSchedule,
	updateSchedule,
	addPoemToSchedule,
} from '../../services/global';

import './style.scss';

// 删除学习计划中的诗词
const removePoemFromSchedule = (method = 'DELETE', data) => {
	return Request(`/api/study-plans/${data.schedule_id || data.id}/items/${data.poem_id || data.poemId}`, data, method);
};

const titleObj = {
	create: '新建学习计划',
	edit: '加入学习计划',
	edit_schedule: '编辑学习计划',
};

const ScheduleItem = (props) => {
	const {
		schedule_id,
		poem_id,
		poem_count,
		name,
		has_poem = false,
		activeIds = [],
		onSuccess,
	} = props;
	
	const isAdded = has_poem || activeIds.includes(schedule_id);
	
	const handleRemovePoem = () => {
		Taro.showModal({
			title: '确认移除',
			content: `确定要从「${name}」中移除这首诗吗？`,
			confirmColor: '#e64340',
			success: (res) => {
				if (res.confirm) {
					removePoemFromSchedule('DELETE', {
						schedule_id,
						poem_id,
					}).then((res) => {
						if (res && res.status) {
							Taro.showToast({ title: '已移除', icon: 'success' });
							if (onSuccess && typeof onSuccess === 'function') {
								onSuccess([]);
							}
						}
					}).catch(() => {
						Taro.showToast({ title: '移除失败', icon: 'none' });
					});
				}
			},
		});
	};

	const handleAddPoem = async () => {
		if (isAdded) {
			Taro.showToast({ title: '已加入该计划', icon: 'none' });
			return;
		}
		addPoemToSchedule('POST', {
			poem_ids: [poem_id],
			schedule_id,
			schedule_name: name,
		})
			.then((res) => {
				if (res && res.status) {
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
			className={`schedule-item ${isAdded ? 'active' : ''}`}
		>
			<View className='schedule-item__content'>
				<View className='schedule-item__title'>
					<Text>{name}</Text>
				</View>
				<View className='schedule-item__poem_count'>
					<Text>{poem_count || 0}篇</Text>
				</View>
			</View>
			<View className='schedule-item__btn' onClick={isAdded ? handleRemovePoem : handleAddPoem}>
				<Text>{isAdded ? '移除' : '加入'}</Text>
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
		id: initschedule.id || initschedule._id,
	});
	const [modalType, setType] = useState(initType); // create edit
	const [showModal, setShowModal] = useState(false);

	const getschedules = async (target_id) => {
		const res = await fetchSchedules('GET', {
			poem_id: targetId || '',
		});
		if (res && res.status) {
			const apiData = res.data?.data || res.data;
			// API 返回数组或 { existIds, list }
			if (Array.isArray(apiData)) {
				setschedules(apiData);
				setIds([]);
			} else {
				const { existIds = [], list = [] } = apiData || {};
				setschedules(list);
				setIds(existIds);
			}
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
			setType('edit')
			return false
		}
		if (String(name).trim().length < 2) {
			const message = '标题不能少于2个字';
			Taro.showToast({
				title: message,
				icon: 'none',
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
		if (res && res.status) {
			await getschedules(targetId);
			setType('edit');
			if (onSuccess && typeof onSuccess === 'function') {
				onSuccess();
			}
		}
	};

	const handleUpdateschedule = async () => {
		const { name, id } = scheduleForm;
		console.log('handleUpdateschedule', scheduleForm);
		if (!name || String(name).trim().length < 2) {
			const message  = !name ? '请输入标题' : '标题不能少于2个字';
			Taro.showToast({
				title: message,
				icon: 'error',
				duration: 2000,
			});
			return false;
		}
		const res = await updateSchedule('POST', {
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
		if (res && res.status) {
			setShowModal(false);
			if (onSuccess && typeof onSuccess === 'function') {
				onSuccess();
			}
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
			// 未登录不打开浮层（userIsLogin 内部会引导登录）
			if (!userIsLogin()) {
				handleClose();
				return;
			}
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
			{/* 编辑诗单 */}
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
							key={item._id || item.id}
							poem_id={targetId}
							schedule_id={item._id || item.id}
							name={item.name}
							poem_count={item.poem_count}
							has_poem={item.has_poem}
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
				<Input
					className='name'
					maxLength={10}
					placeholder='填写标题(10字以内)'
					value={scheduleForm.name}
					onChange={(val) => handleNameChange(val)}
				/>
				{/* 其他创建方式 */}
				{/* <View className='extra'>
					<Text>除了自定义学习计划</Text>
					<Text>还可以从人物「诗词分类」或「诗单」直接创建</Text>
				</View> */}
			</view>
		</FloatLoayout>
	);
};

export default ScheduleModal;
