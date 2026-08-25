import { View, Text } from '@tarojs/components';
import { useEffect, useRef, useState } from 'react';
import Taro, {
	useLoad,
	usePullDownRefresh,
	useReachBottom,
} from '@tarojs/taro';
import { useNavigationBar } from 'taro-hooks';

import SentenceCard from '../../components/SentenceCard';
import PoemSmallCard from '../../components/PoemSmallCard';
import PoetCard from '../../components/PoetCard';

import { fetchUserCollect, updateUserCollect } from '../../services/global';

import './style.scss';

// 格式化时间
const formatTime = (dateStr) => {
	if (!dateStr) return '';
	try {
		const date = new Date(dateStr);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hour = String(date.getHours()).padStart(2, '0');
		const minute = String(date.getMinutes()).padStart(2, '0');
		return `${year}-${month}-${day} ${hour}:${minute}`;
	} catch {
		return dateStr;
	}
};

const tabs = [
	{ key: 'poem', label: '作品' },
	{ key: 'sentence', label: '摘录' },
	{ key: 'author', label: '作者' },
];

const CollectItem = (props) => {
	const type = props.type || props.target_type || 'poem';
	const handleDelete = () => {
		Taro.showModal({
			title: '提示',
			content: '您确定删除？',
			confirmText: '确定',
			success: function (res) {
				if (res.confirm) {
					props.handleDelete(props);
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
		case 'excerpt':
			TabItem = SentenceCard;
			break;
		case 'author':
			TabItem = PoetCard;
			break;
		default:
			TabItem = PoemSmallCard;
	}

	return (
		<View className='collectItem'>
			<TabItem {...props} hideBorder showBorder={false} showAvatar={type === 'author'} />
			<View className='bottom'>
				<View className='time'>
					<Text className='text'>收藏时间</Text>
					<Text className='date'>{formatTime(props.created_at || props.createdAt)}</Text>
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

	const [currentTab, setCurrentTab] = useState('poem');
	const [collectList, setList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const pagination = useRef({ page: 1, last_page: 2 });
	const isLoadingMore = useRef(false);

	// 切换 TAB
	const handleTabChange = (tab) => {
		if (tab === currentTab) return;
		setCurrentTab(tab);
		setList([]);
		pagination.current = { page: 1, last_page: 2 };
		loadData(tab, 1);
	};

	// 加载数据
	const loadData = async (type, page) => {
		if (isLoadingMore.current) return;
		isLoadingMore.current = true;
		setLoading(page === 1);

		try {
			const res = await fetchUserCollect('GET', { page, uid: user.uid, type });
			if (res && (res.status || res.statusCode === 200)) {
				const apiData = res.data?.data || res.data;
				const { list = [], current_page, last_page } = apiData;
				setList((prev) => (page === 1 ? list : [...prev, ...list]));
				pagination.current = { page: current_page, last_page };
				setError(null);
			}
		} catch (err) {
			console.error('fetchUserCollect', err);
			setError(err);
		} finally {
			setLoading(false);
			isLoadingMore.current = false;
		}
	};

	// 删除收藏
	const handleCollectDelete = (params) => {
		updateUserCollect('POST', {
			uid: user.uid,
			type: currentTab,
			target_id: params.like_id,
			status: 1,
		}).then((res) => {
			if (res && (res.status || res.statusCode === 200)) {
				setList((prev) => prev.filter((item) => item.id !== params.id));
			}
		});
	};

	useLoad((options) => {
		const { type = 'poem' } = options;
		setCurrentTab(type);
	});

	useEffect(() => {
		loadData(currentTab, 1);
	}, [currentTab]);

	usePullDownRefresh(() => {
		loadData(currentTab, 1).then(() => Taro.stopPullDownRefresh());
	});

	useReachBottom(() => {
		const { page, last_page } = pagination.current;
		if (page < last_page) {
			loadData(currentTab, page + 1);
		}
	});

	return (
		<View className='page collectPage'>
			{/* TAB 切换 */}
			<View className='tabs'>
				{tabs.map((tab) => (
					<View
						key={tab.key}
						className={`tabItem ${currentTab === tab.key ? 'active' : ''}`}
						onClick={() => handleTabChange(tab.key)}
					>
						<Text className='tabText'>{tab.label}</Text>
						{currentTab === tab.key ? <View className='tabLine' /> : null}
					</View>
				))}
			</View>

			{/* 列表内容 */}
			<View className='collectContainer'>
				{collectList.map((item) => (
					<CollectItem
						key={item._id || item.id}
						{...item}
						handleDelete={handleCollectDelete}
					/>
				))}

				{loading && <View className='loading'><Text>加载中...</Text></View>}

				{!loading && collectList.length === 0 && (
					<View className='loading'>
						<Text>暂无收藏内容</Text>
					</View>
				)}

				{error && (
					<View className='pageError'>
						<Text>加载失败，请重试</Text>
					</View>
				)}
			</View>
		</View>
	);
};

export default CollectPage;