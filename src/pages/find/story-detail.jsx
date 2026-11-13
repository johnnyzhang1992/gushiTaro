import { View, Text, ScrollView } from '@tarojs/components';
import Taro, {
	useRouter,
	useLoad,
	usePullDownRefresh,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';
import { useMemo, useRef, useState } from 'react';

import CdnImage from '../../components/CdnImage';
import { fetchPoetStory } from '../../services/storyMap';

import './story-detail.scss';

const LOCATION_TYPES = {
	birthplace: { label: '出生', color: '#f43f5e' },
	residence: { label: '定居', color: '#3b82f6' },
	capital: { label: '都城', color: '#f59e0b' },
	travel: { label: '游历', color: '#10b981' },
	exile: { label: '贬谪', color: '#ef4444' },
	meeting: { label: '会面', color: '#8b5cf6' },
	death: { label: '卒于', color: '#6b7280' },
};

const typeMeta = (type) => LOCATION_TYPES[type] || { label: '足迹', color: '#6b7280' };

const ROUTE_COLS = 4;

// Taro 3.6.25 移除仅含 class 的 text/image 节点事件时会读不存在的 pure-* 别名而崩溃，可点节点一律用 View
const StoryDetailPage = () => {
	const router = useRouter();
	const poetName = decodeURIComponent(router.params?.name || '');
	const [story, setStory] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [typeFilter, setTypeFilter] = useState('all');
	const [expandedKey, setExpandedKey] = useState(null);
	const [openPoemKey, setOpenPoemKey] = useState(null);
	const seq = useRef(0);

	const load = (name) => {
		const id = ++seq.current;
		setLoading(true);
		setError('');
		return fetchPoetStory('GET', { name })
			.then((res) => {
				if (id !== seq.current) return;
				if (res && res.status && res.data) setStory(res.data);
				else {
					setStory(null);
					setError('该诗人的足迹数据暂缺');
				}
			})
			.catch(() => {
				if (id !== seq.current) return;
				setStory(null);
				setError('足迹加载失败，点击重试');
			})
			.finally(() => {
				if (id === seq.current) setLoading(false);
			});
	};

	useLoad(() => {
		if (!poetName) {
			setLoading(false);
			setError('缺少诗人参数');
			return;
		}
		Taro.setNavigationBarTitle({ title: `${poetName}的足迹` });
		load(poetName);
	});

	usePullDownRefresh(() => {
		if (!poetName) {
			Taro.stopPullDownRefresh();
			return;
		}
		load(poetName).finally(() => Taro.stopPullDownRefresh());
	});

	useShareAppMessage(() => ({
		title: `${poetName || '诗人'}的足迹 · 读万卷书行万里路`,
		path: `/pages/find/story-detail?name=${encodeURIComponent(poetName)}`,
	}));

	useShareTimeline(() => ({
		title: `${poetName || '诗人'}的足迹 · 读万卷书行万里路`,
		query: `name=${encodeURIComponent(poetName)}`,
	}));

	const phases = story?.phases || [];
	const stats = story?.stats;

	const typeCounts = useMemo(() => {
		const counts = {};
		phases.forEach((p) =>
			(p.entries || []).forEach((e) => {
				const t = e.location?.type || 'travel';
				counts[t] = (counts[t] || 0) + 1;
			})
		);
		return counts;
	}, [phases]);

	const totalEntries = useMemo(
		() => Object.values(typeCounts).reduce((s, n) => s + n, 0),
		[typeCounts]
	);

	const visiblePhases = useMemo(
		() =>
			phases
				.map((p) => ({
					...p,
					entries: (p.entries || []).filter(
						(e) => typeFilter === 'all' || (e.location?.type || 'travel') === typeFilter
					),
				}))
				.filter((p) => p.entries.length > 0),
		[phases, typeFilter]
	);

	const routePlaces = useMemo(
		() =>
			(stats?.travelRoute || '')
				.split('→')
				.map((s) => s.replace(/（[^）]*）/g, '').trim())
				.filter(Boolean),
		[stats]
	);

	const routeRows = useMemo(() => {
		const rows = [];
		for (let i = 0; i < routePlaces.length; i += ROUTE_COLS) {
			rows.push(routePlaces.slice(i, i + ROUTE_COLS));
		}
		return rows;
	}, [routePlaces]);

	const statCells = [
		{ label: '足迹省份', value: stats?.totalProvinces },
		{ label: '到过州县', value: stats?.totalCounties },
		{ label: '足迹站点', value: totalEntries || null },
		{ label: '跨越年数', value: stats?.totalYears },
	].filter((c) => c.value != null);

	const years = story?.birthYear
		? `${story.birthYear}${story.deathYear ? ` – ${story.deathYear}` : ' 之后'}`
		: '';

	const goAuthor = () => {
		if (story?.authorId) Taro.navigateTo({ url: `/pages/poet/detail?id=${story.authorId}` });
	};

	const renderEntry = (phase, entry, i) => {
		const key = `${phase.name}_${i}`;
		const meta = typeMeta(entry.location?.type);
		const detail = entry.detail || '';
		const canExpand = detail.length > 100;
		const expanded = expandedKey === key;
		const poems = entry.poems || [];
		return (
			<View key={key} className='entryRow'>
				<View className='entryAxis'>
					<View className='entryDot' style={{ background: meta.color }} />
					{i < phase.entries.length - 1 ? <View className='entryLine' /> : null}
				</View>
				<View className='entryBody'>
					<View className='entryMetaRow'>
						<Text className='entryYear' style={{ color: phase.color }}>
							{entry.yearDisplay || `${entry.year}年`}
						</Text>
						{entry.age != null ? <Text className='entryAge'>{entry.age}岁</Text> : null}
						<Text className='entryType' style={{ color: meta.color }}>
							{meta.label}
						</Text>
					</View>
					{entry.location?.historicalName ? (
						<Text className='entryPlace'>
							{entry.location.historicalName}
							{entry.location.modernName ? ` · ${entry.location.modernName}` : ''}
						</Text>
					) : null}
					<Text className='entryEvent'>{entry.event}</Text>
					{detail ? (
						<Text className={`entryDetail ${canExpand && !expanded ? 'clamped' : ''}`}>
							{detail}
						</Text>
					) : null}
					{canExpand ? (
						<View
							className='entryToggle'
							onClick={() => setExpandedKey(expanded ? null : key)}
						>
							<Text className='entryToggleText'>{expanded ? '收起' : '展开详情'}</Text>
							<View className={`caret ${expanded ? 'up' : ''}`} />
						</View>
					) : null}
					{poems.length > 0 ? (
						<View className='entryPoems'>
							{poems.map((pm, j) => {
								const poemKey = `${key}_${j}`;
								const lines = pm.lines || [];
								const open = openPoemKey === poemKey && lines.length > 0;
								return (
									<View
										key={poemKey}
										className={`poemRef ${open ? 'open' : ''}`}
										onClick={
											lines.length
												? () => setOpenPoemKey(open ? null : poemKey)
												: undefined
										}
									>
										<View className='poemRefHead'>
											<Text className='poemRefTitle'>《{pm.title}》</Text>
											{lines.length ? <View className={`caret ${open ? 'up' : ''}`} /> : null}
										</View>
										{open
											? lines.map((line, k) => (
													<Text key={k} className='poemLine'>
														{line}
													</Text>
											  ))
											: null}
									</View>
								);
							})}
						</View>
					) : null}
				</View>
			</View>
		);
	};

	return (
		<View className='page storyDetailPage'>
			{loading ? (
				<View className='blockTip'>加载中...</View>
			) : error ? (
				<View className='blockTip'>
					<Text className='blockTipText'>{error}</Text>
					{poetName && error !== '该诗人的足迹数据暂缺' ? (
						<View className='retryBtn' onClick={() => load(poetName)}>
							<Text className='retryBtnText'>重新加载</Text>
						</View>
					) : null}
				</View>
			) : (
				<View className='detailBody'>
					<View className='heroCard'>
						<View className='heroTop'>
							{story.avatar ? (
								<CdnImage src={story.avatar} className='heroAvatar' mode='aspectFill' />
							) : (
								<View className='heroAvatar placeholder'>
									<Text className='heroInitial'>{(story.poetName || '').slice(0, 1)}</Text>
								</View>
							)}
							<View className='heroInfo'>
								<View className='heroNameRow'>
									<Text className='heroName'>{story.poetName}</Text>
									{story.dynasty ? <Text className='heroDynasty'>{story.dynasty}</Text> : null}
								</View>
								{years ? <Text className='heroYears'>{years}</Text> : null}
								<Text className='heroSub'>
									一生 {totalEntries} 站足迹 · {phases.length} 个阶段
								</Text>
							</View>
						</View>
						{story.authorId ? (
							<View className='heroLink' onClick={goAuthor}>
								<Text className='heroLinkText'>诗人主页</Text>
								<Text className='heroLinkArrow'>›</Text>
							</View>
						) : null}
					</View>

					{routePlaces.length > 1 ? (
						<View className='card routeCard'>
							<View className='cardHead'>
								<Text className='cardTitle'>行迹路线</Text>
								<Text className='cardHint'>共 {routePlaces.length} 站</Text>
							</View>
							<View className='routeSnake'>
								{routeRows.map((row, r) => {
									const rtl = r % 2 === 1;
									return (
										<View key={`row_${r}`} className='routeRowGroup'>
											<View
												className='routeRow'
												style={{ flexDirection: rtl ? 'row-reverse' : 'row' }}
											>
												{row.map((place, i) => (
													<View key={`${place}_${i}`} className='routeCell'>
														<Text className='routeName'>{place}</Text>
														{i < row.length - 1 ? (
															<Text className={`routeArrow ${rtl ? 'left' : 'right'}`}>
																{rtl ? '←' : '→'}
															</Text>
														) : null}
													</View>
												))}
											</View>
											{r < routeRows.length - 1 ? (
												<View className='routeTurn'>
													{Array.from({ length: ROUTE_COLS }).map((_, c) => (
														<View key={`turn_${c}`} className='routeCell'>
															{c === (rtl ? 0 : ROUTE_COLS - 1) ? (
																<View className='routeDown'>
																	<View className='routeDownLine' />
																	<View className='routeDownCaret' />
																</View>
															) : null}
														</View>
													))}
												</View>
											) : null}
										</View>
									);
								})}
							</View>
						</View>
					) : null}

					{statCells.length > 0 || (stats?.settlements || []).length > 0 ? (
						<View className='card statsCard'>
							{statCells.length > 0 ? (
								<View className='statsGrid'>
									{statCells.map((c) => (
										<View key={c.label} className='statCell'>
											<Text className='statNum'>{c.value}</Text>
											<Text className='statLabel'>{c.label}</Text>
										</View>
									))}
								</View>
							) : null}
							{(stats?.settlements || []).length > 0 ? (
								<View className='settleBlock'>
									<Text className='settleLabel'>定居之地</Text>
									<View className='settleRow'>
										{stats.settlements.map((s) => (
											<View key={s} className='settleChip'>
												<Text className='settleChipText'>{s}</Text>
											</View>
										))}
									</View>
								</View>
							) : null}
							<Text className='statsNote'>根据互联网信息整理，仅供参考</Text>
						</View>
					) : null}

					<ScrollView className='filterScroll' scrollX showScrollbar={false}>
						<View
							className={`filterChip ${typeFilter === 'all' ? 'active' : ''}`}
							onClick={() => setTypeFilter('all')}
						>
							<Text className='filterText'>全部 {totalEntries}</Text>
						</View>
						{Object.keys(LOCATION_TYPES)
							.filter((t) => typeCounts[t])
							.map((t) => (
								<View
									key={t}
									className={`filterChip ${typeFilter === t ? 'active' : ''}`}
									onClick={() => setTypeFilter(typeFilter === t ? 'all' : t)}
								>
									<View className='filterDot' style={{ background: LOCATION_TYPES[t].color }} />
									<Text className='filterText'>
										{LOCATION_TYPES[t].label} {typeCounts[t]}
									</Text>
								</View>
							))}
					</ScrollView>

					{visiblePhases.length === 0 ? (
						<View className='blockTip'>该类型下暂无足迹</View>
					) : (
						visiblePhases.map((phase) => (
							<View key={phase.name} className='card phaseBlock'>
								<View className='phaseHead'>
									<View className='phaseBar' style={{ background: phase.color }} />
									<View className='phaseHeadText'>
										<View className='phaseNameRow'>
											<Text className='phaseName'>{phase.name}</Text>
											{phase.period ? <Text className='phasePeriod'>{phase.period}</Text> : null}
											<Text className='phaseCount'>{phase.entries.length} 站</Text>
										</View>
										{phase.description && phase.description !== `${story.poetName}的生平` ? (
											<Text className='phaseDesc'>{phase.description}</Text>
										) : null}
									</View>
								</View>
								{phase.entries.map((entry, i) => renderEntry(phase, entry, i))}
							</View>
						))
					)}

					<Text className='pageFoot'>足迹数据持续整理中</Text>
				</View>
			)}
		</View>
	);
};

export default StoryDetailPage;