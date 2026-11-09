import { View, Text, Image } from '@tarojs/components';
import { useState, useEffect } from 'react';

import PoemPosterCard from '../PoemPoster';

import xcxPng from '../../../images/xcx.jpg';
import Utils from '../../../utils/util';
import { getAuthkey } from '../../../utils/alioss';

import './style.scss';

// 近年春节（农历正月初一）日期表，用于判断当前农历年；超出表范围返回空串
const SPRING_FESTIVAL_DATES = [
	'2024-02-10', '2025-01-29', '2026-02-17', '2027-02-06', '2028-01-26', '2029-02-13',
	'2030-02-03', '2031-01-23', '2032-02-11', '2033-01-31', '2034-02-19', '2035-02-08', '2036-01-28',
];

const getLunarYearText = (now) => {
	let lunarYear = null;
	for (let i = SPRING_FESTIVAL_DATES.length - 1; i >= 0; i--) {
		const start = new Date(SPRING_FESTIVAL_DATES[i].replace(/-/g, '/') + ' 00:00:00');
		if (now >= start) {
			lunarYear = 2024 + i;
			break;
		}
	}
	if (!lunarYear) {
		return '';
	}
	const stems = '甲乙丙丁戊己庚辛壬癸';
	const branches = '子丑寅卯辰巳午未申酉戌亥';
	const animals = '鼠牛虎兔龙蛇马羊猴鸡狗猪';
	const idx = lunarYear - 4;
	return stems[idx % 10] + branches[idx % 12] + animals[idx % 12] + '年';
};

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

	const nongliText = getLunarYearText(new Date());

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
