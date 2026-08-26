import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';

import FloatLayout from '../FloatLayout';
import Request from '../../apis/request';

import './style.scss';

const AddToCollectionPopup = ({ visible, poemId, onClose, onSuccess }) => {
	const [collections, setCollections] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showCreate, setShowCreate] = useState(false);
	const [newName, setNewName] = useState('');

	const loadCollections = () => {
		if (!visible || !poemId) return;
		setLoading(true);
		Request('/api/collections', { mine: true, target_id: poemId, size: 50 }, 'GET')
			.then((res) => {
				if (res && res.status && res.data) {
					setCollections(res.data.list || []);
				}
			})
			.catch(() => {})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		loadCollections();
	}, [visible, poemId]);

	const handleAddToCollection = (collectionId, hasPoem, collectionName) => {
		if (hasPoem) {
			Taro.showToast({ title: '已加入该诗单', icon: 'none' });
			return;
		}
		Request(`/api/collections/${collectionId}/poems`, { poem_ids: [poemId] }, 'POST')
			.then((res) => {
				if (res && res.status) {
					Taro.showToast({ title: '添加成功', icon: 'success' });
					loadCollections();
					onSuccess && onSuccess();
				}
			})
			.catch(() => {
				Taro.showToast({ title: '操作失败', icon: 'none' });
			});
	};

	const handleRemoveFromCollection = (collectionId, collectionName) => {
		Taro.showModal({
			title: '确认移除',
			content: `确定要从「${collectionName}」中移除这首诗吗？`,
			confirmColor: '#e64340',
			success: (res) => {
				if (res.confirm) {
					Request(`/api/collections/${collectionId}/poems/${poemId}`, {}, 'DELETE')
						.then((res) => {
							if (res && res.status) {
								Taro.showToast({ title: '已移除', icon: 'success' });
								loadCollections();
								onSuccess && onSuccess();
							}
						})
						.catch(() => {
							Taro.showToast({ title: '移除失败', icon: 'none' });
						});
				}
			},
		});
	};

	const handleCreate = () => {
		if (!newName.trim()) {
			Taro.showToast({ title: '请输入诗单名称', icon: 'none' });
			return;
		}
		Request('/api/collections/create', { collection_name: newName.trim() }, 'POST')
			.then((res) => {
				if (res && res.status && res.data) {
					Taro.showToast({ title: '创建成功', icon: 'success' });
					setNewName('');
					setShowCreate(false);
					if (res.data._id) {
						handleAddToCollection(res.data._id, false, newName.trim());
					}
					loadCollections();
				}
			})
			.catch(() => {
				Taro.showToast({ title: '创建失败', icon: 'none' });
			});
	};

	return (
		<FloatLayout isOpen={visible} close={onClose} title=''>
			<View className='popup-header'>
				<Text className='popup-title'>加入诗单</Text>
				{!showCreate ? (
					<View className='create-btn' onClick={() => setShowCreate(true)}>
						<Text className='text'>+ 新建</Text>
					</View>
				) : null}
			</View>

			<View className='add-to-collection'>
				{loading ? (
					<View className='loading'>
						<Text>加载中...</Text>
					</View>
				) : (
					<>
						{showCreate ? (
							<View className='create-form'>
								<View className='input-row'>
									<input
										className='input'
										placeholder='请输入诗单名称'
										value={newName}
										onInput={(e) => setNewName(e.detail.value)}
									/>
									<View className='btns'>
										<View className='btn cancel' onClick={() => { setShowCreate(false); setNewName(''); }}>
											取消
										</View>
										<View className='btn confirm' onClick={handleCreate}>
											创建
										</View>
									</View>
								</View>
							</View>
						) : null}

						<ScrollView className='collection-list' scrollY>
							{collections.length === 0 ? (
								<View className='empty'>
									<Text>暂无诗单，点击上方创建</Text>
								</View>
							) : (
								collections.map((item) => (
									<View
										key={item._id}
										className={`collection-item ${item.has_poem ? 'selected' : ''}`}
									>
										<View className='info'>
											<Text className='name'>{item.collection_name}</Text>
										</View>
										<View className='bottom-row'>
											<Text className='count'>{item.poem_count || 0} 首</Text>
											{item.has_poem ? (
												<View
													className='remove-btn'
													onClick={() => handleRemoveFromCollection(item._id, item.collection_name)}
												>
													<Text className='remove-text'>移除</Text>
												</View>
											) : (
												<View
													className='add-btn'
													onClick={() => handleAddToCollection(item._id, false, item.collection_name)}
												>
													<Text className='add-text'>添加</Text>
												</View>
											)}
										</View>
									</View>
								))
							)}
						</ScrollView>
					</>
				)}
			</View>
		</FloatLayout>
	);
};

export default AddToCollectionPopup;