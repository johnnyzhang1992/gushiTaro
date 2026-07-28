import { View, Text } from '@tarojs/components';
import { Home, Search, User, ArrowLeft, List2 } from '@nutui/icons-react-taro';
import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import RootFixed from '../RootFixed';

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
			case 'me':
				Taro.switchTab({
					url: '/pages/me/index',
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
		<RootFixed>
			<View className='fabButton' style={style}>
				{show ? (
					<View className='apps'>
						<View
							className='appItem'
							data-type='home'
							onClick={handleClick}
						>
							<Text className='text'>首页</Text>
							<Home size='20' color='#fff' />
						</View>
						<View
							className='appItem'
							data-type='search'
							onClick={handleClick}
						>
							<Text className='text'>搜索</Text>
							<Search size='20' color='#fff' />
						</View>
						<View
							className='appItem'
							data-type='me'
							onClick={handleClick}
						>
							<Text className='text'>我的</Text>
							<User size='20' color='#fff' />
						</View>
						<View
							className='appItem'
							data-type='return'
							onClick={handleClick}
						>
							<Text className='text'>返回</Text>
							<ArrowLeft size='20' color='#fff' />
						</View>
					</View>
				) : null}
				<View className='fab_btn' onClick={handleFabClick}>
					<List2 size='24' color='#fff' />
				</View>
			</View>
		</RootFixed>
	);
};

export default React.memo(FabButton);
