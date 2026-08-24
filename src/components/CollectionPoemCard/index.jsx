import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './poem-card.scss';

/**
 * 诗单详情页诗词卡片（参考 web 端 LibraryCollectionDetail）
 * 网格布局：标题（衬线）+ 作者·朝代 + 内容前 3 行截断 2 行
 */
const CollectionPoemCard = ({ poem }) => {
	const handleTap = () => {
		Taro.navigateTo({
			url: `/pages/poem/detail?id=${poem.id || poem._id}`,
		});
	};

	// 内容提取：content.content 数组或字符串，取前 3 段
	const rows = Array.isArray(poem?.content?.content)
		? poem.content.content
		: typeof poem?.content === 'string'
			? poem.content.split('\n').filter(Boolean)
			: [];
	const preview =
		rows.slice(0, 3).join(' ') + (rows.length > 3 ? '……' : '');

	return (
		<View className='collectionPoemCard' onClick={handleTap}>
			<Text className='cardTitle' numberOfLines={1}>
				{poem.title}
			</Text>
			<Text className='cardMeta'>
				{poem.author} · {poem.dynasty}
			</Text>
			{preview ? (
				<Text className='cardContent' numberOfLines={2}>
					{preview}
				</Text>
			) : null}
		</View>
	);
};

export default CollectionPoemCard;