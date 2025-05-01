import { View, Text, Navigator } from '@tarojs/components';

import './style.scss';

const CollectionSmallCard = (props) => {
	const { collection = {}, handleUpdate } = props;
	const handleEdit = () => {
		if (handleUpdate && typeof handleUpdate === 'function') {
			handleUpdate({
				type: 'edit',
				...collection,
			});
		}
	};

	const handleDelete = () => {
		if (handleUpdate && typeof handleUpdate === 'function') {
			handleUpdate({
				type: 'delete',
				...collection,
			});
		}
	};
	return (
		<View className='collection-small-card'>
			<Navigator
				className='collection-title'
				url={`/pages/me/collect?name=${collection.collection_name}&collection_id=${collection.id}`}
				hoverClass='none'
			>
				{collection.collection_name}
			</Navigator>
			<View className='collection-info'>
				<View className='info-left'>
					{collection.poem_count > 0 ? (
						<>
							<Text className='update'>{collection.update_time} 更新</Text>
							<Text className='spilt'>·</Text>
						</>
					) : null}
					<Text className='num'>作品 {collection.poem_count}</Text>
				</View>
				<View
					className='info-right'
					style={{
						display: handleUpdate ? 'flex' : 'none',
					}}
				>
					<View className='edit' onClick={handleEdit}>
						<View className='at-icon at-icon-edit'></View>
						<Text className='text'>编辑</Text>
					</View>
					<View className='delete' onClick={handleDelete}>
						{/* <View className='at-icon at-icon-trash'></View> */}
						<View className='at-icon at-icon-trash'></View>
						<Text className='text'>删除</Text>
					</View>
				</View>
			</View>
		</View>
	);
};

export default CollectionSmallCard;
