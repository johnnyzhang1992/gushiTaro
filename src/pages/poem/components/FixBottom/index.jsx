import { View } from '@tarojs/components';

import LikeButton from '../../../../components/LikeButton';
import CollectButton from '../../../../components/CollectButton';
import ScheduleButton from '../../../../components/ScheduleButton';
import RootFixed from '../../../../components/RootFixed';

import './style.scss';

const FixBottom = (props) => {
	const { poem = {} } = props;

	const poemId = poem.id || poem._id;

	return (
		<RootFixed>
			<View className='fixBottom'>
				<View className='bottomTabs flex'>
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
					</View>
				</View>
			</View>
		</RootFixed>
	);
};

export default FixBottom;