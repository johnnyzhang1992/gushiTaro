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
import LongTextCard from '../../components/LongTextCard';
import PoemCard from './components/PoemCard';

import SentenceCard from '../../components/SentenceCard';
import FixBottom from './components/FixBottom';
import TagsCard from '../../components/TagsCard';
import FabButton from '../../components/FabButton';
import CopyButton from '../../components/CopyButton';
// import PinyinButton from '../../components/PinyinButton';
import { isSkyline } from '../../utils/env';
import RootFixed from '../../components/RootFixed';

import './style.scss';

const PoemDetail = () => {
	const { setTitle } = useNavigationBar({ title: '古诗文小助手' });
	const [detail, setDetail] = useState({
		poem: {
			tagsArr: [],
			title: '',
			author: '',
			author_id: 0,
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
	// const [pinyin, updatePinyin] = useState({ title: '', xu: '', content: [] });
	const cacheRef = useRef({
		poemId: 48769,
	});

	// 处理返回的数据， 特别是json 的解析
	const computeData = (data) => {
		const { poem, detail: poemDetail, sentences = [] } = data;
		// 兼容新旧格式：新 API 直接返回 poem 对象
		const poemData = poem || data;
		const hasDetail = poemDetail && (poemDetail.shangxi || poemDetail.translation || poemDetail.annotation || poemDetail.yi || poemDetail.zhu);
		let _detail = {};
		if (hasDetail) {
			_detail = { ...poemDetail };
		} else {
			// 新格式：从 poem 对象中提取
			_detail = {
				shangxi: poemData.shangxi || '',
				translation: poemData.translation || '',
				annotation: poemData.annotation || '',
			};
		}
		let _poem = { ...poemData };
		_poem.tagsArr = _poem.tags ? String(_poem.tags || '').split(',') : [];
		const {
			title = '',
			dynasty = '',
			author = '',
			text_content = '',
		} = poemData || {};
		setDetail({
			...detail,
			copy_text:
				'《' + title + '》\n[' + dynasty + ']' + author + '\n' + text_content,
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
				console.log('诗词详情返回:', res);
				// request.js 返回格式: { status: true, data: {...} }
				const apiData = res?.data || res;
				if ((res.status || res.statusCode === 200) && apiData) {
					// 兼容新旧格式
					const poemData = apiData.poem || apiData;
					const detailData = apiData.detail || {};
					const sentencesData = apiData.sentences || [];
					computeData({ poem: poemData, detail: detailData, sentences: sentencesData });
					setTitle(poemData.title);
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
		const { id, scene } = options;
		console.log('options', options);
		let poemId = id;
		if (scene) {
			poemId = decodeURIComponent(options.scene).split('=')[1];
		}
		cacheRef.current.poemId = poemId;
		if (!poemId || poemId < 0) {
			Taro.switchTab({
				url: '/pages/index',
			});
		}
		fetchDetail(poemId);
		setOptions((pre) => ({
			...pre,
			...options,
			id: poemId,
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
			{!isSkyline() && <OfficialAccount />}
			{/* 摘录 */}
			{detail.sentences.length > 0 ? (
				<SectionCard title='摘录'>
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
			{detail.detail.shangxi ? (
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
			<RootFixed>
			<View
				className='bottomOperate'
				style={{
					bottom: '150rpx',
					paddingBottom: `env(safe-area-inset-bottom)`,
				}}
			>
				<CopyButton className='copy' text={detail.copy_text || ''} />
				{/* <PinyinButton
					className='pinyin'
					poemId={detail.poem.id}
					handlePinyinChange={updatePinyin}
				/> */}
			</View>
			</RootFixed>
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
	);
};

export default PoemDetail;
