import { View } from '@tarojs/components';
import Taro, { Events } from '@tarojs/taro';
import { useEffect, useState } from 'react';

import './style.scss';

const GushiAudio = () => {
	// 路由记录
	const pages = Taro.getCurrentPages();
	// 当前页面路由信息
	console.log(pages[pages.length - 1]);
	// 古诗详情
	const [poem, updatePoem] = useState({
		author_name: '',
		dynasty: '',
		auduo_url: '',
		content: [],
		xu: '',
		id: '',
	});
	// 播放列表
	const [poemList, updateList] = useState([]);
	const events = new Events();

	const handlePoemAdd = (payload) => {
		console.log(payload);
		if (!poem.id) {
			updatePoem(payload);
		}
		updateList([...poemList, payload]);
	};

	useEffect(() => {
		events.on('poemAdd', handlePoemAdd);
		return () => {
			events.off('poemAdd', handlePoemAdd);
		};
	});
	// // 触发一个事件，传参
	// events.trigger('eventName', {});
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
