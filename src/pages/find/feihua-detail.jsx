import { View, Text } from '@tarojs/components';
import Taro, { useRouter, useLoad, useReachBottom } from '@tarojs/taro';
import { useState } from 'react';

import { fetchFeihuaSentences } from './feihua.service';

import './feihua-detail.scss';

const PAGE_SIZE = 20;

// 高亮目标字
const HighlightChar = ({ text, char }) => {
	const parts = [];
	const segments = String(text || '').split(char);
	segments.forEach((seg, i) => {
		if (i > 0) {
			parts.push(
				<Text key={`m${i}`} className='hlChar'>
					{char}
				</Text>
			);
		}
		if (seg) {
			parts.push(<Text key={`s${i}`}>{seg}</Text>);
		}
	});
	return <>{parts}</>;
};

const FeihuaDetailPage = () => {
	const router = useRouter();
	const char = decodeURIComponent(router.params.char || '花');

	const [list, setList] = useState([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [sort, setSort] = useState('pvCount');
	const [loading, setLoading] = useState(false);
	const [loaded, setLoaded] = useState(false);

	const loadData = (p, s) => {
		if (loading) return;
		setLoading(true);
		fetchFeihuaSentences('GET', {
			char,
			page: p,
			size: PAGE_SIZE,
			sort: s,
		})
			.then((res) => {
				if (res && res.status && res.data) {
					const newList = res.data.list || [];
					// page > 1 时追加数据，否则覆盖
					setList(prev => p > 1 ? [...prev, ...newList] : newList);
					setTotal(res.data.total || 0);
					setPage(res.data.current_page || 1);
					setTotalPages(res.data.last_page || 1);
				}
			})
			.catch(() => {})
			.finally(() => {
				setLoading(false);
				setLoaded(true);
			});
	};

	useLoad(() => {
		Taro.setNavigationBarTitle({ title: `「${char}」飞花令` });
		loadData(1, sort);
	});

	// 切换排序
	const changeSort = (s) => {
		if (s === sort) return;
		setSort(s);
		loadData(1, s);
	};

	// 触底加载更多
	useReachBottom(() => {
		if (page < totalPages && !loading) {
			loadData(page + 1, sort);
		}
	});

	const goSentence = (item) => {
		// 优先跳诗词详情
		if (item.target_id) {
			Taro.navigateTo({ url: `/pages/poem/detail?id=${item.target_id}` });
		} else if (item.id) {
			Taro.navigateTo({ url: `/pages/sentence/detail?id=${item.id}` });
		}
	};

	return (
		<View className='page feihuaDetailPage'>

			<View className='fdContainer'>
				{/* 排序操作栏 */}
				<View className='sortBar'>
					<Text className='totalText'>共 {total} 首</Text>
					<View className='sortBtns'>
						<View
							className={`sortBtn ${sort === 'pvCount' ? 'active' : ''}`}
							onClick={() => changeSort('pvCount')}
						>
							热度
						</View>
						<View
							className={`sortBtn ${sort === 'likeCount' ? 'active' : ''}`}
							onClick={() => changeSort('likeCount')}
						>
							喜欢
						</View>
					</View>
				</View>

				{/* 句子列表 */}
				{loading && list.length === 0 ? (
					<View className='loadingTip'>
						<Text>加载中...</Text>
					</View>
				) : list.length === 0 && loaded ? (
					<View className='loadingTip'>
						<Text>暂无包含「{char}」的名句</Text>
					</View>
				) : (
					<View className='sentenceList'>
						{list.map((s, idx) => (
							<View
								key={s._id || `${s.id}_${idx}`}
								className='sentenceItem'
								onClick={() => goSentence(s)}
							>
								<Text className='sentenceTitle'>
									<HighlightChar text={s.title} char={char} />
								</Text>
								{s.origin ? (
									<Text className='sentenceOrigin'>{s.origin}</Text>
								) : null}
							</View>
						))}
					</View>
				)}
				{loading && list.length > 0 ? (
					<View className='loadMore'>
						<Text>加载中...</Text>
					</View>
				) : null}
				{!loading && page >= totalPages && list.length > 0 ? (
					<View className='loadMore'>
						<Text>没有更多了</Text>
					</View>
				) : null}
			</View>
		</View>
	);
};

export default FeihuaDetailPage;