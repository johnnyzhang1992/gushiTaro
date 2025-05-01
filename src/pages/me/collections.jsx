// 收藏集
import { View, Text } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro, { usePullDownRefresh } from '@tarojs/taro';

import CollectionSmallCard from '../../components/CollectionSmallCard';

import { fetchCollections, updateCollection } from '../../services/global';

import './collection.scss';
import CollectionModal from '../../components/CollectionModal';

const CollectionsPage = () => {
	const [collections, setCollections] = useState([]);
	const [isLoading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [modalType, setModalType] = useState('create'); // create edit
	const [collectionDetail, setDetail] = useState({});

	const queryCollections = async () => {
		try {
			const response = await fetchCollections('GET');
			console.log('queryCollections', response);
			if (!response.statusCode == 200) {
				throw new Error('Network response was not ok');
			}
			setCollections(response.data.collections || []);
		} catch (err) {
			setError(err);
		} finally {
			setLoading(false);
			Taro.stopPullDownRefresh();
		}
	};
	const onUpdate = (options) => {
		const { type, ...rest } = options;
		setDetail({ ...rest });
		if (type === 'edit') {
			setModalType('edit_collection');
			setShowModal(true);
		}
		// 删除收藏集
		if (type == 'delete') {
			Taro.showModal({
				title: '提示',
				cancelText: '取消',
				confirmText: '确定',
				content: '确定删除该收藏集吗？',
				success: function (res) {
					if (res.confirm) {
						handleDelete(options);
					} else if (res.cancel) {
						console.log('用户点击取消');
					}
				},
				fail: function (err) {
					console.log(err);
				},
			});
			return false;
		}
	};

	const handleDelete = async (options = {}) => {
		const res = await updateCollection('POST', {
			...options,
			status: 'delete',
			id: options.id,
		});
		if (res && res.statusCode === 200) {
			queryCollections();
		}
	};

	const hanldeCreate = () => {
		setDetail({});
		setModalType('create_collection');
		setShowModal(true);
	};

	const hanldeModalSuccess = () => {
		queryCollections();
		setShowModal(false);
	};
	const handleModalClose = () => {
		setDetail({});
		setShowModal(false);
	};

	usePullDownRefresh(() => {
		queryCollections();
	});

	useEffect(() => {
		queryCollections();
	}, []);

	if (isLoading) {
		return <View>Loading...</View>;
	}

	if (error) {
		return <View>Error: {error.message}</View>;
	}

	return (
		<View className='page collections-page'>
			{/* 顶部 */}
			<View className='header'>
				<View className='list-button'>我创建的 {collections.length}</View>
				<View className='list-create' onClick={hanldeCreate}>
					<View className='at-icon at-icon-add'></View>
					<Text className='text'>新建收藏集</Text>
				</View>
			</View>
			{collections.map((collection) => (
				<CollectionSmallCard
					key={collection.id}
					collection={collection}
					handleUpdate={onUpdate}
				></CollectionSmallCard>
			))}
			<CollectionModal
				show={showModal}
				initType={modalType}
				initCollection={collectionDetail}
				onSuccess={hanldeModalSuccess}
				onClose={handleModalClose}
				type=''
				targetId=''
			/>
		</View>
	);
};

export default CollectionsPage;
