import { View, ScrollView } from '@tarojs/components';
import { AtInput, AtCheckbox } from 'taro-ui';
import { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';

import FloatLoayout from '../../components/FloatLayout';
import {
	fetchCollections,
	createCollection,
	updateCollection,
	updateUserCollect,
} from '../../services/global';

import './style.scss';

const titleObj = {
	create: '新建收藏集',
	edit: '选择收藏集',
	create_collection: '新建收藏集',
	edit_collection: '编辑收藏集',
};
const CollectionModal = ({
	show = 'false',
	type = 'poem',
	targetId,
	initType = 'edit',
	initCollection = {},
	onSuccess,
	onClose,
}) => {
	const [collections, setCollections] = useState([]);
	const [collectionIds, setIds] = useState([]);
	const [collectionForm, setForm] = useState({
		collection_name: '',
		description: '',
		...initCollection,
	});
	const [modalType, setType] = useState(initType); // create edit
	const [showModal, setShowModal] = useState(false);
	const oldIds = useRef([]);

	const getCollections = async (target_id) => {
		console.log(type, targetId);
		if (!targetId) {
			return false;
		}
		const res = await fetchCollections('GET', {
			type,
			target_id: target_id || targetId || '',
		});
		if (res && res.statusCode === 200) {
			const checkboxOptions = res.data.collections.map((item) => ({
				...item,
				value: item._id,
				label: item.collection_name,
				desc: `作品数量：${item.poem_count}`,
			}));
			setCollections(checkboxOptions);
			setIds(res.data.existCollections || []);
			oldIds.current = res.data.existCollections || [];
		}
	};

	const handleSaveCollection = async () => {
		console.log('handleSaveCollection', collectionForm);
		if (modalType == 'edit_collection') {
			handleUpdateCollection();
			return false;
		}
		const { collection_name, description } = collectionForm;
		if (!collection_name) {
			Taro.showToast({
				title: '请输入收藏集名称',
				icon: 'error',
				duration: 2000,
			});
			return false;
		}
		await createCollection('POST', {
			collection_name,
			description,
		}).catch((err) => {
			console.log('createCollection', err);
			Taro.showToast({
				title: '创建失败',
				icon: 'error',
				duration: 2000,
			});
		});

		if (modalType == 'create_collection') {
			if (onSuccess && typeof onSuccess === 'function') {
				onSuccess();
			}
			setShowModal(false);
		} else {
			await getCollections(targetId);
			setType('edit');
		}
	};

	const handleUpdateCollect = async () => {
		const _ids = collectionIds.filter((item) => item);
		// 若未收藏，且没有选择收藏集
		if (oldIds.current.length == 0 && _ids.length < 1) {
			Taro.showToast({
				title: '请选中一个收藏集',
				icon: 'none',
				duration: 2000,
			});
			return false;
		}
		updateUserCollect('POST', {
			type,
			target_id: targetId,
			collection_id: _ids.join(','),
		})
			.then((res) => {
				if (res && res.statusCode === 200) {
					const { status: resStatus, num: resCount, msg = '' } = res.data;
					console.log(resCount, 'resCount');
					oldIds.current = [..._ids];
					// 通知上级组件
					if (onSuccess && typeof onSuccess === 'function') {
						onSuccess(resStatus, resCount < 0 ? 0 : resCount);
					}
					Taro.showToast({
						title: msg || '收藏成功！记得常常温习哦',
						icon: 'none',
						duration: 2000,
					});
				}
			})
			.catch((err) => {
				console.log('updateUserCollect', err);
				Taro.showToast({
					title: '操作失败',
					icon: 'error',
					duration: 2000,
				});
			});
	};

	const handleUpdateCollection = async () => {
		const { collection_name, description, id } = collectionForm;
		console.log('handleUpdateCollection', collectionForm);
		if (!collection_name) {
			Taro.showToast({
				title: '请输入收藏集名称',
				icon: 'error',
				duration: 2000,
			});
			return false;
		}
		await updateCollection('POST', {
			collection_name,
			description,
			id,
		}).catch((err) => {
			console.log('updateCollection', err);
			Taro.showToast({
				title: '更新失败',
				icon: 'error',
				duration: 2000,
			});
		});
		if (modalType == 'edit_collection') {
			if (onSuccess && typeof onSuccess === 'function') {
				onSuccess();
			}
			setShowModal(false);
		} else {
			await getCollections(targetId);
			setType('edit');
		}
	};

	const handleNameChange = (value = '') => {
		setForm({
			...collectionForm,
			collection_name: value.slice(0, 10),
		});
	};

	const handleDescChange = (value = '') => {
		setForm({
			...collectionForm,
			description: value.slice(0, 50),
		});
	};

	const handleCollectionIdsChnage = (value) => {
		console.log('handleCollectionIdsChnage', value);
		setIds(value);
	};

	const handleClose = () => {
		if (onClose && typeof onClose === 'function') {
			onClose();
		}
		setShowModal(false);
	};

	const handleCancel = () => {
		if (modalType == 'create') {
			setType('edit');
		}
		if (['edit_collection', 'create_collection'].includes( modalType)) {
			if (onClose && typeof onClose === 'function') {
				onClose();
			}
			setShowModal(false);
		}
	};

	useEffect(() => {
		getCollections(targetId);
	}, [targetId]);

	useEffect(() => {
		console.log('---show', show);
		setShowModal(show);
		setType(initType);
		setForm({
			collection_name: '',
			description: '',
			...initCollection,
		});
	}, [show]);

	return (
		<FloatLoayout isOpen={showModal} showTitle={false} close={handleClose}>
			<View className='collectionTitle'>
				<View className='title'>{titleObj[modalType] || '选择收藏集'}</View>
				<View
					className='collectionDesc'
					style={{
						display: modalType == 'edit' ? 'block' : 'none',
					}}
				>
					选择或创建你想添加的收藏集
				</View>
			</View>
			{/* 编辑收藏集 */}
			<view
				className='modalCollectionContent'
				style={{
					display: modalType == 'edit' ? 'block' : 'none',
				}}
			>
				{/* 收藏集选择列表列表 */}
				<ScrollView
					className='collectionListContainer'
					scrollY
					style={{
						height: '600rpx',
					}}
				>
					<View className='collectionList'>
						<AtCheckbox
							options={collections}
							selectedList={collectionIds}
							onChange={handleCollectionIdsChnage}
						/>
					</View>
				</ScrollView>

				<View className='modalCollectionsFooter'>
					<View
						className='create'
						onClick={() => {
							setType('create');
						}}
					>
						新建收藏集
					</View>
					<View className='confirm btn' onClick={handleUpdateCollect}>
						确定
					</View>
				</View>
			</view>
			{/* 新建收藏集 */}
			<view
				className='modalCollectionContent'
				style={{
					display: ['create', 'edit_collection', 'create_collection'].includes(
						modalType
					)
						? 'block'
						: 'none',
				}}
			>
				{/* 名称 */}
				<View className='collectionLable'>名称</View>
				<AtInput
					title=''
					type='text'
					className='name'
					placeholderClass='placeholder'
					placeholder='收藏集名称（10字以内）'
					value={collectionForm.collection_name}
					onChange={handleNameChange}
				/>
				{/* 描述 */}
				<View className='collectionLable'>描述</View>
				<AtInput
					title=''
					type='text'
					className='desc'
					placeholderClass='placeholder'
					value={collectionForm.description}
					onChange={handleDescChange}
					maxLength={50}
					placeholder='收藏描述(限50字，选填)'
				/>
				<View className='modalCollectionsFooter createFooter'>
					<View className='cancel btn' onClick={handleCancel}>
						取消
					</View>
					<View className='confirm btn' onClick={handleSaveCollection}>
						确定
					</View>
				</View>
			</view>
		</FloatLoayout>
	);
};

export default CollectionModal;
