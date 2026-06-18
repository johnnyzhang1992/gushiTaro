import { View, Image, Text } from '@tarojs/components';
import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';

import collectSvg from '../../images/svg/collect.svg';
import collectActiveSvg from '../../images/svg/collect_active.svg';
import { updateUserCollect } from '../../services/global';
import { userIsLogin } from '../../utils/auth';

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

	const [collectStatus, setStatus] = useState(status);
	const [collectCount, setCount] = useState(count || 0);

	const handleToggle = async () => {
		if (!userIsLogin()) return;

		const res = await updateUserCollect('POST', {
			target_id: String(id),
			target_type: type,
		}).catch(() => null);

		if (res && res.statusCode === 200) {
			const apiData = res.data?.data || res.data;
			const newStatus = apiData?.isFavorited !== undefined ? apiData.isFavorited : apiData?.status;
			setStatus(newStatus);
			setCount(newStatus ? collectCount + 1 : Math.max(0, collectCount - 1));
			if (typeof updateStatus === 'function') {
				updateStatus(newStatus, newStatus ? collectCount + 1 : Math.max(0, collectCount - 1));
			}
			Taro.showToast({
				title: newStatus ? '收藏成功' : '已取消收藏',
				icon: 'none',
				duration: 1500,
			});
		}
	};

	useEffect(() => {
		setCount(props.count);
	}, [props.count]);

	useEffect(() => {
		setStatus(props.status);
	}, [props.status]);

	return (
		<View className={`collectButton ${collectStatus ? 'active' : ''}`}>
			<View className='buttonContainer collect' onClick={handleToggle}>
				<Image
					src={collectStatus ? collectSvg : collectActiveSvg}
					className='icon'
				/>
				{showText ? (
					<Text className='collectText'>{text || '收藏'}</Text>
				) : null}
				<Text className='count'>{collectCount}</Text>
			</View>
		</View>
	);
};

export default React.memo(CollectButton);
