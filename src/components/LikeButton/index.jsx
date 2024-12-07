import { View, Image, Text } from '@tarojs/components';
import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';

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
				} else {
					Taro.showToast({
						title: errors || '操作失败',
						icon: 'none',
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
