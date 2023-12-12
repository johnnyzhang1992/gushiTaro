import { View, Button, Image, Text, Navigator, Ad } from '@tarojs/components';
import { useState, useRef } from 'react';
import Taro, { useLoad, useDidShow, usePullDownRefresh } from '@tarojs/taro';
import { useNavigationBar } from 'taro-hooks';

import SectionCard from '../../components/SectionCard';

// import { BaseUrl } from '../../const/config';
import { fetchUserInfo, createUser } from './service';

import './style.scss';

import poetPng from '../../images/icon/poet.png';
import xcxPng from '../../images/xcx.jpg';

const MeIndex = () => {
	const { setTitle } = useNavigationBar({ title: '个人中心' });
	const [userInfo, setInfo] = useState({
		poem_count: 0,
		poet_count: 0,
		sentence_count: 0,
		user_id: -1,
	});
	const isCreate = useRef(false);

	const fetchInfo = (id) => {
		const user = Taro.getStorageSync('user');
		if (!id && (!user || !user.user_id)) {
			return false;
		}
		fetchUserInfo('GET', {
			user_id: id || user.user_id,
		}).then((res) => {
			if (res && res.statusCode === 200) {
				setInfo((pre) => ({
					...pre,
					...res.data,
				}));
			}
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
		// 向关联网站发送请求，解密、存储数据
		const preLoginPath = Taro.getStorageSync('preLoginPath');
		createUser('POST', data)
			.then((res) => {
				if (res.data && res.data.user_id) {
					console.log('----------success------------');
					Taro.setStorageSync('user', res.data);
					Taro.setStorageSync('wx_token', res.data.wx_token);
					setInfo((pre) => ({
						...pre,
						...res.data,
					}));
					fetchInfo(res.data.user_id);
					if (preLoginPath) {
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

	// const handleZanshang = () => {
	// 	Taro.previewImage({
	// 		current: BaseUrl + '/static/xcx/zanshang.jpeg', // 当前显示图片的http链接
	// 		urls: [BaseUrl + '/static/xcx/zanshang.jpeg'], // 需要预览的图片http链接列表
	// 	});
	// };

	const navigateToAbout = () => {
		Taro.navigateTo({
			url: '/pages/post/index?type=about',
		});
	};

	useLoad((options) => {
		console.log(options);
		const user = Taro.getStorageSync('user') || {};
		setInfo((pre) => ({
			...pre,
			...user,
		}));
		setTitle('个人中心');
	});

	useDidShow(() => {
		console.log('--page--show');
		fetchInfo();
		const user = Taro.getStorageSync('user') || {};
		setInfo((pre) => ({
			...pre,
			...user,
		}));
	});

	usePullDownRefresh(() => {
		console.log('page-pullRefresh');
		fetchInfo();
		Taro.stopPullDownRefresh();
	});
	return (
		<View className='page mePage'>
			{/* 用户信息和登录 */}
			<View className='meTop'>
				{userInfo.user_id ? (
					<Navigator
						className='userInfoCard'
						url='/pages/me/setting/index'
						hoverClass='none'
					>
						<View className='avatar'>
							<Image
								src={userInfo.avatarUrl || poetPng}
								className='img'
							/>
						</View>
						<View className='user_name'>
							<Text className='text'>
								{userInfo.name || userInfo.nickName}
							</Text>
							<Text className='icon at-icon at-icon-settings'></Text>
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
			</View>
			{/* 我的收藏 */}
			<SectionCard title='我的收藏'>
				<View className='sectionItems'>
					<Navigator
						className='item'
						hoverClass='none'
						url='/pages/me/collect?type=poem'
					>
						<View className='name'>诗词文言</View>
						<View className='num'>{userInfo.poem_count}</View>
					</Navigator>
					<Navigator
						className='item'
						hoverClass='none'
						url='/pages/me/collect?type=sentence'
					>
						<View className='name'>名句摘录</View>
						<View className='num'>{userInfo.sentence_count}</View>
					</Navigator>
					<Navigator
						className='item'
						hoverClass='none'
						url='/pages/me/collect?type=author'
					>
						<View className='name'>诗人</View>
						<View className='num'>{userInfo.poet_count}</View>
					</Navigator>
				</View>
			</SectionCard>
			<View className='divide' />
			{/* 关于我们 */}
			<SectionCard
				title='关于我们'
				extra={<View className='icon at-icon at-icon-chevron-right' />}
				titleClick={navigateToAbout}
			></SectionCard>
			<View className='divide' />
			{/* 小程序码 */}
			<SectionCard title='小程序码'>
				<View className='imgContainer'>
					<Image
						src={xcxPng}
						showMenuByLongpress
						className='xcxImg'
					/>
					<View className='intro'>
						<Text className='text' userSelect>
							长按图片可保存到本地或分享给朋友
						</Text>
					</View>
				</View>
			</SectionCard>
			<View className='divide' />
			{/* 赞赏 */}
			{/* <SectionCard
				title='天冷了，给程序员小哥哥买杯热咖啡'
				titleClick={handleZanshang}
				extra={<View className='icon at-icon at-icon-chevron-right' />}
			></SectionCard>
			<View className='divide' /> */}
			<Ad unit-id='adunit-bf6445b29863936e' />
			{/* copyright */}
			<View className='copyright'>
				<Text className='text' decode userSelect>
					2023 &copy; xuegushi.com
				</Text>
			</View>
			{userInfo.user_id && userInfo.user_id === 10 ? (
				<SectionCard
					title='数据统计'
					style={{
						paddingBottom: '30px'
					}}
					extra={<Navigator url='/pages/admin/index'>=&gt;进入</Navigator>}
				/>
			) : null}
		</View>
	);
};

export default MeIndex;
