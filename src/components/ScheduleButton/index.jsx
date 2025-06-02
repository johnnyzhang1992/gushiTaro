import { View, Image, Text } from '@tarojs/components';
import React, { useState } from 'react';

import ScheduleModal from '../ScheduleModal';

import scheduleSvg from '../../images/svg/schedule.svg';

import './style.scss';

const ScheduleButton = (props) => {
	const { id, showText = false, text = '学习计划' } = props;

	const [showModal, setShowModal] = useState(false);

	const handleModalShow = () => {
		setShowModal(true);
	};

	const onClose = () => {
		setShowModal(false);
	};

	return (
		<View className='scheduleButton'>
			<View className='buttonContainer schedule' onClick={handleModalShow}>
				<Image src={scheduleSvg} className='icon' />
				{showText ? <Text className='text'>{text || '学习计划'}</Text> : null}
			</View>
			{/* 学习计划弹窗 */}
			<ScheduleModal
				targetId={id}
				initType='edit'
				show={showModal}
				onClose={onClose}
			></ScheduleModal>
		</View>
	);
};

export default React.memo(ScheduleButton);
