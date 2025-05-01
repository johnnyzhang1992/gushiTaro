import { View, Text } from '@tarojs/components';
import { useEffect, useRef, useState } from 'react';
import Taro, {
	useLoad,
	usePullDownRefresh,
	useReachBottom,
} from '@tarojs/taro';
import { useNavigationBar } from 'taro-hooks';

// import CollectContainer from './components/CollectContainer';
import SentenceCard from '../../components/SentenceCard';
import PoemSmallCard from '../../components/PoemSmallCard';
import PoetCard from '../../components/PoetCard';

import { fetchUserCollect, updateUserCollect } from '../../services/global';

import './style.scss';

// const types = ['poem', 'sentence', 'author'];
const typeObj = {
	poem: '作品',
	sentence: '摘录',
	author: '作者',
};

const CollectItem = (props) => {
	const { type = 'poem' } = props;
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
	let TabItem = null;
	switch (type) {
		case 'poem':
			TabItem = PoemSmallCard;
			break;
		case 'sentence':
			TabItem = SentenceCard;
			break;
		case 'author':
			TabItem = PoetCard;
			break;
		default:
			TabItem = PoemSmallCard;
	}
	return (
		<View className='collectItem' key={props.id}>
			<TabItem {...props} hideBorder showBorder={false} showAvatar={false} />
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

const CollectPage = () => {
	const user = Taro.getStorageSync('user');
	const { setTitle } = useNavigationBar({ title: '我的收藏' });

	const pagination = useRef({
		page: 1,
		last_page: 2,
	});
	const [collectList, setList] = useState({
		list: [],
		current_page: 1,
		last_page: 2,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const optionRef = useRef({});

	useLoad((options) => {
		console.log('options', options);
		optionRef.current = options || {};
		const { type = 'poem', collection_id, name = '' } = options;
		if (collection_id) {
			setTitle(name);
		} else {
			setTitle('我的收藏 | ' + typeObj[type]);
		}
	});

	useReachBottom(() => {
		console.log('page-reachBottom');
		const { page, last_page } = pagination.current;
		if (page >= last_page) {
			console.log('page-reachBottom', page, last_page);
			return false;
		}
		pagination.current = {
			...pagination.current,
			page: page + 1,
		};
		queryCollectList();
	});

	usePullDownRefresh(() => {
		console.log('page-pullRefresh');
		const prePagination = { ...pagination };
		prePagination.current = {
			...pagination.current,
			page: 1,
			last_page: 2,
		};
		queryCollectList();
		Taro.stopPullDownRefresh();
	});

	useEffect(() => {
		queryCollectList();
	}, []);

	const queryCollectList = async () => {
		if (loading) return;
		setLoading(true);
		const { page } = pagination.current;
		const { type = '', collection_id } = optionRef.current;
		let params = {
			page,
			user_id: user.user_id,
		};
		if (type) {
			params.type = type;
		}
		if (collection_id) {
			params.collection_id = collection_id;
		}
		const res = await fetchUserCollect('GET', params).catch((err) => {
			console.log('fetchUserCollect', err);
			setError(err);
			setLoading(false);
		});
		if (res && res.statusCode === 200) {
			const { list = [], current_page, last_page } = res.data;
			if (current_page === 1) {
				setList(res.data);
			} else {
				setList((pre) => ({ ...res.data, list: [...pre.list, ...list] }));
			}
			setError(null);
			pagination.current = {
				...pagination,
				page: current_page,
				last_page,
			};
		}
		setLoading(false);
	};

	// 收藏删除，加一层提醒
	const handleCollectDelete = (params) => {
		updateUserCollect('POST', {
			user_id: user.user_id,
			type: optionRef.current.type || '',
			target_id: params.id,
		}).then((res) => {
			if (res && res.statusCode === 200) {
				if (res.data.status) {
					const newList = collectList.list.filter((item) => {
						return item.id !== params.id;
					});
					setList({
						...collectList,
						list: newList,
					});
				}
			}
		});
	};

	return (
		<View className='page collectPage'>
			<View className='collectContainer'>
				{collectList.list.map((item) => (
					<CollectItem
						{...item}
						key={item._id}
						handleDelete={handleCollectDelete}
					></CollectItem>
				))}
				{loading ? (
					<View className='loading'>
						<Text>内容加载中...</Text>
					</View>
				) : null}
				{!loading && collectList.list.length < 1 ? (
					<View className='loading'>
						<View>
							<Text>哎呀，怎么没有收藏(ｷ｀ﾟДﾟ´)!!</Text>
						</View>
						<View>
							<Text>要热爱学习呀！ヾ(◍°∇°◍)ﾉﾞ</Text>
						</View>
					</View>
				) : null}
				{error ? (
					<View className='pageError'>
						<View className='title'>接口请求报错：</View>
						<Text>{error}</Text>
					</View>
				) : null}
			</View>
		</View>
	);
};

export default CollectPage;
