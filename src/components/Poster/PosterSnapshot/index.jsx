import { View, Text, Image } from '@tarojs/components';
import { useState, useEffect } from 'react';

import PoemPosterCard from '../PoemPoster';

import xcxPng from '../../../images/xcx.jpg';
import Utils from '../../../utils/util';
import { getAuthkey } from '../../../utils/alioss';

import './style.scss';

const shenianDate = new Date('2026/02/17 00:00:00');

const PosterSnapshot = (props) => {
	const {
		sentence,
		posterConfig,
		safeArea,
		showDate = true,
		isReload = false,
	} = props;

	const [date] = useState(() => {
		return Utils.formatDate().join('/');
	});

	const [bgImg, setBgImg] = useState('');

	const nongliText = new Date() > shenianDate ? '丙午马年' : '乙巳蛇年';

	const updateBgImg = (url) => {
		const authKey = getAuthkey(url);
		setBgImg(url + '?auth_key=' + authKey);
	};

	useEffect(() => {
		if (props.bgImg) {
			updateBgImg(props.bgImg);
		}
	}, [props.bgImg]);

	return (
		<View
			className={`poster-snapshot ${isReload ? 'remove' : ''}`}
			style={{
				padding: 10,
				backgroundColor: posterConfig.bgColor || '#fff',
				color: posterConfig.fontColor || '#333',
				backgroundImage: `${bgImg ? `url(${bgImg})` : 'unset'}`,
			}}
		>
			{/* 主体内容 */}
			<View className='container'>
				<PoemPosterCard
					bgColor={posterConfig.bgColor || '#fff'}
					sentence={sentence}
					fontColor={posterConfig.fontColor}
					width={safeArea.width - 40}
					type={posterConfig.type}
					mode={posterConfig.ratio === 0.75 ? 'post' : 'bg'}
				/>
			</View>
			{/* 底部日期和小程序码 */}
			<View
				className='bottom'
				style={{
					display: posterConfig.showQrcode ? 'flex' : 'none',
				}}
			>
				<View
					className='date'
					style={{
						visibility: showDate ? 'visible' : 'hidden',
					}}
				>
					<View className='yangli'>
						<Text className='text'>{date}</Text>
					</View>
					<View className='nongli'>
						<Text className='text'>{nongliText}</Text>
					</View>
				</View>
				<View className='desc'>
					<Image src={xcxPng} showMenuByLongpress className='xcxImg' />
				</View>
			</View>
		</View>
	);
};

export default PosterSnapshot;
