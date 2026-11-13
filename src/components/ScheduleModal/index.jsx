import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import { Input } from '@nutui/nutui-react-taro';
import { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import FloatLoayout from '../../components/FloatLayout';
import { userIsLogin } from '../../utils/auth';
import {
	fetchStudyPlans,
	createStudyPlan,
	updateStudyPlan,
	addPoemsToStudyPlan,
	removePoemFromStudyPlan,
} from '../../services/study';


import './style.scss';
import { isApiSuccess, getApiData } from '../../apis/response';

const titleObj = {
	create: '新建背诵计划',
	edit: '加入背诵计划',
	edit_schedule: '编辑背诵计划',
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
	const addingRef = useRef(false);

	const handleRemovePoem = () => {
		Taro.showModal({
			title: '确认移除',
			content: `确定要从「${name}」中移除这首诗吗？`,
			confirmColor: '#e64340',
			success: (res) => {
				if (res.confirm) {
					removePoemFromStudyPlan('DELETE', {
						schedule_id,
						poem_id,
					}).then((res) => {
						if (isApiSuccess(res)) {
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
		if (addingRef.current) {
			return;
		}
		addingRef.current = true;
		addPoemsToStudyPlan('POST', {
			poem_ids: [poem_id],
			schedule_id,
			schedule_name: name,
		})
			.then((res) => {
				if (isApiSuccess(res)) {
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
			})
			.finally(() => {
				addingRef.current = false;
			});
	};
	return (
		<View className='sheet-row'>
			<View className='sheet-row-main'>
				<Text className='sheet-row-title'>{name}</Text>
				<Text className='sheet-row-meta'>{poem_count || 0} 篇</Text>
			</View>
			<View
				className={`sheet-row-action ${isAdded ? 'muted' : ''}`}
				onClick={isAdded ? handleRemovePoem : handleAddPoem}
			>
				{isAdded ? '移除' : '加入'}
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
		description: '',
		...initschedule,
		id: initschedule.id || initschedule._id,
	});
	const [modalType, setType] = useState(initType); // create edit
	const [showModal, setShowModal] = useState(false);
	const [nameError, setNameError] = useState('');
	const [nameFocused, setNameFocused] = useState(false);
	const [descFocused, setDescFocused] = useState(false);

	const getschedules = async (target_id) => {
		const res = await fetchStudyPlans('GET', {
			poem_id: targetId || '',
		})
			.catch((err) => {
				console.log('getschedules', err);
				return null;
			});
		if (isApiSuccess(res)) {
			const apiData = getApiData(res);
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
		if (modalType == 'edit_schedule') {
			handleUpdateschedule();
			return false;
		}
		const { name } = scheduleForm;
		if (!name || !String(name).trim()) {
			setNameError('给计划起个名字吧');
			return false;
		}
		if (String(name).trim().length < 2) {
			setNameError('标题不能少于 2 个字');
			return false;
		}
		setNameError('');
		const res = await createStudyPlan('POST', {
			name: name,
			description: (scheduleForm.description || '').trim(),
		}).catch((err) => {
			console.log('createschedule', err);
			Taro.showToast({
				title: '创建失败',
				icon: 'error',
				duration: 2000,
			});
		});
		if (isApiSuccess(res)) {
			await getschedules(targetId);
			setType('edit');
			if (onSuccess && typeof onSuccess === 'function') {
				onSuccess();
			}
		}
	};

	const handleUpdateschedule = async () => {
		const { name, id } = scheduleForm;
		if (!name || String(name).trim().length < 2) {
			setNameError(!name ? '给计划起个名字吧' : '标题不能少于 2 个字');
			return false;
		}
		setNameError('');
		const res = await updateStudyPlan('PUT', {
			name: name,
			description: (scheduleForm.description || '').trim(),
			id,
		}).catch((err) => {
			console.log('updateschedule', err);
			Taro.showToast({
				title: '更新失败',
				icon: 'error',
				duration: 2000,
			});
		});
		if (isApiSuccess(res)) {
			setShowModal(false);
			if (onSuccess && typeof onSuccess === 'function') {
				onSuccess();
			}
		}
	};

	const handleNameChange = (value = '') => {
		if (nameError) setNameError('');
		setForm({
			...scheduleForm,
			name: value.slice(0, 10),
		});
	};

	const handleDescChange = (value = '') => {
		setForm({
			...scheduleForm,
			description: value.slice(0, 60),
		});
	};

	const handleClose = () => {
		if (onClose && typeof onClose === 'function') {
			onClose();
		}
		setShowModal(false);
	};

	// 取消新建/编辑：新建态回到计划列表，其余关闭弹层
	const handleCancelForm = () => {
		if (modalType === 'create') {
			setForm({ name: '', description: '' });
			setType('edit');
			return;
		}
		handleClose();
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
			description: '',
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
			<View className='sheet'>
				<View className='sheet-header'>
					<Text className='sheet-title'>{titleObj[modalType] || '选择背诵计划'}</Text>
					{modalType === 'edit' ? (
						<View className='sheet-actions'>
							<View className='sheet-link' onClick={() => setType('create')}>
								＋ 新建
							</View>
						</View>
					) : (
						<View className='sheet-actions'>
							<View className='sheet-btn cancel' onClick={handleCancelForm}>
								取消
							</View>
							<View className='sheet-btn confirm' onClick={handleSaveschedule}>
								{modalType === 'edit_schedule' ? '保存' : '创建'}
							</View>
						</View>
					)}
				</View>

				{/* 计划列表 */}
				{modalType === 'edit' ? (
					<View className='sheet-body'>
						{schedules.length === 0 ? (
							<View className='sheet-empty'>还没有背诵计划，点右上角「新建」创建一个</View>
						) : (
							<ScrollView className='sheet-scroll' scrollY showScrollbar={false}>
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
						)}
					</View>
				) : null}

				{/* 新建 / 编辑表单 */}
				{['create', 'create_schedule', 'edit_schedule'].includes(modalType) ? (
					<View className='sheet-body' style={{ paddingBottom: '40rpx' }}>
						<View className='sheet-field'>
							<View className='sheet-field-head'>
								<Text className='sheet-label'>标题</Text>
								<Text className='sheet-count'>{scheduleForm.name.length}/10</Text>
							</View>
							<Input
								className={`sheet-input ${nameFocused ? 'focused' : ''}`}
								maxLength={10}
								value={scheduleForm.name}
								placeholder='给计划起个名字'
								placeholderClass='sheet-placeholder'
								onFocus={() => setNameFocused(true)}
								onBlur={() => setNameFocused(false)}
								onChange={(val) => handleNameChange(val)}
							/>
							{nameError ? (
								<Text className='sheet-error'>{nameError}</Text>
							) : (
								<Text className='sheet-hint'>最多 10 个字</Text>
							)}
						</View>

						<View className='sheet-field'>
							<View className='sheet-field-head'>
								<Text className='sheet-label'>描述（可选）</Text>
								<Text className='sheet-count'>
									{(scheduleForm.description || '').length}/60
								</Text>
							</View>
							<Textarea
								className={`sheet-textarea ${descFocused ? 'focused' : ''}`}
								maxlength={60}
								autoHeight
								placeholder='背诵目标、范围或提示…'
								placeholderClass='sheet-placeholder'
								value={scheduleForm.description || ''}
								onFocus={() => setDescFocused(true)}
								onBlur={() => setDescFocused(false)}
								onInput={(e) => handleDescChange(e.detail.value)}
							/>
						</View>
					</View>
				) : null}
			</View>
		</FloatLoayout>
	);
};

export default ScheduleModal;
