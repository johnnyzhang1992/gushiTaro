import { AtTabs, AtTabsPane } from 'taro-ui';
import { View } from '@tarojs/components';
import { useCallback, useState } from 'react';
import Taro, {
	useLoad,
	usePullDownRefresh,
	useReachBottom,
} from '@tarojs/taro';
import { useNavigationBar } from 'taro-hooks';
import CollectContainer from './components/CollectContainer';

const tabList = [
	{
		title: '诗词',
	},
	{
		title: '名句',
	},
	{
		title: '诗人',
	},
];
const types = ['poem', 'sentence', 'author'];
const CollectPage = () => {
	const { setTitle } = useNavigationBar({ title: '我的收藏' });

	const [currentIndex, setIndex] = useState(0);
	const [pagination, updatePagination] = useState({
		poem: {
			page: 1,
			last_page: 2,
		},
		sentence: {
			page: 1,
			last_page: 2,
		},
		author: {
			page: 1,
			last_page: 2,
		},
	});

	const handleTabChange = (val) => {
		setIndex(val);
	};

	useLoad((options) => {
		console.log('options', options);
		const { type } = options;
		const findIndex = types.findIndex((item) => {
			return item == type;
		});
		setTitle('我的收藏');
		setIndex(findIndex || 0);
	});

	useReachBottom(() => {
		const type = types[currentIndex];
		const prePagination = { ...pagination };
		const pgObj = prePagination[type];
		if (pgObj.page < pgObj.last_page) {
			prePagination[type] = {
				...prePagination[type],
				page: pgObj.page + 1,
			};
			updatePagination(prePagination);
		}
	});

	usePullDownRefresh(() => {
		console.log('page-pullRefresh');
		const type = types[currentIndex];
		const prePagination = { ...pagination };
		prePagination[type] = {
			...prePagination[type],
			page: 1,
			last_page: 2,
		};
		updatePagination(prePagination);
		Taro.stopPullDownRefresh();
	});

	const updatePage = useCallback(({ type, page, last_page }) => {
		updatePagination((pre) => {
			const prePagination = { ...pre };
			prePagination[type] = {
				...prePagination[type],
				page,
				last_page,
			};
			return prePagination;
		});
	}, []);

	return (
		<View className='page collectPage'>
			<AtTabs
				current={currentIndex}
				tabList={tabList}
				swipeable={false}
				onClick={handleTabChange}
			>
				<AtTabsPane current={currentIndex} index={0}>
					<CollectContainer
						type='poem'
						page={pagination['poem'].page}
						updatePage={updatePage}
					/>
				</AtTabsPane>
				<AtTabsPane current={currentIndex} index={1}>
					<CollectContainer
						type='sentence'
						page={pagination['sentence'].page}
						updatePage={updatePage}
					/>
				</AtTabsPane>
				<AtTabsPane current={currentIndex} index={2}>
					<CollectContainer
						type='author'
						page={pagination['author'].page}
						updatePage={updatePage}
					/>
				</AtTabsPane>
			</AtTabs>
		</View>
	);
};

export default CollectPage;
