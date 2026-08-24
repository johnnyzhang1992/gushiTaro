import { View, Text, Navigator } from '@tarojs/components';
import Taro, {
	useLoad,
	useDidShow,
	usePullDownRefresh,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';
import { useState, useEffect } from 'react';

import {
	fetchCalendarToday,
	fetchDailyPoem,
	fetchPointsStats,
	doCheckin,
} from '../services/global';
import { fetchStudyPlans } from '../services/study';

import PoetCard from '../components/PoetCard';
import PoemSmallCard from '../components/PoemSmallCard';
import SentenceCard from '../components/SentenceCard';
import PageHeader from '../components/PageHeader';

// 随机推荐（诗人/诗词/摘录混合）
const fetchRandomRecommend = () => {
	return Taro.request({
		url: `https://api.xuegushi.com/miniapp/api/search/random`,
		method: 'GET',
	}).then((res) => {
		if (res.data && res.data.status) return res.data.data;
		return null;
	});
};

import './index.scss';

const initCalendar = {
	lunarDate: { yearChinese: '', monthChinese: '', dayChinese: '' },
	festivals: [],
	weekday: '一',
};

const HomePage = () => {
	const [calendar, setCalendar] = useState(initCalendar);
	const [clock, setClock] = useState(new Date());
	const [dailyPoem, setDailyPoem] = useState(null);
	const [checkinStats, setCheckinStats] = useState(null);
	const [plans, setPlans] = useState([]);
	const [isLogin, setIsLogin] = useState(false);
	const [recommend, setRecommend] = useState({ poems: [], poets: [], sentences: [] });
	const [recommendList, setRecommendList] = useState([]);

	// 实时时钟（公历）
	useEffect(() => {
		const timer = setInterval(() => setClock(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	// 拉取农历
	const loadCalendar = () => {
		return fetchCalendarToday('GET', {})
			.then((res) => {
				if (res && res.status && res.data) setCalendar(res.data);
			})
			.catch(() => {});
	};

	// 拉取每日诗词
	const loadDailyPoem = () => {
		return fetchDailyPoem('GET', {})
			.then((res) => {
				if (res && res.status && res.data) setDailyPoem(res.data);
			})
			.catch(() => {});
	};

	// 拉取签到统计（需登录）
	const loadCheckin = () => {
		const user = Taro.getStorageSync('user') || {};
		if (!user.token) {
			setIsLogin(false);
			setCheckinStats(null);
			return Promise.resolve();
		}
		setIsLogin(true);
		return fetchPointsStats('GET', {})
			.then((res) => {
				if (res && res.status && res.data) setCheckinStats(res.data);
			})
			.catch(() => {});
	};

	// 拉取随机推荐（诗人/诗词/摘录混合），获取时打散一次
	const loadRecommend = () => {
		return fetchRandomRecommend()
			.then((data) => {
				if (!data) return;
				setRecommend(data);
				// 三种类型随机打散后合并，仅在此处打散一次，之后渲染不变
				const list = [
					...(data.poets || []).map((item) => ({ ...item, _type: 'poet' })),
					...(data.poems || []).map((item) => ({ ...item, _type: 'poem' })),
					...(data.sentences || []).map((item) => ({ ...item, _type: 'sentence' })),
				].sort(() => Math.random() - 0.5);
				setRecommendList(list);
			})
			.catch(() => {});
	};
	const loadPlans = () => {
		const user = Taro.getStorageSync('user') || {};
		if (!user.token) {
			setPlans([]);
			return Promise.resolve();
		}
		return fetchStudyPlans('GET', {})
			.then((res) => {
				if (res && res.status && res.data) setPlans(res.data || []);
			})
			.catch(() => {});
	};

	useLoad(() => {
		loadCalendar();
		loadDailyPoem();
		loadRecommend();
	});

	useDidShow(() => {
		loadCheckin();
		loadPlans();
	});

	// 下拉刷新：重新拉取所有数据
	usePullDownRefresh(() => {
		Promise.all([loadCalendar(), loadDailyPoem(), loadCheckin(), loadPlans(), loadRecommend()]).finally(
			() => {
				Taro.stopPullDownRefresh();
			}
		);
	});

	useShareAppMessage(() => {
		return {
			title: '古诗文小助手',
			path: '/pages/index',
		};
	});

	useShareTimeline(() => {
		return {
			title: '古诗文小助手',
			path: '/pages/index',
		};
	});

	// 签到动作
	const handleCheckin = () => {
		if (!isLogin) {
			Taro.switchTab({ url: '/pages/me/index' });
			return;
		}
		if (hasCheckedIn()) return;
		doCheckin('POST', {})
			.then((res) => {
				if (res && res.status) {
					Taro.showToast({ title: '签到成功', icon: 'success' });
					loadCheckin();
					loadPlans();
				}
			})
			.catch(() => {
				Taro.showToast({ title: '签到失败', icon: 'none' });
			});
	};

	// 今日是否已签到
	const hasCheckedIn = () => {
		if (!checkinStats) return false;
		const todayStr = Taro.getStorageSync('todayStr');
		const now = new Date();
		const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
		Taro.setStorageSync('todayStr', ts);
		return (checkinStats.monthlyCheckins || []).includes(ts);
	};

	// 学习计划统计
	const planStats = plans.reduce(
		(acc, p) => {
			acc.total += p.poem_count || 0;
			acc.mastered += p.mastered_count || 0;
			acc.due += p.due_count || 0;
			return acc;
		},
		{ total: 0, mastered: 0, due: 0 }
	);
	const completionRate =
		planStats.total > 0
			? Math.round((planStats.mastered / planStats.total) * 100)
			: 0;

	// 每日诗词内容
	const poemContent = dailyPoem?.content?.content || [];
	const poemPreview = Array.isArray(poemContent)
		? poemContent.slice(0, 2).join(' ')
		: dailyPoem?.text_content?.slice(0, 30) || '';

	const checkedIn = hasCheckedIn();


	return (
		<View className='page homePage'>
			{/* 自定义头部：左侧搜索入口 */}
			<PageHeader title='首页' />
			<View className='home-content'>
			{/* ===== 1. 农历卡片 ===== */}
			<View
				className='card calendarCard'
				onClick={() => Taro.navigateTo({ url: '/pages/find/today' })}
			>
				<View className='card-body'>
					<View className='lunar-left'>
						<Text className='lunar-tag'>
							农历 · {calendar.lunarDate.ganzhiYear}年
						</Text>
						<Text className='lunar-date'>
							{calendar.lunarDate.monthChinese}月
							{calendar.lunarDate.dayChinese}
						</Text>
						<Text className='lunar-sub'>
							{calendar.lunarDate.shengxiao}年 · 星期{calendar.weekday}
							{calendar.lunarDate.ganzhiMonth
								? ` · ${calendar.lunarDate.ganzhiMonth}月${calendar.lunarDate.ganzhiDay}日`
								: ''}
						</Text>
					</View>
					<View className='solar-right'>
						<Text className='solar-tag'>公历</Text>
						<Text className='solar-date'>
							{clock.getMonth() + 1}月{clock.getDate()}日
						</Text>
						<Text className='solar-clock'>
							{String(clock.getHours()).padStart(2, '0')}:
							{String(clock.getMinutes()).padStart(2, '0')}:
							{String(clock.getSeconds()).padStart(2, '0')}
						</Text>
					</View>
				</View>
				{(calendar.festivals?.length > 0 ||
					calendar.solarTerm?.previous ||
					calendar.timePeriod) && (
					<View className='card-footer'>
						{calendar.festivals && calendar.festivals.length > 0 ? (
							<Text className='meta-item festival'>
								{calendar.festivals[0]}
							</Text>
						) : null}
						{calendar.timePeriod ? (
							<Text className='meta-item'>
								{calendar.timePeriod.dizhi}时 · {calendar.timePeriod.shengxiao}
							</Text>
						) : null}
						{calendar.solarTerm?.previous || calendar.solarTerm?.next ? (
							<Text className='meta-item solar-term'>
								{[
									calendar.solarTerm.previous?.name,
									calendar.solarTerm.next?.name,
								]
									.filter(Boolean)
									.join(' → ')}
							</Text>
						) : null}
					</View>
				)}
			</View>

			{/* ===== 2. 每日诗词 ===== */}
			{dailyPoem ? (
				<Navigator
					className='card dailyPoemCard'
					url={`/pages/poem/detail?id=${dailyPoem.id || dailyPoem._id}`}
					hoverClass='none'
				>
					<View className='card-body poem-row'>
						<Text className='poem-quote'>❝</Text>
						<View className='poem-info'>
							<Text className='poem-title' numberOfLines={1}>
								{dailyPoem.title}
							</Text>
							<Text className='poem-preview' numberOfLines={1}>
								{poemPreview}
							</Text>
							<Text className='poem-author'>
								{dailyPoem.dynasty} · {dailyPoem.author}
							</Text>
						</View>
						<Text className='poem-arrow'>›</Text>
					</View>
				</Navigator>
			) : null}

			{/* ===== 3. 签到卡片 ===== */}
			<View className='card checkinCard'>
				<View className='checkin-body'>
					{/* 左侧：点击跳转签到详情页 */}
					<View
						className='checkin-info'
						onClick={() => Taro.navigateTo({ url: '/pages/me/checkin' })}
					>
						<Text className='checkin-title'>
							{checkedIn ? '今日已签到' : '每日签到'}
						</Text>
						<Text className='checkin-desc'>
							连续签到 {checkinStats?.checkinStreak || 0} 天
							{checkinStats?.totalPoints ? ` · 积分 ${checkinStats.totalPoints}` : ''}
						</Text>
					</View>
					{/* 右侧：直接签到 */}
					<View className={`checkin-btn ${checkedIn ? 'done' : ''}`} onClick={handleCheckin}>
						{checkedIn ? '✓ 已签到' : '去签到'}
					</View>
				</View>
			</View>

			{/* ===== 4. 学习计划进度 ===== */}
			<View className='card planCard'>
				<View className='plan-header'>
					<Text className='plan-title'>学习计划</Text>
					<Navigator className='plan-more' url='/pages/study/index' hoverClass='none'>
						<Text>
							{isLogin ? `${plans.length} 个计划` : '去查看'} ›
						</Text>
					</Navigator>
				</View>
				{isLogin && plans.length > 0 ? (
					<View className='plan-stats'>
						<View className='plan-stat'>
							<Text className='plan-num'>{planStats.total}</Text>
							<Text className='plan-label'>诗词数</Text>
						</View>
						<View className='plan-stat'>
							<Text className='plan-num mastered'>{planStats.mastered}</Text>
							<Text className='plan-label'>已掌握</Text>
						</View>
						<View className='plan-stat'>
							<Text className='plan-num due'>{planStats.due}</Text>
							<Text className='plan-label'>待复习</Text>
						</View>
						<View className='plan-stat'>
							<Text className='plan-num rate'>{completionRate}%</Text>
							<Text className='plan-label'>完成率</Text>
						</View>
					</View>
				) : (
					<View className='plan-empty'>
						<Text className='plan-empty-text'>
							{isLogin ? '还没有学习计划，去创建吧' : '登录后查看学习进度'}
						</Text>
					</View>
				)}
			</View>

			{/* ===== 5. 为你推荐 ===== */}
			{recommendList.length > 0 ? (
				<View className='card recommendCard'>
					<View className='recommend-header'>
						<Text className='recommend-title'>为你推荐</Text>
						<Text className='recommend-refresh' onClick={loadRecommend}>
							换一批
						</Text>
					</View>
					<View className='recommend-list'>
						{recommendList.map((item) => {
							if (item._type === 'poet') {
								return (
									<PoetCard
										key={item._id || item.id}
										{...item}
									/>
								);
							}
							if (item._type === 'poem') {
								return (
									<PoemSmallCard
										key={item._id || item.id}
										{...item}
										hideAudio
									/>
								);
							}
							return (
								<SentenceCard
									key={item._id || item.id}
									{...item}
								/>
							);
						})}
					</View>
				</View>
			) : null}
			</View>
		</View>
	);
};

export default HomePage;