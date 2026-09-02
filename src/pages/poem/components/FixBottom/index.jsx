import { View, Text } from '@tarojs/components';
import { useState } from 'react';

import LikeButton from '../../../../components/LikeButton';
import CollectButton from '../../../../components/CollectButton';
import ScheduleModal from '../../../../components/ScheduleModal';
import AddToCollectionPopup from '../../../../components/AddToCollectionPopup';
import RootFixed from '../../../../components/RootFixed';

import './style.scss';

const FixBottom = (props) => {
	const { poem = {} } = props;
	const [showScheduleModal, setShowScheduleModal] = useState(false);
	const [showCollectionPopup, setShowCollectionPopup] = useState(false);

	const poemId = poem.id || poem._id;

	return (
		<RootFixed>
			<View className='fixBottom'>
				<View className='bottomTabs flex'>
					<View className='left flex'>
						<View className='tabItem' onClick={() => setShowScheduleModal(true)}>
							<Text className='addIcon'>+</Text>
							<Text className='text'>学习计划</Text>
						</View>
						<View className='tabItem' onClick={() => setShowCollectionPopup(true)}>
							<Text className='addIcon'>+</Text>
							<Text className='text'>诗单</Text>
						</View>
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
					</View>
				</View>
			</View>

			{/* 学习计划弹窗 */}
			<ScheduleModal
				targetId={poemId}
				initType='edit'
				show={showScheduleModal}
				onClose={() => setShowScheduleModal(false)}
			/>

			{/* 加入诗单弹窗 */}
			<AddToCollectionPopup
				visible={showCollectionPopup}
				poemId={String(poemId)}
				onClose={() => setShowCollectionPopup(false)}
			/>
		</RootFixed>
	);
};

export default FixBottom;
