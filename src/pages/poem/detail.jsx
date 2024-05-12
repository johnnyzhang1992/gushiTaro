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
	Image,
	OfficialAccount,
	Swiper,
	SwiperItem,
} from '@tarojs/components';

import { fetchPoemDetail } from './service';

import Layout from '../../layout';
import SectionCard from '../../components/SectionCard';
import LongTextCard from '../../components/LongTextCard';
import PoemCard from './components/PoemCard';

import SentenceCard from '../../components/SentenceCard';
import AudioCard from '../../components/AudioCard';
import FixBottom from './components/FixBottom';
import TagsCard from '../../components/TagsCard';
import FabButton from '../../components/FabButton';

import audioSvg from '../../images/svg/audio.svg';

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
		_poem.tagsArr = _poem.tags === '' ? [] : String(_poem.tags).split(',');
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

	const handlePlayAudio = () => {
		Taro.eventCenter.trigger('poemAudioAdd', {
			id: detail.poem.id,
			author: detail.poem.author,
			author_id: detail.poem.author_id,
			title: detail.poem.title,
			dynasty: detail.poem.dynasty,
			xu: detail.poem.xu || '',
			content: detail.poem.content || {content: []},
			author_avatar: detail.poem.author_avatar || ''
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
				{/* 音频播放 */}
				<AudioCard
					id={detail.poem.id}
					title={detail.poem.title}
					author={detail.poem.author}
				/>
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
				<View className='copyContainer' onClick={handlePlayAudio}>
					<Image src={audioSvg} className='copy' />
				</View>
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
