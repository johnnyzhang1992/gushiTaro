import { useState } from 'react';
import { PageContainer, View } from '@tarojs/components';
import { AtTabs, AtTabsPane } from 'taro-ui';

import LongTextCard from '../../../../components/LongTextCard';
import LikeButton from '../../../../components/LikeButton';
import CollectButton from '../../../../components/CollectButton';

import './style.scss';

const FixBottom = (props) => {
	const { poemDetail = { yi: '', zhu: '' }, poem = {} } = props;
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
				<View className='right flex'>
					<View className='tabItem like'>
						<LikeButton
							type='poem'
							id={poemDetail.poem_id}
							count={poem.like_count}
							status={poem.like_status}
							showText
						/>
					</View>
					<View className='tabItem like'>
						<CollectButton
							type='poem'
							id={poemDetail.poem_id}
							count={poem.collect_count}
							status={poem.collect_status}
							showText
						/>
					</View>
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
							<LongTextCard
								text={poemDetail.zhu}
								titl='注释'
								showAll
							/>
						</View>
					</AtTabsPane>
					<AtTabsPane current={current} index={1}>
						<View className='tabContent'>
							<LongTextCard
								text={poemDetail.yi}
								title='译文'
								showAll
							/>
						</View>
					</AtTabsPane>
				</AtTabs>
			</PageContainer>
		</View>
	);
};

export default FixBottom;
