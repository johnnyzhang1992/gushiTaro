import { View, Image, Text } from '@tarojs/components';
import React, { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';

import collectSvg from '../../images/svg/collect.svg';
import collectActiveSvg from '../../images/svg/collect_active.svg';
import { updateUserCollect } from '../../services/global';
import { userIsLogin } from '../../utils/auth';

import './style.scss';
import { isApiSuccess, getApiData } from '../../apis/response';

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
	const submittingRef = useRef(false);

	const handleToggle = async () => {
		if (!userIsLogin()) return;
		if (submittingRef.current) return;
		submittingRef.current = true;

		const res = await updateUserCollect('POST', {
			target_id: String(id),
			target_type: type,
		})
			.catch((err) => {
				Taro.showToast({
					title: (err && (err.errmsg || err.errMsg)) || '操作失败',
					icon: 'none',
					duration: 1500,
				});
				return null;
			})
			.finally(() => {
				submittingRef.current = false;
			});

		if (isApiSuccess(res)) {
			const apiData = getApiData(res);
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
