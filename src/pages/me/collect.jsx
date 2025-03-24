import { View } from '@tarojs/components';
import { useCallback, useState } from 'react';
import Taro, {
	useLoad,
	usePullDownRefresh,
	useReachBottom,
} from '@tarojs/taro';
import { useNavigationBar } from 'taro-hooks';

import './style.scss';

import CollectContainer from './components/CollectContainer';

const types = ['poem', 'sentence', 'author'];
const typeObj = {
	poem: '作品',
	sentence: '摘录',
	author: '作者',
};
const CollectPage = () => {
	const { setTitle } = useNavigationBar({ title: '我的收藏' });

	const [currentIndex, setIndex] = useState(-1);
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

	useLoad((options) => {
		console.log('options', options);
		const { type = 'poem' } = options;
		const findIndex = types.findIndex((item) => {
			return item == type;
		});
		setTitle('我的收藏 | ' + typeObj[type]);
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
			{currentIndex == 0 ? (
				<CollectContainer
					type='poem'
					page={pagination['poem'].page}
					updatePage={updatePage}
				/>
			) : null}

			{currentIndex == 1 ? (
				<CollectContainer
					type='sentence'
					page={pagination['sentence'].page}
					updatePage={updatePage}
				/>
			) : null}

			{currentIndex == 2 ? (
				<CollectContainer
					type='author'
					page={pagination['author'].page}
					updatePage={updatePage}
				/>
			) : null}
		</View>
	);
};

export default CollectPage;
