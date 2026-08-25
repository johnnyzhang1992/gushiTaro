import { View, Button, Image, Text, Navigator } from '@tarojs/components';
import { useState, useRef } from 'react';
import Taro, { useLoad, useDidShow, usePullDownRefresh } from '@tarojs/taro';

import PageHeader from '../../components/PageHeader';
import SectionCard from '../../components/SectionCard';
import CdnImage from '../../components/CdnImage';

import { fetchUserInfo } from './service';
import { createUser, fetchScheduleStats, fetchPointsStats } from '../../services/global';

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

	// user stats
	const fetchInfo = (id) => {
		const user = Taro.getStorageSync('user');
		const userId = id || user?.uid || user?.user_id;
		if (!userId) {
			return false;
		}
		fetchUserInfo('GET', {
			user_id: userId,
		})
			.then((res) => {
				const apiData = res.data?.data || res.data;
				if ((res.status || res.statusCode === 200) && apiData) {
					setInfo((pre) => ({
						...pre,
						...apiData,
					}));
				}
				// token 过期
				if (res.statusCode == 401) {
					setInfo(initUser);
				}
			})
			.catch((err) => {
				console.log(err);
			});
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
					fetchInfo(apiData.uid);
					fetchStats({
						id: apiData.uid,
					});
					fetchCheckinStats();
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

	const fetchCheckinStats = async () => {
		try {
			const res = await fetchPointsStats('GET', {});
			const d = res.data?.data || res.data;
			if (d && d.totalPoints !== undefined) {
				const checkedSet = new Set(d.monthlyCheckins || []);
				const todayStr = new Date().toISOString().slice(0, 10);
				const days = [];
				for (let i = 6; i >= 0; i--) {
					const d = new Date();
					d.setDate(d.getDate() - i);
					const ds = d.toISOString().slice(0, 10);
					days.push({ dateStr: ds, checked: checkedSet.has(ds) });
				}
				setCheckinStats({
					todayChecked: checkedSet.has(todayStr),
					checkinDays: d.checkinDays || 0,
					checkinStreak: d.checkinStreak || 0,
					last7: days,
				});
			}
		} catch (e) {
			console.log(e);
		}
	};

	const fetchStats = async (user = {}) => {
		if (!user || (!user.id && !user.uid)) {
			return false;
		}
		const res = await fetchScheduleStats('GET', {});
		if (res && (res.status || res.statusCode === 200)) {
			setScheduleStats(res.data);
		}
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
			fetchStats(user);
			fetchCheckinStats();
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
			if (!fetchInfo()) {
				// 用户数据还没就绪（自动登录未完成），延迟重试
				setTimeout(() => fetchInfo(), 1000);
			}
			fetchStats(user);
			fetchCheckinStats();
		}
	});

	usePullDownRefresh(() => {
		console.log('page-pullRefresh');
		fetchInfo();
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
							<View className='user_name'>
								<Text className='text'>
									{userInfo.name || userInfo.nickName || userInfo.nickname}
								</Text>
								<View className='setting'>
									<Text className='text'>编辑资料</Text>
									<Text className='icon settings-icon'></Text>
								</View>
							</View>
						</Navigator>
					) : (
						<View className='loginCard'>
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
				<Navigator className='checkin-section' hoverClass='none' url='/pages/me/checkin'>
					<View className='checkin-header'>
						<Text className='title'>我的签到</Text>
						<View className={`tag ${checkinStats.todayChecked ? 'checked' : ''}`}>
							{checkinStats.todayChecked ? '已签到' : '未签到'}
						</View>
						<View className='arrow'>›</View>
					</View>
					<View className='checkin-week'>
						{checkinStats.last7.map((day, i) => (
							<View key={i} className='day-item'>
								<View className={`day-block ${day.checked ? 'checked' : ''}`} />
							</View>
						))}
						<View className='week-hint'>{getMotd(checkinStats.checkinStreak, checkinStats.checkinDays)}</View>
					</View>
				</Navigator>
				{/* 我的收藏 */}
				<SectionCard title=''>
					<View className='sectionItems schedule'>
						<Navigator
							className='item'
							hoverClass='none'
							url='/pages/me/collect'
						>
							<View className='name'>我的收藏</View>
							<View className='num'>
								<View className='chevron-right'></View>
							</View>
						</Navigator>
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
					</View>
				</SectionCard>
				{/* 我的诗单 */}
				<SectionCard title=''>
					<View className='sectionItems schedule'>
						<Navigator
							className='item'
							hoverClass='none'
							url='/pages/me/collections'
						>
							<View className='name'>我的诗单</View>
							<View className='num'>
								<View className='chevron-right'></View>
							</View>
						</Navigator>
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
