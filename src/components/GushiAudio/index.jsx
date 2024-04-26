import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect } from 'react';

import { getPoemList, updatePoemList, initPoem } from './util';
import './style.scss';

// 参数放外面，多个页面引入该组件，内容可共享
let poemList = [];
let currentPoem = { ...initPoem };

const GushiAudio = () => {
	// 路由记录
	const pages = Taro.getCurrentPages();
	// 当前页面路由信息
	console.log(pages[pages.length - 1]);

	const handlePoemAdd = (payload) => {
		console.log(payload, 'poemAudioAdd');
		currentPoem = {...payload}
		poemList = updatePoemList(poemList, payload);
		console.log(currentPoem, poemList);
	};

	useEffect(() => {
		poemList = getPoemList();
	}, []);

	useEffect(() => {
		Taro.eventCenter.on('poemAudioAdd', handlePoemAdd);
		return () => {
			Taro.eventCenter.off('poemAudioAdd', handlePoemAdd);
		};
	}, []);

	return (
		<View className='gushi-audio'>
			{/* 诗词内容展示区 */}
			<View className='gushi-content'>
				{/* 作者 */}
				{/* 标题 */}
				{/* 内容*/}
				{/* 是否展示拼音 */}
			</View>
			{/* 定时、语速等设置、加入诗单 */}
			{/* 播放器 */}
			<View className='audio-player'>
				{/* 进度条 */}
				<View className='player-progress'>{/* 当前时间、总时长 */}</View>
				{/* 操作区 */}
				<View className='operate-container'>
					{/* 播放模式、上一首、播放、暂停、下一首、列表 */}
				</View>
			</View>
		</View>
	);
};

export default GushiAudio;
