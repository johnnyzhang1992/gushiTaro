import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './style.scss';

// 格式化时间
const formatTime = (dateStr) => {
	if (!dateStr) return '';
	try {
		const date = new Date(dateStr);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	} catch {
		return dateStr;
	}
};

const PoemPlaylistCard = (props) => {
	const { playlist = {}, onRemove, showRemove = false } = props;
	const { collection_name, poem_count, _id, id: playlistId, created_at, createdAt } = playlist;
	const id = playlistId || _id;
	const createTime = formatTime(created_at || createdAt);

	const handleNavigate = () => {
		Taro.navigateTo({
			url: `/pages/me/collections/playlist-detail?id=${id}&name=${encodeURIComponent(collection_name)}`,
		});
	};

	const handleRemove = (e) => {
		e.stopPropagation();
		Taro.showModal({
			title: '确认移除',
			content: `确定要移除诗单「${collection_name}」吗？`,
			confirmColor: '#e64340',
			success: (res) => {
				if (res.confirm && onRemove) {
					onRemove(id);
				}
			},
		});
	};

	return (
		<View className='poem-playlist-card' onClick={handleNavigate}>
			<View className='card-content'>
				<Text className='card-title'>{collection_name}</Text>
				<View className='card-meta'>
					<Text className='poem-count'>{poem_count || 0} 首</Text>
					{createTime ? (
						<Text className='create-time'>· {createTime}</Text>
					) : null}
					{showRemove ? (
						<View className='remove-btn' onClick={handleRemove}>
							<Text className='remove-text'>移除</Text>
						</View>
					) : (
						<View className='chevron-right'></View>
					)}
				</View>
			</View>
		</View>
	);
};

export default PoemPlaylistCard;