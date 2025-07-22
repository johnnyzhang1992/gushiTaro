import { View, Text, Image } from '@tarojs/components';
import { AtButton } from 'taro-ui';
import Taro, { useLoad } from '@tarojs/taro';
import { useState } from 'react';

import laptopSvg from '../../images/svg/laptop.svg';
import laptopCheckSvg from '../../images/svg/laptop_check.svg';

import { updateQRCodeStatus, handleQRCodeLogin } from './service';

import './login.scss';

const QrcodeLogin = () => {
	const [qrcodeToken, setQrcodeToken] = useState('');
	const [loginSuccess, setLoginSuccess] = useState(false);

	useLoad((options) => {
		console.log(options, 'load:options');
		const sceneArr = decodeURIComponent(
			options.scene || 'qrctoken%3D13d7ed6d8ab1bce3'
		).split('=');
		console.log(sceneArr, 'sceneArr');
		setQrcodeToken(sceneArr[1]);
		console.log('qrcodeToken', sceneArr[1]);
		const wxToken = Taro.getStorageSync('wx_token');
		if (wxToken) {
			console.log('二维码状态更新上报：');
			handleUpdateStatus(sceneArr[1]);
		}
	});

	const cancelLogin = () => {
		Taro.switchTab({
			url: '/pages/index',
		});
	};

	const handlePreLogin = () => {
		const wxToken = Taro.getStorageSync('wx_token');
		console.log({
			qrcode_token: qrcodeToken,
			wx_token: wxToken,
		});
		// 未登录弹窗提示
		if (!wxToken) {
			Taro.showModal({
				title: '提示',
				content: '您需要先完成登录操作',
				confirmText: '去登录',
				cancelText: '取消',
				success: function (_res) {
					if (_res.confirm) {
						const preLoginPath =
							'pages/me/qrcode_login?scene=' +
							encodeURIComponent(`qrctoken=${qrcodeToken}`);
						Taro.setStorageSync('preLoginPath', preLoginPath);
						console.log('用户点击确定');
						Taro.switchTab({
							url: '/pages/me/index',
						});
					} else if (_res.cancel) {
						console.log('用户点击取消');
						Taro.switchTab({
							url: '/pages/index',
						});
					}
				},
			});
		}
		// 已登录
		Taro.login({
			success: (res) => {
				console.log(res.code);
				// 请求接口
				handleLogin(res.code);
			},
			fail: (err) => {
				console.log(err);
			},
		});
	};

	const handleUpdateStatus = async (token) => {
		const res = await updateQRCodeStatus('POST', {
			qrcode_token: token,
		}).catch((err) => {
			console.log(err);
		});
		console.log(res, 'updateQRCodeStatus');
	};

	const handleLogin = async (_code) => {
		const res = await handleQRCodeLogin('POST', {
			code: _code,
			qrcode_token: qrcodeToken,
		}).catch((err) => {
			console.log(err);
			Taro.showToast({
				title: '授权失败，请重试！',
				icon: 'none',
			});
		});
		console.log(res, 'handleQRCodeLogin');
		if (res && res.statusCode == 200) {
			const { code, wx_token } = res.data || {}
			if (wx_token) {
				Taro.setStorageSync('wx_token', wx_token);
			}
			if (code == 200) {
				Taro.showToast({
					title: '登录成功',
					icon: 'success',
					duration: 2000,
				});
				setLoginSuccess(true);
				return false;
			}
		}
		Taro.showToast({
			title: (res && res.data && res.data.msg) || '授权失败，请重试！',
			icon: 'none',
		});
	};

	return (
		<View className='page'>
			<View className='imgContainer'>
				<Image
					src={loginSuccess ? laptopCheckSvg : laptopSvg}
					className='img'
				/>
			</View>
			{loginSuccess ? (
				<View className='loginContainer'>
					{/* 登录成功 */}
					<View className='text success'>登录成功</View>
				</View>
			) : (
				<View className='loginContainer'>
					{/* 授权登录 */}
					<View className='top'>
						<View className='text'>
							<Text>正在尝试网页端扫码登录</Text>
						</View>
						<View className='text'>
							<Text>请确认是否为本人操作</Text>
						</View>
					</View>
					<View className='btns'>
						<AtButton
							type='primary'
							className='btn confirm'
							onClick={handlePreLogin}
						>
							确认登录
						</AtButton>
						<AtButton
							type='secondary'
							className='btn cancel'
							onClick={cancelLogin}
						>
							取消登录
						</AtButton>
					</View>
				</View>
			)}
		</View>
	);
};

export default QrcodeLogin;
