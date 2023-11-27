import { useState } from 'react';
import { PageContainer, View } from '@tarojs/components';
import { AtTabs, AtTabsPane } from 'taro-ui';

import LongTextCard from '../../../../components/LongTextCard';

import './style.scss';

const FixBottom = (props) => {
	const { detail = { yi: '', zhu: '' } } = props;
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
		console.log(val, 'index');
		updateType(val);
	};

	const handleTabClick = (val) => {
		console.log(val, 'index');
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
				{/* <View
					className='tabItem'
					onClick={() => {
						handleTabClick(2);
					}}
				>
					摘录
				</View> */}
				<View className='right flex'>
					<View className='tabItem like'>喜欢</View>
					<View className='tabItem like'>收藏</View>
					{/* <View className='tabItem like'>加入学习</View> */}
				</View>
			</View>
			<PageContainer
				show={show}
				overlay
				zIndex={99}
				position='bottom'
				onClickOverlay={handleClickOverlay}
			>
				<AtTabs
					current={current}
					tabList={tabList}
					onClick={handleTabChange}
					className='atTabs'
				>
					<AtTabsPane current={current} index={0}>
						<View className='tabContent'>
							<LongTextCard text={detail.zhu} showAll />
						</View>
					</AtTabsPane>
					<AtTabsPane current={current} index={1}>
						<View className='tabContent'>
							<LongTextCard text={detail.yi} showAll />
						</View>
					</AtTabsPane>
					{/* <AtTabsPane current={current} index={2}>
						<View className='tabContent'>
							标签页三的内容
						</View>
					</AtTabsPane> */}
				</AtTabs>
			</PageContainer>
		</View>
	);
};

export default FixBottom;
