import { View, Text } from '@tarojs/components';
import { AtFab, AtIcon } from 'taro-ui';
import React, { useState } from 'react';
import Taro from '@tarojs/taro';

import './style.scss';

const FabButton = ({ style }) => {
	const [show, showVisible] = useState(false);

	const handleFabClick = () => {
		showVisible((pre) => !pre);
	};

	const handleClick = (e) => {
		const { type } = e.currentTarget.dataset;
		console.log('click--type', type);
		switch (type) {
			case 'home':
				Taro.switchTab({
					url: '/pages/index',
				});
				break;
			case 'search':
				Taro.switchTab({
					url: '/pages/search/index',
				});
				break;
			case 'collect':
				Taro.navigateTo({
					url: '/pages/me/collection',
				});
				break;
			case 'return':
				Taro.navigateBack();
				break;
			default:
				Taro.switchTab({
					url: '/pages/index',
				});
		}
	};
	return (
		<View className='fabButton' style={style}>
			{show ? (
				<View className='apps'>
					<View
						className='appItem'
						data-type='home'
						onClick={handleClick}
					>
						<Text className='text'>首页</Text>
						<AtIcon
							value='home'
							size='20'
							color='#fff'
							className='icon'
						/>
						{/* <View className='at-icon at-icon-home'></View> */}
					</View>
					<View
						className='appItem'
						data-type='search'
						onClick={handleClick}
					>
						<Text className='text'>搜索</Text>
						<AtIcon
							value='search'
							size='20'
							color='#fff'
							className='icon'
						/>
						{/* <View
							className='icon at-icon at-icon-search'
							color=''
						></View> */}
					</View>
					<View
						className='appItem'
						data-type='collect'
						onClick={handleClick}
					>
						<Text className='text'>收藏</Text>
						<AtIcon
							value='heart'
							size='20'
							color='#fff'
							className='icon'
						/>
						{/* <View className='at-icon at-icon-heart'></View> */}
					</View>
					<View
						className='appItem'
						data-type='return'
						onClick={handleClick}
					>
						<Text className='text'>返回</Text>
						<AtIcon
							value='chevron-left'
							size='20'
							color='#fff'
							className='icon'
						/>
						{/* <View className='at-icon at-icon-chevron-left'></View> */}
					</View>
				</View>
			) : null}
			<AtFab size='small' onClick={handleFabClick}>
				<Text className='at-fab__icon at-icon at-icon-menu'></Text>
			</AtFab>
		</View>
	);
};

export default React.memo(FabButton);
