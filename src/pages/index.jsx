import { View, Text } from '@tarojs/components';
import Taro, {
	useLoad,
	useDidShow,
	usePullDownRefresh,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';
import { useState, useRef } from 'react';

import {
	fetchHomeInit,
	fetchUserDashboard,
} from '../services/global';
import { fetchRandomSearch } from './search/service';
import { isLoggedIn } from '../utils/auth';

import PoetCard from '../components/PoetCard';
import PoemSmallCard from '../components/PoemSmallCard';
import SentenceCard from '../components/SentenceCard';
import PageHeader from '../components/PageHeader';

// 随机推荐（诗人/诗词/摘录混合），走统一 Request 封装（BaseUrl 自动按环境切换）
const fetchRandomRecommend = () => {
	return fetchRandomSearch('GET', {}).then((res) => {
		if (res && res.status) return res.data;
		return null;
	});
};

import './index.scss';

// 公历日期（右侧）：纯静态展示，无时分秒
const SolarDate = () => {
	const now = new Date();
	return (
		<View className='solar-right'>
			<Text className='solar-tag'>公历</Text>
			<Text className='solar-date'>
				{now.getMonth() + 1}月{now.getDate()}日
			</Text>
		</View>
	);
};

// 洗牌：Fisher-Yates，避免 sort(random) 带偏
const shuffle = (arr) => {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
};

const initCalendar = {
	lunarDate: { yearChinese: '', monthChinese: '', dayChinese: '' },
	festivals: [],
	weekday: '一',
};

const HomePage = () => {
	const [calendar, setCalendar] = useState(initCalendar);
	const [plans, setPlans] = useState([]);
	const [isLogin, setIsLogin] = useState(false);
	const [recommend, setRecommend] = useState({ poems: [], poets: [], sentences: [] });
	const [recommendList, setRecommendList] = useState([]);

	// 拉取首页初始化数据（农历）
	const loadHomeInit = () => {
		return fetchHomeInit('GET', {})
			.then((res) => {
				if (res && res.status && res.data) {
					const { calendar } = res.data;
					if (calendar) setCalendar(calendar);
				}
			})
			.catch(() => {});
	};

	// 拉取用户仪表盘（学习计划列表）
	const loadDashboard = () => {
		if (!isLoggedIn()) {
			setIsLogin(false);
			setPlans([]);
			return Promise.resolve();
		}
		setIsLogin(true);
		return fetchUserDashboard('GET', {})
			.then((res) => {
				if (res && res.status && res.data) {
					const { studyPlans } = res.data;
					if (studyPlans) setPlans(studyPlans);
				}
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
				];
				setRecommendList(shuffle(list));
			})
			.catch(() => {});
	};

	useLoad(() => {
		loadHomeInit();
		loadRecommend();
	});

	// 最近一次拉取仪表盘的时间，30s 内切回 tab 不重复请求（避免白屏闪烁）
	const lastDashboardRef = useRef(0);
	useDidShow(() => {
		const now = Date.now();
		if (now - lastDashboardRef.current > 30000) {
			lastDashboardRef.current = now;
			loadDashboard();
		}
	});

	// 下拉刷新：重新拉取所有数据
	usePullDownRefresh(() => {
		Promise.all([loadHomeInit(), loadDashboard(), loadRecommend()]).finally(
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

	// 跳转学习 tab（整卡可点击）
	const goStudyTab = () => {
		Taro.switchTab({ url: '/pages/study/index' });
	};

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
						<SolarDate />
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

			{/* ===== 3. 学习计划进度 ===== */}
			<View className='card planCard' onClick={goStudyTab}>
				<View className='plan-header'>
					<Text className='plan-title'>背诵计划</Text>
					<View className='plan-more'>
						<Text>
							{isLogin ? `${plans.length} 个计划` : '去查看'} ›
						</Text>
					</View>
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
							{isLogin ? '还没有背诵计划，去创建吧' : '登录后查看背诵进度'}
						</Text>
					</View>
				)}
			</View>

			{/* ===== 4.5 飞花令 & 词牌名入口 ===== */}
			<View className='gameEntryRow'>
				<View
					className='gameEntryCard'
				onClick={() => Taro.navigateTo({ url: '/pages/find/feihua' })}
				>
					<View className='gameEntryInfo'>
						<Text className='gameEntryTitle'>飞花令</Text>
						<Text className='gameEntryDesc'>寻遍千古名句</Text>
					</View>
				</View>
				<View
					className='gameEntryCard'
				onClick={() => Taro.navigateTo({ url: '/pages/find/cipai' })}
				>
					<View className='gameEntryInfo'>
						<Text className='gameEntryTitle'>词牌名</Text>
						<Text className='gameEntryDesc'>三百常用词牌</Text>
					</View>
				</View>
			</View>

			{/* ===== 4.6 诗人足迹入口 ===== */}
			<View
				className='card storyEntryCard'
				onClick={() => Taro.navigateTo({ url: '/pages/find/story-map' })}
			>
				<View className='storyEntryInfo'>
					<Text className='storyEntryTitle'>诗人足迹</Text>
					<Text className='storyEntryDesc'>
						沿着诗人一生的足迹，山川湖海间与诗词相遇
					</Text>
				</View>
				<Text className='storyEntryArrow'>›</Text>
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