import { View } from '@tarojs/components';
// import { useNavigationBar } from 'taro-hooks';
// import { useState } from 'react';
import Taro, { useLoad, usePullDownRefresh } from '@tarojs/taro';

import PageHeader from '../../components/PageHeader';
import SectionCard from '../../components/SectionCard';
import WordCard from '../../components/Dictionary/WordCard';

import DictionaryContainer from '../../components/Dictionary/DictionaryContainer';

import './style.scss';

const PostPage = () => {
	useLoad((options) => {
		console.log(options);
	});
	usePullDownRefresh(() => {
		Taro.stopPullDownRefresh();
	});
	// 词牌示例卡片 → 按标题搜索该词牌（词作标题形如「浣溪沙·xxx」）
	const goToCipaiSearch = (name) => {
		Taro.navigateTo({
			url: `/pages/poem/index?type=title&keyWord=${encodeURIComponent(name)}`,
		});
	};
	const goFeihua = () => {
		Taro.navigateTo({ url: '/pages/find/feihua' });
	};
	return (
		<View className='page findPage'>
			<PageHeader title='发现' />
			<View className='divide' />
			{/* 随机探索 */}
			{/* <RandomSearch /> */}
			<DictionaryContainer params={{}} />
			{/* 词牌 */}
			<SectionCard
				title='词牌'
				titleClick={() => Taro.navigateTo({ url: '/pages/find/cipai' })}
			>
				<View className='cardContent'>
					<WordCard text='如梦令' onClick={() => goToCipaiSearch('如梦令')} />
					<WordCard text='浣溪沙' onClick={() => goToCipaiSearch('浣溪沙')} />
				</View>
			</SectionCard>
			{/* 飞花 */}
			<SectionCard title='飞花令' titleClick={goFeihua}>
				<View className='cardContent'>
					<WordCard text='日' onClick={goFeihua} />
					<WordCard text='月' onClick={goFeihua} />
				</View>
			</SectionCard>
			{/* 诗单 */}
			{/* <View className='sectionCard'>
				<View className='cardTitle'>诗单</View>
				<View className='cardContent'></View>
			</View> */}
			{/* 小知识 */}
			{/* <View className='sectionCard'>
				<View className='cardTitle'>小知识</View>
				<View className='cardContent'></View>
			</View> */}
		</View>
	);
};

export default PostPage;
