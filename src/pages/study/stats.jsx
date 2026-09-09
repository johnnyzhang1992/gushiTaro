import { View, Text } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import { useRef, useState } from 'react';

import {
	fetchStudyStats,
	fetchStudyCalendar,
	fetchRecentStudyLogs,
} from '../../services/study';

import './stats.scss';

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

// 阶段 0~6 展示定义（颜色与学习详情页语义一致：0 未学习 / 1-5 学习中 / 6 已掌握）
const STAGE_DEFS = [
	{ stage: 0, name: '未背诵', color: '#c3cad4' },
	{ stage: 1, name: '阶段 1', color: '#a9d3f5' },
	{ stage: 2, name: '阶段 2', color: '#7fb9ea' },
	{ stage: 3, name: '阶段 3', color: '#549fdf' },
	{ stage: 4, name: '阶段 4', color: '#3c86c9' },
	{ stage: 5, name: '阶段 5', color: '#2f6fa8' },
	{ stage: 6, name: '已掌握', color: '#52b788' },
];

const RESULT_MAP = { remembered: '记得', unsure: '模糊', forgotten: '忘记' };

const pad2 = (n) => String(n).padStart(2, '0');

const localOffset = () => -new Date().getTimezoneOffset();

const localDateStr = (d) =>
	`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

// 相对时间（最近记录用）
const timeAgo = (iso) => {
	if (!iso) return '';
	const diff = Date.now() - new Date(iso).getTime();
	if (diff < 60 * 1000) return '刚刚';
	if (diff < 3600 * 1000) return `${Math.floor(diff / 60000)} 分钟前`;
	if (diff < 86400 * 1000) return `${Math.floor(diff / 3600000)} 小时前`;
	if (diff < 7 * 86400 * 1000) return `${Math.floor(diff / 86400000)} 天前`;
	const d = new Date(iso);
	return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const fmtDateTime = (iso) => {
	if (!iso) return '';
	const d = new Date(iso);
	return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

// 学习动作文本：初次学习 / 复习结果 + 阶段变化
const actionText = (log) => {
	const base = log.action === 'learn' ? '初次背诵' : RESULT_MAP[log.result] || '复习';
	if (log.to_stage >= 6) return `${base} · 已掌握`;
	if (log.action === 'learn') return `${base} · 进入阶段 ${log.to_stage}`;
	if (log.from_stage === log.to_stage) return `${base} · 保持阶段 ${log.to_stage}`;
	return `${base} · 阶段 ${log.from_stage} → ${log.to_stage}`;
};

// 日志单行（日历弹层与最近记录共用）
const LogRow = ({ log, onTap }) => (
	<View className='log-row' onClick={onTap}>
		<View className='log-main'>
			<Text className='log-title' numberOfLines={1}>{log.poem_title || '未知作品'}</Text>
			<Text className='log-meta' numberOfLines={1}>
				{log.poem_author ? `${log.poem_author}·${log.poem_dynasty || ''}` : ''}
				{log.planName ? ` ｜ ${log.planName}` : ''}
			</Text>
			<Text className='log-action'>{actionText(log)}</Text>
		</View>
		<View className='log-time'>
			<Text className='log-time-main'>{timeAgo(log.createdAt)}</Text>
			<Text className='log-time-sub'>{fmtDateTime(log.createdAt)}</Text>
		</View>
	</View>
);

const StatsPage = () => {
	const now = new Date();
	const [stats, setStats] = useState(null); // /stats data
	const [recent, setRecent] = useState(null); // /recent array
	const [loadError, setLoadError] = useState('');
	const [loading, setLoading] = useState(true);

	// 日历状态
	const [viewY, setViewY] = useState(now.getFullYear());
	const [viewM, setViewM] = useState(now.getMonth() + 1);
	const [daysMap, setDaysMap] = useState({}); // dateStr -> { studied, due }
	const [calLoading, setCalLoading] = useState(false);
	const loadedRef = useRef(new Set());
	const [todayStr] = useState(() => localDateStr(new Date()));

	// 当天明细弹层
	const [dayPop, setDayPop] = useState(null); // { date, loading, list }

	const loadOverview = async () => {
		setLoading(true);
		setLoadError('');
		try {
			const [sRes, rRes] = await Promise.all([
				fetchStudyStats('GET'),
				fetchRecentStudyLogs('GET', { limit: 30, offset: localOffset() }),
			]);
			if (sRes && sRes.status) setStats(sRes.data);
			if (rRes && rRes.status) setRecent(rRes.data || []);
		} catch (err) {
			console.error('学习统计加载失败:', err);
			setLoadError('加载失败，下拉重试');
		} finally {
			setLoading(false);
		}
	};

	const loadCal = async (y, m, force) => {
		const key = `${y}-${m}`;
		if (!force && loadedRef.current.has(key)) return;
		setCalLoading(true);
		try {
			const res = await fetchStudyCalendar('GET', {
				month: `${y}-${pad2(m)}`,
				offset: localOffset(),
			});
			if (res && res.status && res.data) {
				const map = {};
				(res.data.days || []).forEach((d) => {
					map[d.date] = { studied: d.studied || 0, due: d.due || 0 };
				});
				setDaysMap((prev) => ({ ...prev, ...map }));
				loadedRef.current.add(key);
			}
		} catch (err) {
			console.error('学习日历加载失败:', err);
		} finally {
			setCalLoading(false);
		}
	};

	useDidShow(() => {
		loadOverview();
		loadCal(viewY, viewM);
	});

	usePullDownRefresh(() => {
		loadOverview().then(() => {
			loadedRef.current.delete(`${viewY}-${viewM}`);
			loadCal(viewY, viewM, true).then(() => Taro.stopPullDownRefresh());
		});
	});

	const changeMonth = (delta) => {
		let y = viewY;
		let m = viewM + delta;
		if (m < 1) { m = 12; y -= 1; }
		if (m > 12) { m = 1; y += 1; }
		setViewY(y);
		setViewM(m);
		loadCal(y, m);
	};

	const goToday = () => {
		const d = new Date();
		setViewY(d.getFullYear());
		setViewM(d.getMonth() + 1);
		loadCal(d.getFullYear(), d.getMonth() + 1);
	};

	const openDay = (dateStr) => {
		setDayPop({ date: dateStr, loading: true, list: [] });
		fetchRecentStudyLogs('GET', { date: dateStr, limit: 100, offset: localOffset() })
			.then((res) => {
				setDayPop({
					date: dateStr,
					loading: false,
					list: res && res.status ? res.data || [] : [],
				});
			})
			.catch(() => setDayPop({ date: dateStr, loading: false, list: [] }));
	};
	const closeDay = () => setDayPop(null);

	// 打开诗词详情
	const goPoem = (log) => {
		if (!log || !log.poem_id) return;
		Taro.navigateTo({ url: `/pages/poem/detail?id=${log.poem_id}` });
	};

	// 阶段分布派生
	const dist = stats?.stage_distribution || {};
	const totalItems = STAGE_DEFS.reduce((sum, s) => sum + (dist[String(s.stage)] || 0), 0);
	const maxStage = Math.max(1, ...STAGE_DEFS.map((s) => dist[String(s.stage)] || 0));

	// 日历网格
	const daysInMonth = new Date(viewY, viewM, 0).getDate();
	const firstDay = new Date(viewY, viewM - 1, 1).getDay();
	const cells = [];
	for (let i = 0; i < firstDay; i++) cells.push(null);
	for (let d = 1; d <= daysInMonth; d++) {
		const dateStr = `${viewY}-${pad2(viewM)}-${pad2(d)}`;
		cells.push({
			day: d,
			dateStr,
			info: daysMap[dateStr],
			isToday: dateStr === todayStr,
		});
	}

	const rate = stats?.completion_rate || 0;

	return (
		<View className='stats-page'>
			{/* ===== 概况卡 ===== */}
			<View className='card overview-card'>
				{loading && !stats ? (
					<View className='block-loading'>加载中...</View>
				) : loadError && !stats ? (
					<View className='block-loading'>{loadError}</View>
				) : (
					<>
						<View className='ov-grid'>
							<View className='ov-item'>
								<Text className='ov-num'>{stats?.total_plans || 0}</Text>
								<Text className='ov-label'>背诵计划</Text>
							</View>
							<View className='ov-item'>
								<Text className='ov-num'>{stats?.total_poem || 0}</Text>
								<Text className='ov-label'>诗词总数</Text>
							</View>
							<View className='ov-item'>
								<Text className='ov-num'>{stats?.mastered_poem || 0}</Text>
								<Text className='ov-label'>已掌握</Text>
							</View>
							<View className='ov-item'>
								<Text className='ov-num due-num'>{(stats?.due_today || 0) > 0 ? stats.due_today : 0}</Text>
								<Text className='ov-label'>今日待复习</Text>
							</View>
						</View>

						<View className='completion'>
							<View className='completion-head'>
								<Text className='completion-title'>完成率</Text>
								<Text className='completion-rate'>{rate}%</Text>
							</View>
							<View className='progress-track'>
								<View className='progress-fill' style={{ width: `${Math.min(rate, 100)}%` }} />
							</View>
							<Text className='completion-sub'>
								已掌握 {stats?.mastered_poem || 0} / {stats?.total_poem || 0} 首
							</Text>
						</View>

						{stats?.total_plans === 0 ? (
							<View className='empty-tip'>还没有背诵计划，去「背诵」页创建一个吧</View>
						) : (
							<View className='stage-block'>
								{STAGE_DEFS.map((s) => {
									const count = dist[String(s.stage)] || 0;
									const pct = totalItems ? Math.round((count / totalItems) * 1000) / 10 : 0;
									return (
										<View className='stage-row' key={s.stage}>
											<View className='stage-dot' style={{ background: s.color }} />
											<Text className='stage-name'>{s.name}</Text>
											<View className='stage-bar'>
												<View
													className='stage-fill'
													style={{ width: `${maxStage ? (count / maxStage) * 100 : 0}%`, background: s.color }}
												/>
											</View>
											<Text className='stage-meta'>
												{count} · {pct}%
											</Text>
										</View>
									);
								})}
							</View>
						)}
					</>
				)}
			</View>

			{/* ===== 学习日历 ===== */}
			<View className='card cal-card'>
				<View className='cal-nav'>
					<Text className='cal-arrow' onClick={() => changeMonth(-1)}>‹</Text>
					<Text className='cal-title'>{viewY}年{viewM}月</Text>
					<Text className='cal-arrow' onClick={() => changeMonth(1)}>›</Text>
					<Text className='cal-today-btn' onClick={goToday}>今</Text>
				</View>

				<View className='cal-weekdays'>
					{WEEK_DAYS.map((w) => (
						<Text key={w} className='cal-wd'>{w}</Text>
					))}
				</View>

				{calLoading && Object.keys(daysMap).length === 0 ? (
					<View className='block-loading'>日历加载中...</View>
				) : (
					<View className='cal-grid'>
						{cells.map((cell, i) =>
							cell ? (
								<View
									key={i}
									className={`cal-day ${cell.isToday ? 'today' : ''} ${
										cell.info && (cell.info.studied > 0 || cell.info.due > 0) ? 'has-data' : ''
									}`}
									onClick={() => openDay(cell.dateStr)}
								>
									<Text className='cal-day-num'>{cell.day}</Text>
									{cell.info && cell.info.due > 0 ? (
										<View className='due-badge'>{cell.info.due > 99 ? '99+' : cell.info.due}</View>
									) : null}
									{cell.info && cell.info.studied > 0 ? (
										<View className='study-mark'>
											<View className='study-dot' />
											{cell.info.studied > 1 ? <Text className='study-count'>{cell.info.studied}</Text> : null}
										</View>
									) : null}
								</View>
							) : (
								<View key={i} className='cal-day empty' />
							)
						)}
					</View>
				)}

				<View className='cal-legend'>
					<View className='legend-item'>
						<View className='legend-swatch blue' />
						<Text className='legend-text'>有背诵记录（点日期看当天明细）</Text>
					</View>
					<View className='legend-item'>
						<View className='legend-swatch red' />
						<Text className='legend-text'>当日待复习数量</Text>
					</View>
					<View className='legend-item'>
						<View className='legend-swatch ring' />
						<Text className='legend-text'>今天</Text>
					</View>
				</View>
				<Text className='cal-note'>
					背诵日志上线前的日期按「加入计划 / 最近复习」回填，背诵天数可能少于实际；之后的记录完整准确。
				</Text>
			</View>

			{/* ===== 最近学习记录 ===== */}
			<View className='card recent-card'>
				<View className='recent-head'>
					<Text className='recent-title'>最近背诵记录</Text>
					{recent && recent.length > 0 ? (
						<Text className='recent-count'>最近 {recent.length} 条</Text>
					) : null}
				</View>
				{!recent ? (
					<View className='block-loading'>{loadError || '加载中...'}</View>
				) : recent.length === 0 ? (
					<View className='empty-tip'>还没有背诵记录，去背一首诗词吧 📖</View>
				) : (
					recent.map((log, i) => (
						<LogRow key={log._id || i} log={log} onTap={() => goPoem(log)} />
					))
				)}
			</View>

			{/* ===== 当天明细弹层 ===== */}
			{dayPop ? (
				<View className='pop-mask' onClick={closeDay}>
					<View className='pop-content' onClick={(e) => e.stopPropagation()}>
						<View className='pop-head'>
							<Text className='pop-title'>{dayPop.date} 背诵明细</Text>
							<Text className='pop-close' onClick={closeDay}>×</Text>
						</View>
						{dayPop.loading ? (
							<View className='block-loading'>加载中...</View>
						) : dayPop.list.length === 0 ? (
							<View className='empty-tip'>这一天没有背诵记录</View>
						) : (
							<View className='pop-list'>
								{dayPop.list.map((log, i) => (
									<LogRow key={log._id || i} log={log} onTap={() => goPoem(log)} />
								))}
							</View>
						)}
					</View>
				</View>
			) : null}
		</View>
	);
};

export default StatsPage;
