import { View, Button, Image, Text, Navigator } from '@tarojs/components';
import { useState, useRef } from 'react';
import Taro, { useLoad, useDidShow, usePullDownRefresh } from '@tarojs/taro';

import PageHeader from '../../components/PageHeader';
import SectionCard from '../../components/SectionCard';
import CdnImage from '../../components/CdnImage';

import { fetchUserProfile, createUser } from '../../services/global';
import { isLoggedIn } from '../../utils/auth';

import './style.scss';

import xcxPng from '../../images/xcx.jpg';
import poetPng from '../../images/svg/poet.svg';
import ScanSvg from '../../images/svg/scan_dark.svg';

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
	const loadUserProfile = (forceRefresh = false) => {
		// 未登录：跳过请求、重置为未登录 UI，不弹登录框
		if (!isLoggedIn()) {
			setInfo(initUser);
			setScheduleStats({
				total_poem: 0,
				continue_days: 0,
				total_days: 0,
			});
			return Promise.resolve();
		}

		// 下拉刷新强制后端重算收藏数（避免命中 300s profile 缓存导致典故收藏数 0/4 抖动）
		return fetchUserProfile('GET', forceRefresh ? { refresh: 1 } : {})
			.then((res) => {
				const apiData = res.data?.data || res.data;
				if ((res.status || res.statusCode === 200) && apiData) {
					const { userInfo, scheduleStats } = apiData;
					// 更新用户信息
					setInfo((pre) => ({ ...pre, ...userInfo }));
					// 更新学习统计
					if (scheduleStats) setScheduleStats(scheduleStats);
				}
				// token 过期（request.js 已 reject，此处仅兜底）
				if (res.statusCode == 401) {
					setInfo(initUser);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	// 注册/登录：直接取微信 code 换 token
	// （Taro.getUserProfile 已废弃：2022-10 起只返回匿名昵称/默认头像，且多一次失败点，不再调用）
	const handleWxLogin = () => {
		if (isCreate.current) {
			Taro.showToast({
				title: '正在登录中...',
				icon: 'none',
				duration: 2000,
			});
			return false;
		}
		isCreate.current = true;
		Taro.login({
			success: (res) => {
				// 发送 res.code 到后台换取 openId, sessionKey, unionId
				const sysInfo = Taro.getStorageSync('sys_info');
				handleCreateUser({
					code: res.code,
					systemInfo: JSON.stringify(sysInfo || {}),
				});
			},
			fail: (err) => {
				console.log('--Tarologin--error', err);
				isCreate.current = false;
				Taro.showToast({
					title: '微信登录失败，请重试或使用真实账号',
					icon: 'none',
					duration: 2500,
				});
			},
		});
	};

	const handleCreateUser = (data) => {
		const preLoginPath = Taro.getStorageSync('preLoginPath');
		createUser('POST', data)
			.then((res) => {
				const apiData = res.data?.data || res.data;
				if (apiData && apiData.uid) {
					console.log('[login] ✅ 登录成功');
					const token = apiData.token || apiData.wx_token;
					const userData = { ...apiData, token };
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
			// 只合并身份/展示字段，count 一律以 /home/profile 实时结果为准：
			// 本地 user 快照可能带登录时的旧收藏数（如 allusion_count=0），整体覆盖会导致
			// “从收藏页返回个人中心数字变 0”，下拉刷新才恢复
			const {
				poem_count: _p, poet_count: _a, sentence_count: _s,
				allusion_count: _al, collection_count: _c, collection_fav_count: _cf,
				...identity
			} = user;
			setInfo((pre) => ({
				...pre,
				...identity,
			}));
			// 每次进页都拉取（服务端有 300s 缓存 + 收藏后失效，开销可控），保证数字即时正确
			loadUserProfile();
		}
	});

	usePullDownRefresh(() => {
		console.log('page-pullRefresh');
		Promise.resolve(loadUserProfile(true)).finally(() => {
			Taro.stopPullDownRefresh();
		});
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
								onClick={handleWxLogin}
							>
								立即登录
							</Button>
						</View>
					)}
				</SectionCard>
				{/* 我的数据（收藏 + 诗单合并，紧凑网格） */}
				<SectionCard
					title='我的数据'
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
						<Navigator
							className='card_item'
							hoverClass='none'
							url='/pages/me/collect?type=allusion'
						>
							<View className='top'>
								<Text className='num'>{userInfo.allusion_count || 0}</Text>
							</View>
							<View className='info'>典故</View>
						</Navigator>
						<Navigator
							className='card_item'
							hoverClass='none'
							url='/pages/me/collections?type=created'
						>
							<View className='top'>
								<Text className='num'>{userInfo.collection_count || 0}</Text>
							</View>
							<View className='info'>创建诗单</View>
						</Navigator>
						<Navigator
							className='card_item'
							hoverClass='none'
							url='/pages/me/collections?type=favorited'
						>
							<View className='top'>
								<Text className='num'>{userInfo.collection_fav_count || 0}</Text>
							</View>
							<View className='info'>收藏诗单</View>
						</Navigator>
					</View>
				</SectionCard>

				{/* 关于我们（横排紧凑） */}
				<SectionCard
					title='关于我们'
					extra={<View className='icon chevron-right' />}
					titleClick={navigateToAbout}
				>
					<View className='aboutRow'>
						<Image src={xcxPng} showMenuByLongpress className='xcxImg' />
						<View className='aboutInfo'>
							<Text className='aboutTitle'>古诗文小助手</Text>
							<Text className='aboutDesc' userSelect>
								长按二维码保存或分享给朋友
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
