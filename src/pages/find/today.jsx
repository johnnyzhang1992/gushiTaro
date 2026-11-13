import { View, Text, Picker, ScrollView } from '@tarojs/components';
import Taro, {
	useLoad,
	usePullDownRefresh,
	useReachBottom,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';
import { useState, useCallback, useRef, useMemo } from 'react';

import {
	fetchHistoryToday,
	fetchHistoryEvents,
	fetchHistoryPoemDetail,
} from './today.service';

import './today.scss';

const POEM_PAGE_SIZE = 10;
const EVENT_PAGE_SIZE = 20;

function pad(n) {
	return String(n).padStart(2, '0');
}

// 按句末标点断行：逗号保留行内，。！？ 处换行
function splitSentences(clauses) {
	const lines = [];
	let buf = '';
	for (const c of clauses || []) {
		buf += c;
		if (/[。！？]$/.test(buf)) {
			lines.push(buf);
			buf = '';
		}
	}
	if (buf) lines.push(buf);
	return lines;
}

const TodayPage = () => {
	const now = new Date();
	const todayStr = `${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
	const [date, setDate] = useState(todayStr);
	const [meta, setMeta] = useState(null);
	const [poems, setPoems] = useState([]);
	const [poemPg, setPoemPg] = useState(null);
	const [events, setEvents] = useState([]);
	const [eventPg, setEventPg] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [more, setMore] = useState({
		poems: { loading: false, error: '' },
		events: { loading: false, error: '' },
	});
	// 内容 Tab：poems=文学作品里的这一天 / events=历史上的今天
	const [activeTab, setActiveTab] = useState('poems');
	// 详情弹窗
	const [poemDetail, setPoemDetail] = useState(null);

	// 单飞守卫：all 递增会使在途的列表追加/详情响应全部作废
	const seq = useRef({ all: 0, poems: 0, events: 0, detail: 0 });
	const busy = useRef({ poems: false, events: false });

	const setMoreState = (kind, patch) =>
		setMore((m) => ({ ...m, [kind]: { ...m[kind], ...patch } }));

	const [selMonth, selDay] = date.split('-').map(Number);
	const monthDay = `${selMonth}月${selDay}日`;
	const lunar = meta?.lunarDate || {};

	// 月/日联动选择：colMonth 驱动日期列天数，滚动月份时即时重算
	const [colMonth, setColMonth] = useState(selMonth);
	const [multiValue, setMultiValue] = useState([selMonth - 1, selDay - 1]);
	const monthOptions = [...Array(12)].map((_, i) => `${i + 1}月`);
	const dayOptions = [...Array(new Date(now.getFullYear(), colMonth, 0).getDate())].map(
		(_, i) => `${i + 1}日`
	);

	const syncPicker = (m, d) => {
		setColMonth(m);
		setMultiValue([m - 1, d - 1]);
	};

	// 加载首屏：主路由（农历+作品第一页）与事件第一页并行
	const loadAll = useCallback((d) => {
		const my = ++seq.current.all;
		seq.current.poems++;
		seq.current.events++;
		busy.current.poems = false;
		busy.current.events = false;
		setLoading(true);
		setError('');
		setMore({
			poems: { loading: false, error: '' },
			events: { loading: false, error: '' },
		});
		return Promise.all([
			fetchHistoryToday('GET', { date: d, page: 1, pageSize: POEM_PAGE_SIZE }).catch(
				() => null
			),
			fetchHistoryEvents('GET', { date: d, page: 1, pageSize: EVENT_PAGE_SIZE }).catch(
				() => null
			),
		])
			.then(([mainRes, evRes]) => {
				if (my !== seq.current.all) return;
				if (mainRes && mainRes.status && mainRes.data) {
					const md = mainRes.data;
					setMeta({ lunarDate: md.lunarDate, festivals: md.festivals || [] });
					setPoems(md.poems || []);
					setPoemPg(md.pagination || null);
				} else {
					setError('加载失败，请重试');
				}
				if (evRes && evRes.status && evRes.data) {
					setEvents(evRes.data.events || []);
					setEventPg(evRes.data.pagination || null);
				} else {
					setEvents([]);
					setEventPg(null);
					setMoreState('events', { error: '历史事件加载失败，点击重试' });
				}
			})
			.catch(() => {
				if (my !== seq.current.all) return;
				setError('加载失败，请重试');
			})
			.finally(() => {
				if (my === seq.current.all) setLoading(false);
			});
	}, []);

	useLoad(() => {
		loadAll(date);
	});

	usePullDownRefresh(() => {
		loadAll(date).finally(() => Taro.stopPullDownRefresh());
	});

	useShareAppMessage(() => ({
		title: '每日一诗 · 历史上的今天',
		path: '/pages/find/today',
	}));

	useShareTimeline(() => ({
		title: '每日一诗 · 历史上的今天',
		path: '/pages/find/today',
	}));

	// 触底加载当前 tab 的下一页
	const loadMore = useCallback(
		(kind) => {
			const pg = kind === 'poems' ? poemPg : eventPg;
			if (!pg || pg.page >= pg.totalPages) return;
			if (busy.current[kind] || more[kind].loading) return;
			const my = ++seq.current[kind];
			busy.current[kind] = true;
			setMoreState(kind, { loading: true, error: '' });
			const req =
				kind === 'poems'
					? fetchHistoryToday('GET', {
							date,
							page: pg.page + 1,
							pageSize: POEM_PAGE_SIZE,
						})
					: fetchHistoryEvents('GET', {
							date,
							page: pg.page + 1,
							pageSize: EVENT_PAGE_SIZE,
						});
			req
				.then((res) => {
					if (my !== seq.current[kind]) return;
					if (res && res.status && res.data) {
						const rd = res.data;
						if (kind === 'poems') {
							setPoems((prev) => [...prev, ...(rd.poems || [])]);
							setPoemPg(rd.pagination || null);
						} else {
							setEvents((prev) => [...prev, ...(rd.events || [])]);
							setEventPg(rd.pagination || null);
						}
					} else {
						setMoreState(kind, { error: '加载失败，点击重试' });
					}
				})
				.catch(() => {
					if (my !== seq.current[kind]) return;
					setMoreState(kind, { error: '加载失败，点击重试' });
				})
				.finally(() => {
					if (my === seq.current[kind]) {
						busy.current[kind] = false;
						setMoreState(kind, { loading: false });
					}
				});
		},
		[date, poemPg, eventPg, more]
	);

	useReachBottom(() => {
		loadMore(activeTab === 'poems' ? 'poems' : 'events');
	});

	// 前后一天切换
	const changeDay = (offset) => {
		const dt = new Date(now.getFullYear(), selMonth - 1, selDay + offset);
		const nd = `${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
		setDate(nd);
		syncPicker(dt.getMonth() + 1, dt.getDate());
		loadAll(nd);
	};

	const goToday = () => {
		setDate(todayStr);
		syncPicker(now.getMonth() + 1, now.getDate());
		loadAll(todayStr);
	};

	const changeTo = (m, d) => {
		const maxDay = new Date(now.getFullYear(), m, 0).getDate();
		const dd = Math.min(d, maxDay);
		const nd = `${pad(m)}-${pad(dd)}`;
		setDate(nd);
		syncPicker(m, dd);
		loadAll(nd);
	};

	const handleColumnChange = (e) => {
		const { column, value } = e.detail;
		if (column !== 0) return;
		const m = value + 1;
		const maxDay = new Date(now.getFullYear(), m, 0).getDate();
		setColMonth(m);
		setMultiValue(([, dIdx]) => [value, Math.min(dIdx, maxDay - 1)]);
	};

	const handleMultiChange = (e) => {
		const [mi, di] = e.detail.value;
		changeTo(mi + 1, di + 1);
	};

	// 查看诗词详情
	const openDetail = (item) => {
		if (!item.title) return; // 无详情数据的降级项
		const my = ++seq.current.detail;
		setPoemDetail({ loading: true });
		fetchHistoryPoemDetail(item.id)
			.then((res) => {
				if (my !== seq.current.detail) return;
				if (res && res.status && res.data) {
					setPoemDetail(res.data);
				} else {
					setPoemDetail({ error: '未找到该作品' });
				}
			})
			.catch(() => {
				if (my !== seq.current.detail) return;
				setPoemDetail({ error: '加载失败' });
			});
	};
	const closeDetail = () => setPoemDetail(null);

	const detailLines = useMemo(
		() => splitSentences(poemDetail?.clauses),
		[poemDetail]
	);

	// 列表尾部：加载中 / 重试 / 已加载全部
	const renderFooter = (kind) => {
		const pg = kind === 'poems' ? poemPg : eventPg;
		const st = more[kind];
		const list = kind === 'poems' ? poems : events;
		if (st.error) {
			return (
				<View className='listFooter'>
					<Text
						className='listRetry'
						onClick={() => (pg ? loadMore(kind) : loadAll(date))}
					>
						{st.error}
					</Text>
				</View>
			);
		}
		if (st.loading) {
			return (
				<View className='listFooter'>
					<Text className='listHint'>加载中...</Text>
				</View>
			);
		}
		if (pg && pg.page >= pg.totalPages && list.length > 0) {
			return (
				<View className='listFooter'>
					<Text className='listHint'>
						共 {pg.total} {kind === 'poems' ? '篇' : '条'}
					</Text>
				</View>
			);
		}
		return null;
	};

	return (
		<View className='page todayPage'>
			<View className='todayContainer'>
				{/* 日期导航 */}
				<View className='dateNav'>
					<View className='navArrow' onClick={() => changeDay(-1)}>
						‹
					</View>
					<Picker
						mode='multiSelector'
						range={[monthOptions, dayOptions]}
						value={multiValue}
						onColumnChange={handleColumnChange}
						onChange={handleMultiChange}
					>
						<View className='picker'>
							{monthDay}
							<Text className='pickerArrow'>▾</Text>
						</View>
					</Picker>
					<View className='navBtn todayBtn' onClick={goToday}>
						今天
					</View>
					<View className='navArrow' onClick={() => changeDay(1)}>
						›
					</View>
				</View>

				{error && meta ? (
					<View className='retryBar'>
						<Text className='retryText'>{error}</Text>
						<Text className='retryBtn' onClick={() => loadAll(date)}>
							重试
						</Text>
					</View>
				) : null}

				{!meta && loading ? (
					<View className='loadingBlock'>
						<Text className='text'>加载中...</Text>
					</View>
				) : !meta && error ? (
					<View className='loadingBlock'>
						<Text className='text'>{error}</Text>
						<View className='retryBtn blockRetry' onClick={() => loadAll(date)}>
							重试
						</View>
					</View>
				) : meta ? (
					<>
						{/* 农历卡片：与首页同款白卡形态 */}
						<View className='lunarCard'>
							<View className='lunarBody'>
								<View className='lunar-left'>
									<Text className='lunar-tag'>
										农历 · {lunar.ganzhiYear}年
									</Text>
									<Text className='lunar-date' userSelect>
										{lunar.monthChinese}月{lunar.dayChinese}
									</Text>
									<Text className='lunar-sub' userSelect>
										{lunar.shengxiao}年 · {lunar.ganzhiMonth}月{lunar.ganzhiDay}日
									</Text>
								</View>
								<View className='solar-right'>
									<Text className='solar-tag'>公历</Text>
									<Text className='solar-date'>{monthDay}</Text>
								</View>
							</View>
							{meta.festivals.length > 0 ? (
								<View className='lunarFooter'>
									<Text className='meta-item festival' userSelect>
										{meta.festivals[0]}
									</Text>
								</View>
							) : null}
						</View>

						{/* 内容 Tabs */}
						<View className='contentTabs'>
							<View
								className={`contentTab ${activeTab === 'poems' ? 'active' : ''}`}
								onClick={() => setActiveTab('poems')}
							>
								<Text className='tabText'>文学作品里的这一天</Text>
							</View>
							<View
								className={`contentTab ${activeTab === 'events' ? 'active' : ''}`}
								onClick={() => setActiveTab('events')}
							>
								<Text className='tabText'>历史上的今天</Text>
							</View>
						</View>

						{activeTab === 'poems' ? (
							<View className='section'>
								{poems.length > 0 ? (
									poems.map((p, idx) => (
										<View
											key={`${p.id}_${idx}`}
											className='poemCard'
											onClick={() => openDetail(p)}
										>
											<View className='poemCardTop'>
												<Text className='poemCardTitle' userSelect>
													{p.title || `作品 #${p.id}`}
												</Text>
												{p.year ? (
													<Text className='yearBadge' userSelect>
														{p.year}年
													</Text>
												) : null}
											</View>
											{p.preview ? (
												<View className='poemPreview'>
													{p.preview.split('\n').map((line, i) => (
														<Text key={i} className='poemPreviewLine' userSelect>
															{line}
														</Text>
													))}
												</View>
											) : null}
											<View className='poemCardMeta'>
												<Text userSelect>
													{p.author ? `${p.author} · ${p.dynasty || ''}` : '作者不详'}
												</Text>
												{p.type ? <Text className='typeBadge'>{p.type}</Text> : null}
											</View>
										</View>
									))
								) : !more.poems.error ? (
									<View className='emptyTip'>
										<Text>暂无相关作品</Text>
									</View>
								) : null}
								{renderFooter('poems')}
							</View>
						) : (
							<View className='section'>
								{events.length > 0 ? (
									events.map((ev, i) => (
										<View key={`${ev.year}_${i}`} className='eventItem'>
											<Text className='eventYear' userSelect>
												{ev.year}年
											</Text>
											<Text className='eventTitle' userSelect>
												{ev.title}
											</Text>
										</View>
									))
								) : !more.events.error ? (
									<View className='emptyTip'>
										<Text>暂无历史事件</Text>
									</View>
								) : null}
								{renderFooter('events')}
							</View>
						)}
					</>
				) : null}
			</View>

			{/* 诗词详情弹层 */}
			{poemDetail ? (
				<View className='detailMask' catchMove onClick={closeDetail}>
					<View
						className='detailContent'
						catchMove
						onClick={(e) => e.stopPropagation()}
					>
						{poemDetail.loading ? (
							<Text className='detailLoading'>加载中...</Text>
						) : poemDetail.error ? (
							<Text className='detailLoading'>{poemDetail.error}</Text>
						) : (
							<>
								<View className='detailHeader'>
									<Text className='detailTitle' userSelect>
										{poemDetail.title}
									</Text>
									<View className='detailCloseBtn' onClick={closeDetail}>
										<Text className='detailClose'>×</Text>
									</View>
								</View>
								<Text className='detailMeta' userSelect>
									{poemDetail.author} · {poemDetail.dynasty}
									{poemDetail.year ? ` · 公元${poemDetail.year}年` : ''}
									{poemDetail.type ? ` · ${poemDetail.type}` : ''}
								</Text>
								<View className='detailDivider' />
								<ScrollView scrollY className='detailBody'>
									{detailLines.map((line, i) => (
										<Text key={i} className='detailLine' userSelect decode>
											{line}
										</Text>
									))}
								</ScrollView>
							</>
						)}
					</View>
				</View>
			) : null}
		</View>
	);
};

export default TodayPage;