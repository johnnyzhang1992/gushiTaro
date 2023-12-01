import { View, Text } from '@tarojs/components';
import React, { useState, useEffect, useMemo } from 'react';
import Taro from '@tarojs/taro';

import PoemSmallCard from '../../../../components/PoemSmallCard';
import SentenceCard from '../../../../components/SentenceCard';
import PoetCard from '../../../../components/PoetCard';

import useFectchList from '../../../../hooks/useFetchList';

import { fetchUserCollect, updateUserCollect } from '../../service';

import './style.scss';

const CollectItem = (props) => {
	const handleDelete = () => {
		Taro.showModal({
			title: '提示',
			content: '您确定删除？',
			confirmText: '确定',
			success: function (res) {
				if (res.confirm) {
					props.handleDelete(props);
				} else if (res.cancel) {
					console.log('用户点击取消');
				}
			},
		});
	};
	return (
		<View className='collectItem' key={props.id}>
			{props.children}
			<View className='bottom'>
				<View className='time'>
					<Text className='text'>收藏时间</Text>
					<Text className='date'>{props.updated_at}</Text>
				</View>
				<View className='btns'>
					<View className='btn deleteBtn' onClick={handleDelete}>
						删除
					</View>
				</View>
			</View>
		</View>
	);
};
const ColllectContainer = ({ type, page, updatePage }) => {
	const user = Taro.getStorageSync('user');
	const [fetchParams] = useState({
		type,
		requestType: 'collect',
		user_id: user.user_id,
		inited: true,
	});
	const [pagination, updatePagination] = useState({
		page: 1,
		size: 15,
		total: 0,
		last_page: 1,
	});
	const { data, error, loading, setData } = useFectchList(
		fetchUserCollect,
		fetchParams,
		pagination
	);
	console.log(data, loading, error);
	const TabItem = useMemo(() => {
		let item = null;
		switch (type) {
			case 'poem':
				item = PoemSmallCard;
				break;
			case 'sentence':
				item = SentenceCard;
				break;
			case 'author':
				item = PoetCard;
				break;
			default:
				item = PoemSmallCard;
		}
		return item;
	}, [type]);

	const handleCollectDelete = (params) => {
		updateUserCollect('POST', {
			user_id: user.user_id,
			type,
			id: params.id,
		}).then((res) => {
			if (res && res.statusCode === 200) {
				console.log(res.data);
				if (res.data.status) {
					const newList = data.list.filter((item) => {
						return item.id !== params.id;
					});
					setData({
						...data,
						list: newList,
					});
				}
			}
		});
	};

	useEffect(() => {
		updatePagination((pre) => ({
			...pre,
			page,
		}));
	}, [page]);

	useEffect(() => {
		const { page: Page, last_page } = data.pagination;
		updatePage({
			type,
			page: Page,
			last_page,
		});
	}, [type, data, updatePage]);

	return (
		<View className='collectContainer'>
			{data.list.map((item) => (
				<CollectItem
					key={item.id}
					{...item}
					handleDelete={handleCollectDelete}
				>
					<TabItem
						{...item}
						hideBorder
						showBorder={false}
						showAvatar={false}
						id={item[`${type}_id`]}
					/>
				</CollectItem>
			))}
			{loading ? (
				<View className='loading'>
					<Text>内容加载中...</Text>
				</View>
			) : null}
			{error ? (
				<View className='pageError'>
					<View className='title'>接口请求报错：</View>
					<Text>{error}</Text>
				</View>
			) : null}
		</View>
	);
};

export default React.memo(ColllectContainer);
