import { View, Button, Image, Text, Navigator } from '@tarojs/components';
import { useState, useRef } from 'react';
import Taro, { useLoad, useDidShow, usePullDownRefresh } from '@tarojs/taro';

import PageHeader from '../../components/PageHeader';
import SectionCard from '../../components/SectionCard';
import CdnImage from '../../components/CdnImage';

import { fetchUserProfile } from '../../services/global';
import { registerByWxCode } from '../../utils/login';
import { isLoggedIn } from '../../utils/auth';
import { requestLogout, requestDeleteAccount } from '../../utils/account';

import './style.scss';

import xcxPng from '../../images/xcx.jpg';
import poetPng from '../../images/svg/poet.svg';
import ScanSvg from '../../images/svg/scan_dark.svg';
import { isApiSuccess, getApiData } from '../../apis/response';

const initUser = {
	poem_count: 0,
	poet_count: 0,
	sentence_count: 0,
	uid: -1,
};
const MeIndex = () => {
	const [userInfo, setInfo] = useState(initUser);
	const isCreate = useRef(false);

	// 拉取用户完整资料（一次请求获取用户信息 + 学习统计）
	const loadUserProfile = (forceRefresh = false) => {
		// 未登录：跳过请求、重置为未登录 UI，不弹登录框
		if (!isLoggedIn()) {
			setInfo(initUser);
			return Promise.resolve();
		}

		// 下拉刷新强制后端重算收藏数（避免命中 300s profile 缓存导致典故收藏数 0/4 抖动）
		return fetchUserProfile('GET', forceRefresh ? { refresh: 1 } : {})
			.then((res) => {
				const apiData = getApiData(res);
				if (isApiSuccess(res) && apiData) {
					const { userInfo } = apiData;
					// 更新用户信息
					setInfo((pre) => ({ ...pre, ...userInfo }));
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
	// 注意：必须走 registerByWxCode（原始请求），不能走 apis/request——
	// 后者会先 await ensureLoginReady() 再登录一次，code 被提前消耗会导致注册失败
	const handleWxLogin = async () => {
		if (isCreate.current) {
			Taro.showToast({
				title: '正在登录中...',
				icon: 'none',
				duration: 2000,
			});
			return false;
		}
		isCreate.current = true;
		Taro.showLoading({ title: '正在登录…', mask: true });

		const sysInfo = Taro.getStorageSync('sys_info');
		const preLoginPath = Taro.getStorageSync('preLoginPath');
		const result = await registerByWxCode({
			systemInfo: JSON.stringify(sysInfo || {}),
		});

		Taro.hideLoading();
		isCreate.current = false;

		if (!result.ok) {
			console.log('[login] ❌ 失败:', result.message);
			Taro.showToast({
				title: result.message || '注册用户失败',
				icon: 'none',
				duration: 2500,
			});
			return;
		}

		const userData = result.data;
		console.log('[login] ✅ 登录成功');
		setInfo((pre) => ({ ...pre, ...userData }));
		loadUserProfile();

		if (preLoginPath && !preLoginPath.includes('pages/me/index')) {
			Taro.showModal({
				title: '提示',
				content: '您是否要返回登录前页面',
				confirmText: '返回',
				cancelText: '留下',
				success: function (_res) {
					if (_res.confirm) {
						Taro.removeStorageSync('preLoginPath');
						Taro.navigateTo({ url: '/' + preLoginPath });
					} else if (_res.cancel) {
						Taro.removeStorageSync('preLoginPath');
					}
				},
			});
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

	// 退出登录
	const handleLogout = async () => {
		const res = await Taro.showModal({
			title: '退出登录',
			content: '退出后需要重新登录，才能继续查看收藏、背诵计划等数据。',
			confirmText: '退出',
			cancelText: '取消',
			confirmColor: '#f43f5e',
		});
		if (!res.confirm) return;

		Taro.showLoading({ title: '正在退出…', mask: true });
		try {
			await requestLogout();
		} finally {
			Taro.hideLoading();
			setInfo(initUser);
		}
		Taro.showToast({ title: '已退出登录', icon: 'success' });
	};

	// 注销账号：第一步说明后果，第二步再次确认
	const handleDeleteAccount = async () => {
		const name = userInfo.nickname || userInfo.name || '当前账号';

		const first = await Taro.showModal({
			title: '注销账号',
			content:
				'注销后将永久删除你的背诵计划、收藏的诗句/诗词、创建的诗单与积分等数据，且无法恢复。\n\n若账号已绑定邮箱或手机号，则仅解除微信绑定，网页端账号与数据保留。',
			confirmText: '继续注销',
			cancelText: '取消',
			confirmColor: '#f43f5e',
		});
		if (!first.confirm) return;

		const second = await Taro.showModal({
			title: '再次确认',
			content: `确定要注销「${name}」吗？此操作不可撤销。`,
			confirmText: '确认注销',
			cancelText: '我再想想',
			confirmColor: '#f43f5e',
		});
		if (!second.confirm) return;

		Taro.showLoading({ title: '正在注销…', mask: true });
		try {
			const data = await requestDeleteAccount();
			Taro.hideLoading();
			setInfo(initUser);
			Taro.showToast({
				title: data.keep_account ? '已解除微信绑定' : '账号已注销',
				icon: 'success',
				duration: 2000,
			});
		} catch (err) {
			Taro.hideLoading();
			console.log('[deleteAccount] 失败', err);
			Taro.showToast({ title: '注销失败，请稍后重试', icon: 'none' });
		}
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
		// 确认当前页是「我的」，避免 tab 页缓存时误触发其他页面的下拉刷新
		const pages = Taro.getCurrentPages();
		if (pages[pages.length - 1]?.route !== 'pages/me/index') {
			Taro.stopPullDownRefresh();
			return;
		}
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

				{/* 账号：退出登录 / 注销账号（未登录不展示） */}
				{isLoggedIn() ? (
					<SectionCard title='账号'>
						<View className='accountRows'>
							<View className='accountRow' onClick={handleLogout}>
								<Text className='accountRowText'>退出登录</Text>
								<View className='icon chevron-right' />
							</View>
							<View className='accountRow' onClick={handleDeleteAccount}>
								<Text className='accountRowText danger'>注销账号</Text>
								<View className='icon chevron-right' />
							</View>
						</View>
					</SectionCard>
				) : null}

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
