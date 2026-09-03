import { View, Text, Picker, ScrollView } from '@tarojs/components';
import Taro, { useLoad, usePullDownRefresh } from '@tarojs/taro';
import { useState, useCallback } from 'react';

import PageHeader from '../../components/PageHeader';

import { fetchHistoryToday, fetchHistoryPoemDetail } from './today.service';

import './today.scss';

const PAGE_SIZE = 10;

function pad(n) {
	return String(n).padStart(2, '0');
}

// 农历数字转中文（fallback）
function lunarNum(n) {
	const chars = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
	if (n <= 12) return chars[n];
	if (n < 20) return '十' + chars[n - 10];
	if (n < 30) return '二十' + (n > 20 ? chars[n - 20] : '');
	return '三十' + (n > 30 ? chars[n - 30] : '');
}

function lunarDayText(n) {
	const prefix = n <= 10 ? '初' : n < 20 ? '十' : n < 30 ? '二十' : '三十';
	const d = n <= 10 ? n : n < 20 ? n - 10 : n < 30 ? n - 20 : n - 30;
	const chars = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
	return prefix + chars[d];
}

const TodayPage = () => {
	const now = new Date();
	const [date, setDate] = useState(`${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	// 详情弹窗
	const [poemDetail, setPoemDetail] = useState(null);
	const [detailLoading, setDetailLoading] = useState(false);
	// 内容 Tab：poems=文学作品里的这一天 / events=历史上的今天
	const [activeTab, setActiveTab] = useState('poems');

	const monthDay = date.replace('-', '月') + '日';
	const lunarText = data?.lunarDate
		? `${data.lunarDate.monthChinese}月${data.lunarDate.dayChinese}`
		: '';

	// 加载数据
	const loadData = useCallback((d, p) => {
		setLoading(true);
		setError('');
		fetchHistoryToday('GET', { date: d, page: p, pageSize: PAGE_SIZE })
			.then((res) => {
				if (res && res.status && res.data) {
					setData(res.data);
				} else {
					setError('加载失败，请重试');
				}
			})
			.catch(() => {
				setError('加载失败，请重试');
			})
			.finally(() => setLoading(false));
	}, []);

	useLoad(() => {
		loadData(date, 1);
	});

	usePullDownRefresh(() => {
		loadData(date, 1);
		Taro.stopPullDownRefresh();
	});

	// 前后一天切换
	const changeDay = (offset) => {
		const [m, d] = date.split('-').map(Number);
		const dt = new Date(now.getFullYear(), m - 1, d + offset);
		const nd = `${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
		setDate(nd);
		loadData(nd, 1);
	};

	// 月/日联动选择（下拉滚动弹窗）
	const [selMonth, selDay] = date.split('-').map(Number);
	const monthOptions = [...Array(12)].map((_, i) => `${i + 1}月`);
	const dayOptions = [...Array(new Date(now.getFullYear(), selMonth, 0).getDate())].map(
		(_, i) => `${i + 1}日`
	);
	const multiRange = [monthOptions, dayOptions];
	// 默认选中当前选择的月日（index 从 0 开始）
	const multiValue = [selMonth - 1, selDay - 1];

	const handleMultiChange = (e) => {
		const [mi, di] = e.detail.value;
		changeTo(mi + 1, di + 1);
	};
	const changeTo = (m, d) => {
		const maxDay = new Date(now.getFullYear(), m, 0).getDate();
		const dd = Math.min(d, maxDay);
		const nd = `${pad(m)}-${pad(dd)}`;
		setDate(nd);
		loadData(nd, 1);
	};

	// 翻页
	const pagination = data?.pagination;
	const changePage = (p) => {
		if (!pagination || p < 1 || p > pagination.totalPages) return;
		loadData(date, p);
		Taro.pageScrollTo({ scrollTop: 0, duration: 300 });
	};

	// 查看诗词详情
	const openDetail = (item) => {
		if (!item.title) return; // 无详情数据的降级项
		setPoemDetail({ loading: true });
		fetchHistoryPoemDetail(item.id)
			.then((res) => {
				if (res && res.status && res.data) {
					setPoemDetail(res.data);
				} else {
					setPoemDetail({ error: '未找到该作品' });
				}
			})
			.catch(() => setPoemDetail({ error: '加载失败' }));
	};
	const closeDetail = () => setPoemDetail(null);


	return (
		<View className='page todayPage'>
			<PageHeader showSearch={false} showBack>
				<View className='todayHeader'>
					<Text className='title'>历史上的今天</Text>
					<Text className='sub'>{monthDay}</Text>
				</View>
			</PageHeader>

			<View className='todayContainer'>
				{/* 日期导航 */}
				<View className='dateNav'>
					<View className='navArrow' onClick={() => changeDay(-1)}>
						‹
					</View>
					<Picker
						mode='multiSelector'
						range={multiRange}
						value={multiValue}
						onChange={handleMultiChange}
					>
						<View className='picker'>
							{selMonth}月{selDay}日
							<Text className='pickerArrow'>▾</Text>
						</View>
					</Picker>
					<View className='navBtn todayBtn' onClick={() => { const nd = `${pad(now.getMonth() + 1)}-${pad(now.getDate())}`; setDate(nd); loadData(nd, 1); }}>
						今天
					</View>
					<View className='navArrow' onClick={() => changeDay(1)}>
						›
					</View>
				</View>

				{loading && !data ? (
					<View className='loadingBlock'>
						<Text className='text'>加载中...</Text>
					</View>
				) : error ? (
					<View className='loadingBlock'>
						<Text className='text'>{error}</Text>
					</View>
				) : data ? (
					<>
						{/* 农历卡片 */}
						<View className='lunarCard'>
							<View className='lunarTop'>
								<Text className='lunarBig'>
									{lunarText || `${lunarNum(data.lunarDate?.month || 1)}月${lunarDayText(data.lunarDate?.day || 1)}`}
								</Text>
								{data.festivals?.length > 0 ? (
									<Text className='festivalBadge'>{data.festivals[0]}</Text>
								) : null}
							</View>
							<View className='ganzhiRow'>
								{data.lunarDate?.ganzhiYear ? <Text>{data.lunarDate.ganzhiYear}年</Text> : null}
								{data.lunarDate?.shengxiao ? <Text>{data.lunarDate.shengxiao}年</Text> : null}
								{data.lunarDate?.ganzhiMonth ? <Text>{data.lunarDate.ganzhiMonth}月</Text> : null}
								{data.lunarDate?.ganzhiDay ? <Text>{data.lunarDate.ganzhiDay}日</Text> : null}
							</View>
							<Text className='solarLine'>
								公历 {monthDay} · {now.getFullYear()}年
							</Text>
						</View>

						{/* 内容 Tabs：文学作品里的这一天 / 历史上的今天 */}
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
							<View className='sectionTitle'>
								<Text className='title'>文学作品里的这一天</Text>
								<Text className='subtitle'>
									古人笔下的{lunarText || monthDay}
								</Text>
							</View>
							{(data.poems || []).length > 0 ? (
								data.poems.map((p, idx) => (
									<View key={`${p.id}_${idx}`} className='poemCard' onClick={() => openDetail(p)}>
										<View className='poemCardTop'>
											<Text className='poemCardTitle'>
												{p.title || `作品 #${p.id}`}
											</Text>
											{p.year ? <Text className='yearBadge'>{p.year}年</Text> : null}
										</View>
										<View className='poemCardMeta'>
											<Text>
												{p.author ? `${p.author} · ${p.dynasty || ''}` : '作者不详'}
											</Text>
											{p.type ? <Text className='typeBadge'>{p.type}</Text> : null}
										</View>
									</View>
								))
							) : (
								<View className='emptyTip'>
									<Text>暂无相关作品</Text>
								</View>
							)}
							{/* 分页 */}
							{pagination && pagination.totalPages > 1 ? (
								<View className='pagination'>
									<View
										className={`pageBtn ${pagination.page <= 1 ? 'disabled' : ''}`}
										onClick={() => changePage(pagination.page - 1)}
									>
										上一页
									</View>
									<Text className='pageInfo'>
										{pagination.page} / {pagination.totalPages}
									</Text>
									<View
										className={`pageBtn ${pagination.page >= pagination.totalPages ? 'disabled' : ''}`}
										onClick={() => changePage(pagination.page + 1)}
									>
										下一页
									</View>
								</View>
							) : null}
						</View>
						) : null}

						{activeTab === 'events' ? (
						<View className='section'>
							<View className='sectionTitle'>
								<Text className='title'>历史上的今天</Text>
								<Text className='subtitle'>{monthDay}</Text>
							</View>
							{(data.events || []).length > 0 ? (
								data.events.map((ev, i) => (
									<View key={i} className='eventItem'>
										<Text className='eventYear'>[{ev.year}年{monthDay}]</Text>
										<Text className='eventTitle'>{ev.title}</Text>
									</View>
								))
							) : (
								<View className='emptyTip'>
									<Text>暂无历史事件</Text>
								</View>
							)}
						</View>
						) : null}
					</>
				) : null}
			</View>

			{/* 诗词详情弹层 */}
			{poemDetail ? (
				<View className='detailMask' onClick={closeDetail}>
					<View className='detailContent' onClick={(e) => e.stopPropagation()}>
						{poemDetail.loading ? (
							<Text className='detailLoading'>加载中...</Text>
						) : poemDetail.error ? (
							<Text className='detailLoading'>{poemDetail.error}</Text>
						) : (
							<>
								<View className='detailHeader'>
									<Text className='detailTitle'>{poemDetail.title}</Text>
									<Text className='detailClose' onClick={closeDetail}>×</Text>
								</View>
								<Text className='detailMeta'>
									{poemDetail.author} · {poemDetail.dynasty}
									{poemDetail.year ? ` · 公元${poemDetail.year}年` : ''}
									{poemDetail.type ? ` · ${poemDetail.type}` : ''}
								</Text>
								<View className='detailDivider' />
								<ScrollView scrollY className='detailBody'>
									<Text className='detailClauses'>
										{(poemDetail.clauses || []).join('')}
									</Text>
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