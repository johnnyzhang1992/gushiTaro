import { useState } from 'react';
import { View } from '@tarojs/components';
import { Tabs, TabPane } from '@nutui/nutui-react-taro';

import FloatLayout from '../../../../components/FloatLayout';
import LongTextCard from '../../../../components/LongTextCard';
import LikeButton from '../../../../components/LikeButton';
import CollectButton from '../../../../components/CollectButton';
import ScheduleButton from '../../../../components/ScheduleButton';

import './style.scss';

const FixBottom = (props) => {
	const { poemDetail = {}, poem = {} } = props;
	// 兼容新旧字段名：annotation/zhu = 注释, translation/yi = 译文
	const annotation = poemDetail.annotation || poemDetail.zhu || '';
	const translation = poemDetail.translation || poemDetail.yi || '';
	const poemId = poem.id || poem._id;
	const [show, showVisible] = useState(false);
	const [current, updateType] = useState(0);
	const tabList = [
		{
			title: '注释',
			type: 'zhushi',
		},
		{
			title: '译文',
			type: 'yi',
		},
		// {
		// 	title: '摘录',
		// 	type: 'sentences',
		// },
	];

	const handleTabChange = (val) => {
		updateType(val);
	};

	const handleTabClick = (val) => {
		updateType(val);
		showVisible(true);
	};

	const handleClickOverlay = () => {
		showVisible(false);
	};

	return (
		<View className='fixBottom'>
			<View className='bottomTabs flex'>
				<View
					className='tabItem'
					onClick={() => {
						handleTabClick(0);
					}}
				>
					注释
				</View>
				<View
					className='tabItem'
					onClick={() => {
						handleTabClick(1);
					}}
				>
					译文
				</View>
				<View className='tabItem'>
					<ScheduleButton id={poemId} showText />
				</View>
				<View className='right flex'>
					<View className='tabItem like'>
						<LikeButton
							type='poem'
							id={poemId}
							count={poem.like_count}
							status={poem.is_liked || poem.like_status}
							showText={false}
						/>
					</View>
					<View className='tabItem like'>
						<CollectButton
							type='poem'
							id={poemId}
							count={poem.collect_count}
							status={poem.is_favorited || poem.collect_status}
							showText={false}
						/>
					</View>
					{/* <View className='tabItem like'>加入学习</View> */}
				</View>
			</View>
			<FloatLayout
				showTitle={false}
				isOpen={show}
				close={handleClickOverlay}
				scrollY
			>
				<Tabs value={current} onChange={handleTabChange}>
					<TabPane title='注释'>
						<View className='tabContent'>
							<LongTextCard text={annotation} title='注释' showAll />
						</View>
					</TabPane>
					<TabPane title='译文'>
						<View className='tabContent'>
							<LongTextCard text={translation} title='译文' showAll />
						</View>
					</TabPane>
				</Tabs>
			</FloatLayout>
		</View>
	);
};

export default FixBottom;
