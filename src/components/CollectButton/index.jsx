import { View, Image, Text } from '@tarojs/components';
import React, { useState, useEffect } from 'react';

import CollectionModal from '../CollectionModal';
import collectSvg from '../../images/svg/collect.svg';
import collectActiveSvg from '../../images/svg/collect_active.svg';

import './style.scss';

const CollectButton = (props) => {
	const {
		id,
		status = false,
		type = 'poem',
		count = 0,
		showText = false,
		text = '收藏',
		updateStatus,
	} = props;

	// type 来源类型 poem author sentence
	// status 初始状态 0 未收藏 1 已收藏
	// count 喜爱或者收藏数量
	const [collectStatus, setStatus] = useState(status);
	const [collectCount, setCount] = useState(count || 0);
	const [showModal, setShowModal] = useState(false);
	const handleModalShow = () => {
		setShowModal(true);
	};
	const onSuccess = (resStatus, resCount) => {
		setStatus(resStatus);
		setCount(resCount);
		setShowModal(false);
		if (typeof updateStatus === 'function') {
			updateStatus(resStatus, resCount);
		}
	};
	const onClose = () => {
		setShowModal(false);
	};
	useEffect(() => {
		setCount(props.count);
	}, [props.count]);

	useEffect(() => {
		setStatus(props.status);
	}, [props.status]);

	return (
		<View className={`collectButton ${collectStatus ? 'active' : ''}`}>
			<View className='buttonContainer collect' onClick={handleModalShow}>
				<Image
					src={collectStatus ? collectSvg : collectActiveSvg}
					className='icon'
				/>
				{showText ? (
					<Text className='collectText'>{text || '收藏'}</Text>
				) : null}
				<Text className='count'>{collectCount}</Text>
			</View>
			{/* 收藏集弹窗 */}
			<CollectionModal
				targetId={id}
				type={type}
				initType='edit'
				show={showModal}
				onSuccess={onSuccess}
				onClose={onClose}
			></CollectionModal>
		</View>
	);
};

export default React.memo(CollectButton);
