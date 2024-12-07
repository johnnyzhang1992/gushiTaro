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
	// type 来源类型 poem author sentence
	// status 初始状态
	// count 喜爱或者收藏数量
	const [collectStatus, setStatus] = useState(status);
	const [collectCount, setCount] = useState(count || 0);

	const handleStatusChange = () => {
		console.log('type,id:', type, id);
		const isLogin = userIsLogin();
		if (!isLogin) {
			return false;
		}
		updateUserCollect('POST', {
			status: collectStatus ? 1 : 0,
			type,
			target_id: id,
		}).then((res) => {
			if (res && res.statusCode === 200) {
				const {
					status: resStatus,
					num: resCount,
					errors,
					error_code,
				} = res.data;
				if (!error_code) {
					setStatus(resStatus);
					setCount(resCount);
					if (typeof updateStatus === 'function') {
						updateStatus(resStatus, resCount);
					}
					if (resStatus) {
						Taro.showToast({
							title: '收藏成功！记得常常温习哦',
							icon: 'none',
							duration: 2000,
						});
					}
				} else {
					Taro.showToast({
						title: errors || '操作失败',
						icon: 'error',
						duration: 2000,
					});
				}
			}
		});
	};

	useEffect(() => {
		setCount(props.count);
	}, [props.count]);

	useEffect(() => {
		setStatus(props.status);
	}, [props.status]);

	return (
		<View
			className={`collectButton ${collectStatus ? 'active' : ''}`}
			onClick={handleStatusChange}
		>
			<Image
				src={collectStatus ? collectSvg : collectActiveSvg}
				className='icon'
			/>
			{showText ? (
				<Text className='collectText'>{text || '收藏'}</Text>
			) : null}
			<Text className='count'>{collectCount}</Text>
		</View>
	);
};

export default React.memo(CollectButton);
