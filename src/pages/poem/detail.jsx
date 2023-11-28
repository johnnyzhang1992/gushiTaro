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
import { View, Image } from '@tarojs/components';

import { fetchPoemDetail } from './service';

import PoemCard from './components/PoemCard';
import PoemSection from './components/PoemSection';
import LongTextCard from '../../components/LongTextCard';
import TagsCard from '../../components/TagsCard';
import FixBottom from './components/FixBottom';
import AudioCard from '../../components/AudioCard';

import copyPng from '../../images/icon/copy.png';

import './style.scss';

const PoemDetail = () => {
	const { setTitle } = useNavigationBar({ title: '古诗文小助手' });
	const [detail, setDetail] = useState({
		poem: {
			tagsArr: [],
			title: '',
			author: '',
		},
		detail: {
			yi: '',
			zhu: '',
		},
	});
	const cacheRef = useRef({
		poemId: 48769,
	});

	const computeData = (data) => {
		const { poem, detail: poemDetail } = data;
		let _detail = { ...poemDetail };
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
		_poem.tagsArr = String(_poem.tags).split(',');
		console.log(_poem, _detail);
		setDetail({
			...detail,
			poem: _poem,
			detail: _detail,
		});
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

	const handlecopy = () => {
		let poem = detail.poem;
		let _data =
			'《' +
			poem.title +
			'》' +
			poem.dynasty +
			'|' +
			poem.author +
			'\n' +
			poem.text_content;
		Taro.setClipboardData({
			data: _data,
			success: function () {
				Taro.showToast({
					title: '诗词复制成功',
					icon: 'success',
					duration: 2000,
				});
			},
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

	return (
		<View className='page'>
			{/* 诗词内容 */}
			<PoemCard {...detail.poem} />
			{/* 音频播放 */}
			<AudioCard
				id={detail.poem.id}
				title={detail.poem.title}
				author={detail.poem.author}
			/>
			{/* 标签 */}
			{detail.poem.tagsArr.length > 0 ? (
				<PoemSection title='分类'>
					<TagsCard tags={detail.poem.tagsArr || []} />
				</PoemSection>
			) : null}
			{/* 创作背景 */}
			{detail.poem.background ? (
				<PoemSection title='创作背景'>
					<LongTextCard
						title='创作背景'
						showAll={false}
						text={detail.poem.background || ''}
					/>
				</PoemSection>
			) : null}
			{/* 赏析 */}
			{detail.detail.shangxi && detail.detail.shangxi.content ? (
				<PoemSection title='赏析'>
					<LongTextCard
						title='赏析'
						showAll={false}
						text={detail.detail.shangxi || ''}
					/>
				</PoemSection>
			) : null}
			{/* 操作栏 收藏，音频，复制 */}
			<View className='copyContainer' onClick={handlecopy}>
				<Image src={copyPng} className='copy' />
			</View>
			{/* 统计数据 -- 点赞、收藏人数*/}
			{/* 注释，译文，摘录，学习计划 -- 半屏 */}
			<FixBottom poem={detail.poem} poemDetail={detail.detail} />
		</View>
	);
};

export default PoemDetail;
