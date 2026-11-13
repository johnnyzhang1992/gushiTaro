import { View, Text, Navigator } from '@tarojs/components';

import { getDisplayName, formatPoemCount } from '../../utils/collectionCard';

import './style.scss';

/**
 * 诗单信息卡：左侧书脊色条 + 标题 + 数量
 * 文库「诗单」TAB 与「查看全部」页共用，宽度由父级网格决定
 */
const CollectionInfoCard = ({ collection, groupName, showGroup = false, className = '' }) => {
	const name = getDisplayName(collection?.collection_name, groupName);
	const count = formatPoemCount(collection?.poem_count);

	return (
		<Navigator
			className={`infoCard ${className}`}
			hoverClass='none'
			url={`/pages/library/collection-detail?id=${collection?._id}`}
		>
			<View className='cardSpine' />
			<View className='cardBody'>
				<Text className='cardTitle'>{name}</Text>
				<Text className='cardMeta'>
					{showGroup && groupName ? `${count} · ${groupName}` : count}
				</Text>
			</View>
			<View className='cardArrow' />
		</Navigator>
	);
};

export default CollectionInfoCard;