import { View } from '@tarojs/components';

import './style.scss';

/**
 * 通用骨架屏：列表卡片加载占位
 * @param rows 骨架卡片行数
 */
const Skeleton = ({ rows = 6, type = 'card' }) => {
	return (
		<View className='skeletonWrap'>
			{[...Array(rows)].map((_, i) => (
				<View key={i} className={`skeletonCard ${type}`}>
					<View className='skeletonLine w40' />
					<View className='skeletonLine w20' />
					<View className='skeletonLine w80' />
					<View className='skeletonLine w60' />
				</View>
			))}
		</View>
	);
};

export default Skeleton;