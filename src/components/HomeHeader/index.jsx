import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, Image, Navigator } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './style.scss';

import Boat from '../../images/boat.png';
import Utils from '../../utils/util';
import { fetchRandomSentence } from '../../services/global';

const HomeHeader = () => {
	const [date] = useState(Utils.formatDateToMb());
	const [sentence, setSentence] = useState({});
	const [animationData, setAnamation] = useState({});
	const timer = useRef(null);

	const fetchSentence = useCallback(() => {
		const [year, m, d] = Utils.formatDate(new Date());
		const currentDate = `${year}/${m}/${d}`;
		const localSentence = Taro.getStorageSync('home_senetnce');
		if (localSentence && localSentence.date == currentDate) {
			setSentence(localSentence.data);
			return false;
		}
		fetchRandomSentence()
			.then((res) => {
				console.log(res);
				if (res && res.statusCode == 200) {
					setSentence(res.data[0]);
					Taro.setStorageSync('home_senetnce', {
						date: currentDate,
						data: res.data[0],
					});
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	useEffect(() => {
		fetchSentence();
	}, [fetchSentence]);

	useEffect(() => {
		let sysInfo = Taro.getWindowInfo();
		let winWidth = sysInfo.windowWidth;
		console.log(winWidth, 'width');
		timer.current = setInterval(() => {
			let animation = Taro.createAnimation({
				duration: 20000,
				timingFunction: 'ease-in-out',
			});
			//动画的脚本定义必须每次都重新生成，不能放在循环外
			animation
				.translateX(winWidth - 50)
				.step({ duration: 10000 })
				.translateX(10)
				.step({ duration: 10000 });
			// 更新数据
			setAnamation(animation.export());
		}, 20000);
		return () => {
			clearInterval(timer.current);
		};
	}, []);

	return (
		<View className='home-header'>
			<View className='container'>
				<View className='header-content'>
					<View>每日一诗</View>
					<View className='date'>{date[2]}</View>
					<Navigator
						url={`/pages/sentence/detail?id=${sentence.id}`}
						className='sentence'
						hoverClass='none'
					>
						{sentence.title || ''}
					</Navigator>
				</View>
				<View className='date-container'>
					<View className='day'>{date[0]}</View>
					<View className='hour'>{date[1]}</View>
				</View>
			</View>
			<View animation={animationData} className='boat-container'>
				<Image className='boat' src={Boat} />
			</View>
		</View>
	);
};

export default React.memo(HomeHeader);
