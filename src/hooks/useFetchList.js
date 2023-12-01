import { useState, useEffect, useCallback, useRef } from 'react';

// 自定义 hook 内状态变化和props参数变化都会引起再次执行
const useFetchList = (fetchFn, params, pgConfig) => {
	const [data, setData] = useState({
		list: [],
		pagination: {
			...params.pagination,
		},
	});
	const [error, setError] = useState(null);
	const [loading, updateLoading] = useState(false);
	const dataRef = useRef({
		page: 0,
		last_page: 0,
		count: 0,
	});
	const loadRef = useRef(false);

	const fetchData = useCallback(() => {
		const cachePg = dataRef.current;
		const { page, last_page: lastPage } = pgConfig;
		console.log('触发「useFetchList」, 触发次数：', cachePg.count);
		// 加载中或参数未初始化，不请求
		if (loadRef.current || !params.inited) {
			loadRef.current && console.log('---在请求ing');
			!params.inited && console.log('---参数未完成初始化！');
			return false;
		}
		// 当前和缓存分页数据相同，不请求
		if (page === cachePg.page && lastPage === cachePg.last_page) {
			return false;
		}
		// 更新网络请求状态
		loadRef.current = true;
		updateLoading(true);
		dataRef.current.count = cachePg.count + 1;
		console.log('---分页数据不同，发起请求：', page, cachePg.page);
		console.log('--listParams:', {
			...params,
			page,
		});
		fetchFn('GET', {
			...params,
			page,
		})
			.then((res) => {
				if (res.data && res.statusCode == 200) {
					const { requestType = 'poem' } = params;
					let _pgConfig = {};
					if (requestType === 'poem') {
						_pgConfig = res.data.poems;
					} else if (requestType === 'poet') {
						_pgConfig = res.data.poets;
					} else if (requestType === 'collect') {
						_pgConfig = res.data.data;
					}
					const {
						data: poemData,
						current_page,
						last_page,
						total,
					} = _pgConfig;
					dataRef.current = {
						...cachePg,
						page: current_page,
						last_page,
						total,
					};
					loadRef.current = false;
					console.log('----请求成功--更新数据');
					setData((preData) => {
						const List =
							page > 1
								? [...preData.list, ...poemData]
								: poemData;
						return {
							list: List,
							pagination: {
								...cachePg,
								page: current_page,
								last_page,
								total,
							},
						};
					});
					updateLoading(false);
				} else {
					console.log('----请求失败');
					loadRef.current = false;
					updateLoading(false);
					setError('列表加载报错');
				}
			})
			.catch((err) => {
				console.log('----请求失败--进入 catch 回调函数');
				console.log(err);
				setError(err);
				loadRef.current = false;
				updateLoading(false);
			});
	}, [fetchFn, params, pgConfig]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return {
		error,
		data,
		loading,
		setData
	};
};
export default useFetchList;
