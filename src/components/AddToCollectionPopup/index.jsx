import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';

import FloatLayout from '../FloatLayout';
import Request from '../../apis/request';
import { userIsLogin } from '../../utils/auth';

import './style.scss';
import { isApiSuccess } from '../../apis/response';

const AddToCollectionPopup = ({ visible, poemId, onClose, onSuccess }) => {
	const [collections, setCollections] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showCreate, setShowCreate] = useState(false);
	const [newName, setNewName] = useState('');
	const [newDesc, setNewDesc] = useState('');
	const [nameError, setNameError] = useState('');
	const [nameFocused, setNameFocused] = useState(false);
	const [descFocused, setDescFocused] = useState(false);

	const exitCreate = () => {
		setShowCreate(false);
		setNewName('');
		setNewDesc('');
		setNameError('');
		setNameFocused(false);
		setDescFocused(false);
	};

	const loadCollections = () => {
		if (!visible || !poemId) return;
		setLoading(true);
		const user = Taro.getStorageSync('user') || {};
		Request('/api/collections', { mine: true, uid: user.uid, target_id: poemId, size: 50 }, 'GET')
			.then((res) => {
				if (isApiSuccess(res) && res.data) {
					setCollections(res.data.list || []);
				}
			})
			.catch(() => {})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		if (!visible || !poemId) return;
		// 未登录不打开浮层（userIsLogin 内部会引导登录）
		if (!userIsLogin()) {
			onClose && onClose();
			return;
		}
		loadCollections();
	}, [visible, poemId]);

	const handleAddToCollection = (collectionId, hasPoem, collectionName) => {
		if (hasPoem) {
			Taro.showToast({ title: '已加入该诗单', icon: 'none' });
			return;
		}
		Request(`/api/collections/${collectionId}/poems`, { poem_ids: [poemId] }, 'POST')
			.then((res) => {
				if (isApiSuccess(res)) {
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
							if (isApiSuccess(res)) {
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
			setNameError('给诗单起个名字吧');
			return;
		}
		setNameError('');
		Request('/api/collections/create', { collection_name: newName.trim(), description: newDesc.trim() }, 'POST')
			.then((res) => {
				if (isApiSuccess(res) && res.data) {
					Taro.showToast({ title: '创建成功', icon: 'success' });
					exitCreate();
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
			<View className='sheet'>
				<View className='sheet-header'>
					<Text className='sheet-title'>{showCreate ? '新建诗单' : '加入诗单'}</Text>
					{showCreate ? (
						<View className='sheet-actions'>
							<View className='sheet-btn cancel' onClick={exitCreate}>
								取消
							</View>
							<View className='sheet-btn confirm' onClick={handleCreate}>
								创建
							</View>
						</View>
					) : (
						<View className='sheet-actions'>
							<View className='sheet-link' onClick={() => setShowCreate(true)}>
								＋ 新建
							</View>
						</View>
					)}
				</View>

				{showCreate ? (
					<View className='sheet-body' style={{ paddingBottom: '40rpx' }}>
						<View className='sheet-field'>
							<View className='sheet-field-head'>
								<Text className='sheet-label'>标题</Text>
								<Text className='sheet-count'>{newName.length}/20</Text>
							</View>
							<Input
								className={`sheet-input ${nameFocused ? 'focused' : ''}`}
								placeholder='请输入诗单名称'
								placeholderClass='sheet-placeholder'
								value={newName}
								maxlength={20}
								onFocus={() => setNameFocused(true)}
								onBlur={() => setNameFocused(false)}
								onInput={(e) => {
									setNewName(e.detail.value);
									if (nameError) setNameError('');
								}}
							/>
							{nameError ? (
								<Text className='sheet-error'>{nameError}</Text>
							) : (
								<Text className='sheet-hint'>最多 20 个字</Text>
							)}
						</View>

						<View className='sheet-field'>
							<View className='sheet-field-head'>
								<Text className='sheet-label'>描述（可选）</Text>
								<Text className='sheet-count'>{newDesc.length}/60</Text>
							</View>
							<Textarea
								className={`sheet-textarea ${descFocused ? 'focused' : ''}`}
								maxlength={60}
								autoHeight
								placeholder='一句话介绍这个诗单…'
								placeholderClass='sheet-placeholder'
								value={newDesc}
								onFocus={() => setDescFocused(true)}
								onBlur={() => setDescFocused(false)}
								onInput={(e) => setNewDesc(e.detail.value)}
							/>
						</View>
					</View>
				) : (
					<View className='sheet-body'>
						{loading ? (
							<View className='sheet-empty'>加载中…</View>
						) : collections.length === 0 ? (
							<View className='sheet-empty'>还没有诗单，点右上角「新建」创建一个</View>
						) : (
							<ScrollView
								scrollY
								showScrollbar={false}
								style={{
									height: `${Math.min(collections.length * 110 + 8, 520)}rpx`,
								}}
							>
								{collections.map((item) => (
									<View className='sheet-row' key={item._id}>
										<View className='sheet-row-main'>
											<Text className='sheet-row-title'>{item.collection_name}</Text>
											<Text className='sheet-row-meta'>{item.poem_count || 0} 首</Text>
										</View>
										<View
											className={`sheet-row-action ${item.has_poem ? 'muted' : ''}`}
											onClick={() =>
												item.has_poem
													? handleRemoveFromCollection(item._id, item.collection_name)
													: handleAddToCollection(item._id, false, item.collection_name)
											}
										>
											{item.has_poem ? '移除' : '添加'}
										</View>
									</View>
								))}
							</ScrollView>
						)}
					</View>
				)}
			</View>
		</FloatLayout>
	);
};

export default AddToCollectionPopup;