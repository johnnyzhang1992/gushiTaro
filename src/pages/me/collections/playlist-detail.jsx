import { View, Text } from '@tarojs/components';
import { useState, useRef } from 'react';
import Taro, { useLoad, usePullDownRefresh } from '@tarojs/taro';

import PoemSmallCard from '../../../components/PoemSmallCard';
import Request from '../../../apis/request';

import './playlist-detail.scss';

// 格式化时间
const formatTime = (dateStr) => {
	if (!dateStr) return '';
	try {
		const date = new Date(dateStr);
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${date.getFullYear()}-${month}-${day}`;
	} catch {
		return dateStr;
	}
};

const PlaylistDetail = () => {
	const [poems, setPoems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [playlistName, setPlaylistName] = useState('');
	const [collectionId, setCollectionId] = useState('');
	const [isOwner, setIsOwner] = useState(false);
	const idRef = useRef(null);
	const user = Taro.getStorageSync('user');

	useLoad((options) => {
		idRef.current = options.id;
		setCollectionId(options.id);
		const name = decodeURIComponent(options.name || '诗单详情');
		setPlaylistName(name);
		Taro.setNavigationBarTitle({ title: name });
		fetchDetail(options.id);
	});

	usePullDownRefresh(() => {
		if (idRef.current) fetchDetail(idRef.current);
		Taro.stopPullDownRefresh();
	});

	const fetchDetail = async (id) => {
		setLoading(true);
		try {
			const res = await Request(`/api/collections/${id}`, {}, 'GET');
			if (res && res.status && res.data) {
				setPoems(res.data.poems || []);
				if (!playlistName || playlistName === '诗单详情') {
					setPlaylistName(res.data.collection_name || '诗单详情');
					Taro.setNavigationBarTitle({ title: res.data.collection_name || '诗单详情' });
				}
				// 判断是否为诗单拥有者
				if (user && res.data.creator_id) {
					setIsOwner(String(user.uid) === String(res.data.creator_id));
				}
			}
		} catch (err) {
			console.error('加载失败:', err);
		}
		setLoading(false);
	};

	// 复制诗单
	const handleCopyCollection = () => {
		Taro.showModal({
			title: '复制诗单',
			content: `确定要复制「${playlistName}」为我的诗单吗？`,
			success: (res) => {
				if (res.confirm) {
					Request(`/api/collections/${collectionId}/copy`, {}, 'POST')
						.then((res) => {
							if (res && res.status) {
								Taro.showToast({ title: '复制成功', icon: 'success' });
								// 跳转到新诗单
								if (res.data && res.data._id) {
									Taro.navigateTo({
										url: `/pages/me/collections/playlist-detail?id=${res.data._id}&name=${encodeURIComponent(res.data.collection_name)}`,
									});
								}
							}
						})
						.catch(() => {
							Taro.showToast({ title: '复制失败', icon: 'none' });
						});
				}
			},
		});
	};

	// 从诗单移除诗词
	const handleRemovePoem = (poemId, poemTitle) => {
		Taro.showModal({
			title: '确认移除',
			content: `确定要从诗单中移除「${poemTitle}」吗？`,
			confirmColor: '#e64340',
			success: (res) => {
				if (res.confirm) {
					Request(`/api/collections/${collectionId}/poems/${poemId}`, {}, 'DELETE')
						.then((res) => {
							if (res && res.status) {
								Taro.showToast({ title: '已移除', icon: 'success' });
								fetchDetail(collectionId);
							}
						})
						.catch(() => {
							Taro.showToast({ title: '移除失败', icon: 'none' });
						});
				}
			},
		});
	};

	if (loading) {
		return (
			<View className='page playlist-detail-page'>
				<View className='loading'>加载中...</View>
			</View>
		);
	}

	return (
		<View className='page playlist-detail-page'>
			<View className='header-info'>
				<View className='header-left'>
					<Text className='count'>共 {poems.length} 首 · {playlistName}</Text>
				</View>
				{!isOwner ? (
					<View className='copy-btn' onClick={handleCopyCollection}>
						<Text className='copy-text'>复制为我的诗单</Text>
					</View>
				) : null}
			</View>
			{poems.length === 0 ? (
				<View className='empty'>诗单还没有作品，去首页逛逛吧</View>
			) : (
				<View className='poem-list'>
					{poems.map((item, index) => {
						const poem = item.poem || item;
						const addedTime = formatTime(item.added_at);
						return (
							<View key={poem._id || poem.id || index} className='poem-item'>
								<View className='poem-content'>
									<PoemSmallCard
										{...poem}
										hideBorder
										showBorder={false}
										footerSlot={
											<View className='poem-footer'>
												{addedTime ? (
													<Text className='added-time'>{addedTime} 加入</Text>
												) : null}
												{isOwner ? (
													<View
														className='remove-btn'
														onClick={() => handleRemovePoem(poem.id || poem._id, poem.title)}
													>
														<Text className='remove-text'>移除</Text>
													</View>
												) : null}
											</View>
										}
									/>
								</View>
							</View>
						);
					})}
				</View>
			)}
		</View>
	);
};

export default PlaylistDetail;