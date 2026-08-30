import { View, Button, Image, Text, Navigator } from '@tarojs/components';
import { useState, useRef } from 'react';
import Taro, { useLoad, useDidShow, usePullDownRefresh } from '@tarojs/taro';

import PageHeader from '../../components/PageHeader';
import SectionCard from '../../components/SectionCard';
import CdnImage from '../../components/CdnImage';

import { fetchUserProfile, createUser } from '../../services/global';

import './style.scss';

import xcxPng from '../../images/xcx.jpg';
import poetPng from '../../images/svg/poet.svg';
import ScanSvg from '../../images/svg/scan.svg';

const initUser = {
	poem_count: 0,
	poet_count: 0,
	sentence_count: 0,
	uid: -1,
};
const MeIndex = () => {
	const [userInfo, setInfo] = useState(initUser);
	const [scheduleStats, setScheduleStats] = useState({
		total_poem: 0, // 学习诗词数量
		continue_days: 0, // 连续打卡天数
		total_days: 0, // 总打卡天数
	});
	const [checkinStats, setCheckinStats] = useState({
		todayChecked: false,
		checkinDays: 0,
		checkinStreak: 0,
		last7: [],
	});

	const getMotd = (streak, total) => {
		if (total === 0) return '今天开始签到吧';
		if (streak >= 30) return '三十日磨一剑，锋芒初现';
		if (streak >= 7) return '坚持一周，渐入佳境';
		if (streak >= 3) return '三日不辍，已有小成';
		if (total >= 30) return '积少成多，未来可期';
		return '日积跬步，以至千里';
	};
	const isCreate = useRef(false);

	// 拉取用户完整资料（一次请求获取用户信息 + 学习统计 + 签到统计）
	const loadUserProfile = () => {
		const user = Taro.getStorageSync('user');
		const userId = user?.uid || user?.user_id;
		if (!userId) return false;

		fetchUserProfile('GET', {})
			.then((res) => {
				const apiData = res.data?.data || res.data;
				if ((res.status || res.statusCode === 200) && apiData) {
					const { userInfo, scheduleStats, pointsStats } = apiData;
					// 更新用户信息
					setInfo((pre) => ({ ...pre, ...userInfo }));
					// 更新学习统计
					if (scheduleStats) setScheduleStats(scheduleStats);
					// 更新签到统计
					if (pointsStats) {
						const checkedSet = new Set(pointsStats.monthlyCheckins || []);
						const todayStr = new Date().toISOString().slice(0, 10);
						const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
						const days = [];
						for (let i = 6; i >= 0; i--) {
							const date = new Date();
							date.setDate(date.getDate() - i);
							const ds = date.toISOString().slice(0, 10);
							const dayIndex = date.getDay();
							const isToday = ds === todayStr;
							days.push({
								dateStr: ds,
								checked: checkedSet.has(ds),
								label: isToday ? '今' : weekDays[dayIndex],
								isToday,
							});
						}
						setCheckinStats({
							todayChecked: checkedSet.has(todayStr),
							checkinDays: pointsStats.checkinDays || 0,
							checkinStreak: pointsStats.checkinStreak || 0,
							last7: days,
						});
					}
				}
				// token 过期
				if (res.statusCode == 401) {
					setInfo(initUser);
				}
			})
			.catch((err) => {
				console.log(err);
			});
		return true;
	};

	const getUserProfile = () => {
		if (isCreate.current) {
			Taro.showToast({
				title: '正在注册中...',
				icon: 'none',
				duration: 2000,
			});
			return false;
		}
		isCreate.current = true;
		Taro.getUserProfile({
			lang: 'zh_CN',
			desc: '用于完善会员资料',
			// 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
			success: (result) => {
				// 注册或者登陆
				Taro.login({
					success: (res) => {
						// 发送 res.code 到后台换取 openId, sessionKey, unionId
						const sysInfo = Taro.getStorageSync('sys_info');
						let data = {
							code: res.code,
							iv: result.iv,
							encryptedData: result.encryptedData,
							systemInfo: JSON.stringify(sysInfo || {}),
						};
						handleCreateUser(data);
					},
					fail: (err) => {
						console.log('--Tarologin--error', err);
						isCreate.current = false;
					},
				});
			},
			fail: (res) => {
				console.log(res);
				isCreate.current = false;
			},
		});
	};

	const handleCreateUser = (data) => {
		const preLoginPath = Taro.getStorageSync('preLoginPath');
		console.log('[login] 请求参数:', JSON.stringify(data).substring(0, 100));
		createUser('POST', data)
			.then((res) => {
				console.log('[login] API 返回:', JSON.stringify(res).substring(0, 200));
				const apiData = res.data?.data || res.data;
				console.log('[login] 解包后:', JSON.stringify(apiData).substring(0, 200));
				if (apiData && apiData.uid) {
					console.log('[login] ✅ 登录成功');
					const token = apiData.token || apiData.wx_token;
					const userData = { ...apiData, token };
					console.log('[login] 存储数据:', JSON.stringify(userData).substring(0, 200));
					Taro.setStorageSync('user', userData);
					Taro.setStorageSync('wx_token', token);
					console.log('[login] Storage 写入完成');
					setInfo((pre) => ({
						...pre,
						...userData,
					}));
					loadUserProfile();
					if (preLoginPath && !preLoginPath.includes('pages/me/index')) {
						Taro.showModal({
							title: '提示',
							content: '您是否要返回登录前页面',
							confirmText: '返回',
							cancelText: '留下',
							success: function (_res) {
								if (_res.confirm) {
									console.log('用户点击确定');
									Taro.removeStorageSync('preLoginPath');
									Taro.navigateTo({
										url: '/' + preLoginPath,
									});
								} else if (_res.cancel) {
									console.log('用户点击取消');
									Taro.removeStorageSync('preLoginPath');
								}
							},
						});
					}
				} else {
					Taro.showToast({
						title: '注册用户失败',
						icon: 'error',
						duration: 2000,
					});
				}
			})
			.finally(() => {
				isCreate.current = false;
			})
			.catch((error) => {
				console.log(error);
				Taro.showToast({
					title: '注册用户失败',
					icon: 'error',
					duration: 2000,
				});
			});
	};

	// 扫码
	const handleScan = () => {
		Taro.scanCode({
			onlyFromCamera: true,
			scanType: ['wxCode', 'qrCode'],
			success(res) {
				console.log(res);
				const { path } = res || {};
				if (path) {
					Taro.navigateTo({
						url: '/' + path,
					});
				}
			},
			fail(err) {
				console.log(err);
			},
		});
	};

	const navigateToAbout = () => {
		Taro.navigateTo({
			url: '/pages/post/index?type=about',
		});
	};

	useLoad((options) => {
		console.log('useLoad', options);
		const user = Taro.getStorageSync('user') || {};
		// 过滤错误响应数据
		if (user.status === false) {
			Taro.removeStorageSync('user');
			Taro.removeStorageSync('wx_token');
		} else {
			setInfo((pre) => ({
				...pre,
				...user,
			}));
		}
	});

	useDidShow(() => {
		console.log('--page--show');
		const user = Taro.getStorageSync('user') || {};
		// 过滤错误响应数据
		if (user.status === false) {
			Taro.removeStorageSync('user');
			Taro.removeStorageSync('wx_token');
		} else {
			console.log('useDidShow user:', JSON.stringify(user).substring(0, 100));
			setInfo((pre) => ({
				...pre,
				...user,
			}));
			loadUserProfile();
		}
	});

	usePullDownRefresh(() => {
		console.log('page-pullRefresh');
		loadUserProfile();
		Taro.stopPullDownRefresh();
	});

	return (
		<View className='page mePage'>
			<PageHeader showSearch={false} title='我的'>
				<View className='customHeder'>
					<Image src={ScanSvg} className='img' onClick={handleScan} />
					<View className='title'>我的</View>
				</View>
			</PageHeader>
			<View className='pageContainer'>
				{/* 用户信息和登录 */}
				<SectionCard>
					{userInfo.uid > 0 ? (
						<Navigator
							className='userInfoCard'
							url='/pages/me/setting'
							hoverClass='none'
						>
							<View className='avatar'>
								<CdnImage src={userInfo.avatar || poetPng} className='img' />
							</View>
							<View className='userInfo'>
								<Text className='name' numberOfLines={1}>
									{userInfo.name || userInfo.nickName || userInfo.nickname}
								</Text>
							</View>
							<View className='editBtn'>
								<Text className='editText'>编辑资料</Text>
								<Text className='editArrow'>›</Text>
							</View>
						</Navigator>
					) : (
						<View className='loginCard'>
							<Text className='loginTitle'>欢迎来到古诗文小助手</Text>
							<Text className='loginDesc'>登录后开启您的诗词之旅</Text>
							<Button
								className='loginBtn'
								size='mini'
								type='default'
								onClick={getUserProfile}
							>
								立即登录
							</Button>
						</View>
					)}
				</SectionCard>
				{/* 我的签到 */}
				<SectionCard
					title='我的签到'
					extra={
						<View className={`checkin-tag ${checkinStats.todayChecked ? 'checked' : ''}`}>
							{checkinStats.todayChecked ? '已签到' : '未签到'}
						</View>
					}
					titleClick={() => Taro.navigateTo({ url: '/pages/me/checkin' })}
				>
					<View className='checkin-section'>
						<View className='checkin-streak'>
							<View className='streak-item primary'>
								<Text className='streak-num'>{checkinStats.checkinStreak}</Text>
								<Text className='streak-label'>连续签到</Text>
							</View>
							<View className='streak-item'>
								<Text className='streak-num'>{checkinStats.checkinDays}</Text>
								<Text className='streak-label'>累计签到</Text>
							</View>
						</View>
						<View className='checkin-week'>
							{checkinStats.last7.map((day, i) => (
								<View key={i} className='day-item'>
									<Text className='day-label'>{day.label}</Text>
									<Text className='day-date'>{parseInt(day.dateStr.slice(8, 10), 10)}</Text>
									<View className={`day-dot ${day.checked ? 'checked' : ''} ${day.isToday ? 'today' : ''}`} />
								</View>
							))}
						</View>
					</View>
				</SectionCard>
				{/* 我的收藏 */}
				<SectionCard
					title='我的收藏'
					extra={<View className='icon chevron-right' />}
					titleClick={() => Taro.navigateTo({ url: '/pages/me/collect' })}
				>
					<View className='statsCard'>
						<Navigator
							className='card_item'
							hoverClass='none'
							url='/pages/me/collect?type=poem'
						>
							<View className='top'>
								<Text className='num'>{userInfo.poem_count || 0}</Text>
							</View>
							<View className='info'>作品</View>
						</Navigator>
						<Navigator
							className='card_item'
							hoverClass='none'
							url='/pages/me/collect?type=sentence'
						>
							<View className='top'>
								<Text className='num'>{userInfo.sentence_count || 0}</Text>
							</View>
							<View className='info'>摘录</View>
						</Navigator>
						<Navigator
							className='card_item'
							hoverClass='none'
							url='/pages/me/collect?type=author'
						>
							<View className='top'>
								<Text className='num'>{userInfo.poet_count || 0}</Text>
							</View>
							<View className='info'>作者</View>
						</Navigator>
					</View>
				</SectionCard>
				{/* 我的诗单 */}
				<SectionCard
					title='我的诗单'
					extra={<View className='icon chevron-right' />}
					titleClick={() => Taro.navigateTo({ url: '/pages/me/collections' })}
				>
					<View className='statsCard'>
						<Navigator
							className='card_item'
							hoverClass='none'
							url='/pages/me/collections?type=created'
						>
							<View className='top'>
								<Text className='num'>{userInfo.collection_count || 0}</Text>
							</View>
							<View className='info'>创建</View>
						</Navigator>
						<Navigator
							className='card_item'
							hoverClass='none'
							url='/pages/me/collections?type=favorited'
						>
							<View className='top'>
								<Text className='num'>{userInfo.collection_fav_count || 0}</Text>
							</View>
							<View className='info'>收藏</View>
						</Navigator>
					</View>
				</SectionCard>

				{/* 关于我们 */}
				<SectionCard
					title='关于我们'
					extra={<View className='icon chevron-right' />}
					titleClick={navigateToAbout}
				>
					<View className='imgContainer'>
						<Image src={xcxPng} showMenuByLongpress className='xcxImg' />
						<View className='intro'>
							<Text className='text' userSelect>
								长按图片可保存到本地或分享给朋友
							</Text>
						</View>
					</View>
				</SectionCard>
				{/* copyright */}
				<View className='copyright'>
					<Text className='text' decode userSelect>
						2026 &copy; xuegushi.com
					</Text>
				</View>
			</View>
		</View>
	);
};

export default MeIndex;
