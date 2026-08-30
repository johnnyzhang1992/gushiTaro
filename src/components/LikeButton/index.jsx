import { View, Image, Text } from '@tarojs/components';
import React, { useState, useEffect } from 'react';

import likeSvg from '../../images/svg/like.svg';
import likeActiveSvg from '../../images/svg/like_active.svg';

import { updateUserLike } from '../../services/global';
import { userIsLogin } from '../../utils/auth';

import './style.scss';

const LikeButton = (props) => {
	const {
		id,
		status = false,
		type = 'poem',
		count = 0,
		showText = false,
		text = '喜欢',
		updateStatus,
	} = props;
	// type 来源类型 poem author sentence
	// status 初始状态
	// count 喜爱或者收藏数量
	const [likeStatus, setStatus] = useState(status);
	const [likeCount, setCount] = useState(count || 0);

	const handleStatusChange = () => {
		console.log('type,id:', type, id);
		const isLogin = userIsLogin();
		if (!isLogin) {
			return false;
		}
		updateUserLike('POST', {
			status: likeStatus ? 1 : 0,
			target_type: type,
			target_id: id,
		}).then((res) => {
			const apiData = res.data?.data || res.data;
			if (res && res && res.status) {
				// 兼容新旧格式
				const newStatus = apiData?.isLiked !== undefined ? apiData.isLiked : apiData?.status;
				const newCount = apiData?.num !== undefined ? apiData.num : (likeCount + (newStatus ? 1 : -1));
				setStatus(newStatus);
				setCount(newCount);
				if (typeof updateStatus === 'function') {
					updateStatus(newStatus, newCount);
				}
			}
		})
	};

	useEffect(() => {
		setCount(props.count);
	}, [props.count]);

	useEffect(() => {
		setStatus(props.status);
	}, [props.status]);

	return (
		<View
			className={`likeButton ${likeStatus ? 'active' : ''}`}
			onClick={handleStatusChange}
		>
			<Image
				src={likeStatus ? likeSvg : likeActiveSvg}
				className='icon'
			/>
			{showText ? (
				<Text className='likeText'>{text || '喜欢'}</Text>
			) : null}
			<Text className='count'>{likeCount}</Text>
		</View>
	);
};

export default React.memo(LikeButton);
