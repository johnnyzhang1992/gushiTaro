import React, { useEffect, useState, useRef } from 'react';
import { View, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './style.scss';

import Boat from '../../images/boat.png';

const FindHeader = () => {
	const [animationData, setAnamation] = useState({});
	const timer = useRef(null);

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
		<View className='header'>
			<View className='header-bottom'>
				<View animation={animationData} className='boat-container'>
					<Image className='boat' src={Boat} />
				</View>
			</View>
		</View>
	);
};

export default React.memo(FindHeader);
