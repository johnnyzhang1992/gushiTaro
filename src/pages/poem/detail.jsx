import { useState, useRef } from 'react';
import Taro, {
	useLoad,
	useDidHide,
	useDidShow,
	useUnload,
	usePullDownRefresh,
	useReachBottom,
} from '@tarojs/taro';
import { useNavigationBar } from 'taro-hooks';
import { View } from '@tarojs/components';

import { fetchPoemDetail } from './service';

import PoemCard from './components/PoemCard';

const Page = () => {
	const { setTitle } = useNavigationBar({ title: '古诗文小助手' });
	const [detail, setDetail] = useState({});
	const cacheRef = useRef({
		poemId: 48769,
	});

	const computeData = (data) => {
		const { poem, detail: poemDetail } = data;
		let _detail = {...poemDetail};
		if (_detail && _detail.yi) {
			_detail.yi = JSON.parse(_detail.yi || '{}');
		}
		if (_detail && _detail.zhu) {
			_detail.zhu = JSON.parse(_detail.zhu || '{}');
		}
		if (_detail && _detail.shangxi) {
			_detail.shangxi = JSON.parse(_detail.shangxi || '{}');
		}
		if (_detail && _detail.more_infos) {
			_detail.more_infos = JSON.parse(_detail.more_infos || '{}');
		}
		let _poem = { ...poem };
		_poem.content = JSON.parse(_poem.content || '{}');
		_poem.tagsArr = String(_poem.tags).split(',')
		console.log(_poem, _detail);
		setDetail({
			...detail,
			poem: _poem,
			detail: _detail,
		})
	};

	const fetchDetail = (id) => {
		const { poemId } = cacheRef.current;
		fetchPoemDetail('GET', {
			id: id || poemId,
		})
			.then((res) => {
				if (res && res.statusCode === 200) {
					console.log(res.data);
					computeData(res.data);
					// setDetail(res.data);
					const { poem } = res.data;
					setTitle(poem.title);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	console.log(detail);
	useLoad((options) => {
		const { id } = options;
		console.log('options', options);
		cacheRef.current.poemId = id;
		fetchDetail(id || 48769);
	});
	useDidShow(() => {
		console.log('page--show');
	});
	useDidHide(() => {
		console.log('page-hide');
	});
	usePullDownRefresh(() => {
		fetchDetail();
		console.log('page-pullRefresh');
		Taro.stopPullDownRefresh();
	});
	useReachBottom(() => {
		console.log('--rearchBottom');
	});
	useUnload(() => {
		console.log('page-unload');
	});

	return <View className='page'>
		{/* 诗词内容 */}
		<PoemCard {...detail.poem} />
		{/* 操作栏 收藏，播放，复制，加入学习计划 */}
		{/* 统计数据 -- 点赞、收藏人数*/}
		{/* 诗词名句 -- 半屏 */}
		{/* 标签 */}
		{/* 注释，翻译，赏析，创作背景 -- 半屏 */}
	</View>;
};

export default Page;
