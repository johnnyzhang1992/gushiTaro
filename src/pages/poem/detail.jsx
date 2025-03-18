import { useState, useRef } from 'react';
import Taro, {
	useLoad,
	usePullDownRefresh,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';
import { useNavigationBar } from 'taro-hooks';
import {
	View,
	// Image,
	OfficialAccount,
	Swiper,
	SwiperItem,
} from '@tarojs/components';

import { fetchPoemDetail } from './service';

import SectionCard from '../../components/SectionCard';
import Layout from '../../layout';
import LongTextCard from '../../components/LongTextCard';
import PoemCard from './components/PoemCard';

import SentenceCard from '../../components/SentenceCard';
import FixBottom from './components/FixBottom';
import TagsCard from '../../components/TagsCard';
import FabButton from '../../components/FabButton';

import './style.scss';

const PoemDetail = () => {
	const { setTitle } = useNavigationBar({ title: '古诗文小助手' });
	const [detail, setDetail] = useState({
		poem: {
			tagsArr: [],
			title: '',
			author: '',
			author_id: 0
		},
		detail: {
			yi: '',
			zhu: '',
		},
		sentences: [],
	});
	const [pageOptions, setOptions] = useState({
		keyWord: '',
	});
	const cacheRef = useRef({
		poemId: 48769,
	});

	// 处理返回的数据， 特别是json 的解析
	const computeData = (data) => {
		const { poem, detail: poemDetail, sentences = [] } = data;
		let _detail = { ...(poemDetail || { yi: '', zhu: '' }) };
		let _poem = { ...poem };
		_poem.tagsArr = _poem.tags ? String(_poem.tags || '').split(',') : [];
		setDetail({
			...detail,
			poem: _poem,
			detail: _detail,
			sentences,
		});
	};

	// 加载详情数据
	const fetchDetail = (id) => {
		const { poemId } = cacheRef.current;
		Taro.showLoading();
		fetchPoemDetail('GET', {
			id: id || poemId,
		})
			.then((res) => {
				if (res && res.statusCode === 200) {
					const { poem } = res.data;
					computeData(res.data);
					setTitle(poem.title);
				}
			})
			.finally(() => {
				Taro.hideLoading();
			})
			.catch((err) => {
				console.log(err);
			});
	};

	useLoad((options) => {
		const { id } = options;
		console.log('options', options);
		cacheRef.current.poemId = id;
		if (!id || id < 0) {
			Taro.switchTab({
				url: '/pages/index',
			});
		}
		fetchDetail(id);
		setOptions((pre) => ({
			...pre,
			...options,
		}));
	});

	usePullDownRefresh(() => {
		fetchDetail();
		console.log('page-pullRefresh');
		Taro.stopPullDownRefresh();
	});

	useShareAppMessage(() => {
		const { poem } = detail;
		return {
			title: poem.title || '诗文详情',
			path: '/pages/poem/detail?id=' + poem.id,
		};
	});

	useShareTimeline(() => {
		const { poem } = detail;
		return {
			title: poem.title || '诗文详情',
			path: '/pages/poem/detail?id=' + poem.id,
		};
	});

	return (
		<Layout>
			<View className='page poemDetail'>
				{/* 诗词内容 */}
				<PoemCard {...detail.poem} lightWord={pageOptions.keyWord} />
				{/* 标签 */}
				{detail.poem.tagsArr.length > 0 ? (
					<SectionCard title=''>
						<TagsCard tags={detail.poem.tagsArr || []} />
					</SectionCard>
				) : null}
				{/* 公众号 */}
				<OfficialAccount />
				{/* 摘录 */}
				{detail.sentences.length > 0 ? (
					<SectionCard title='句子摘录'>
						<Swiper
							className='hotPoemsSwiper'
							indicatorColor='#999'
							indicatorActiveColor='#333'
							vertical={false}
							circular
							indicatorDots={detail.sentences.length > 1}
							autoplay
							adjustHeight='highest'
							style={{
								height: '176rpx',
							}}
						>
							{detail.sentences.map((sentence) => (
								<SwiperItem key={sentence.id}>
									<SentenceCard
										{...sentence}
										showCount={false}
										showBorder={false}
									/>
								</SwiperItem>
							))}
						</Swiper>
					</SectionCard>
				) : null}
				{/* 创作背景 */}
				{detail.poem.background ? (
					<SectionCard title='创作背景'>
						<LongTextCard
							title='创作背景'
							showAll={false}
							text={detail.poem.background || ''}
						/>
					</SectionCard>
				) : null}
				{/* 赏析 */}
				{detail.detail.shangxi && detail.detail.shangxi.content ? (
					<SectionCard title='赏析'>
						<LongTextCard
							title='赏析'
							showAll={false}
							text={detail.detail.shangxi || ''}
						/>
					</SectionCard>
				) : null}
				{/* 操作栏 复制 */}
				{/* <View className='copyContainer' onClick={handlePlayAudio}>
					<Image src={audioSvg} className='copy' />
				</View> */}
				{/* 统计数据 -- 点赞、收藏人数*/}
				{/* 注释，译文，摘录，学习计划 -- 半屏 */}
				<FixBottom poem={detail.poem} poemDetail={detail.detail} />
				{/* 悬浮按钮 */}
				<FabButton
					style={{
						bottom: '150rpx',
						marginBottom: `env(safe-area-inset-bottom)`,
					}}
				/>
			</View>
		</Layout>
	);
};

export default PoemDetail;
