import { View, Image, Text } from '@tarojs/components';
import React, { useState, useEffect } from 'react';

import collectSvg from '../../images/svg/collect.svg';
import collectActiveSvg from '../../images/svg/collect_active.svg';

import { updateUserCollect } from '../../services/global';

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
		updateUserCollect('POST', {
			type,
			id,
		}).then((res) => {
			if (res && res.statusCode === 200) {
				const { status: resStatus, num: resCount } = res.data;
				setStatus(resStatus);
				setCount(resCount);
				if (typeof updateStatus === 'function') {
					updateStatus(resStatus, resCount);
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
