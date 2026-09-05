import {
	View,
	Navigator,
	Text,
	Form,
	Input,
	Switch,
	Button,
	} from '@tarojs/components';
import { useState, useRef } from 'react';
import Taro, { useDidShow, useLoad, usePullDownRefresh } from '@tarojs/taro';

import CdnImage from '../../components/CdnImage';
import { updateUserInfo } from '../../services/global';
import { uploadUserAvatar } from './service';
import { userIsLogin } from '../../utils/auth';

import poetPng from '../../images/svg/poet.svg';

import './setting.scss';

const SettingPage = () => {
	const [form, updateForm] = useState({
		avatar: '',
		name: '',
	});
	const formRef = useRef({
		avatar: '',
		name: '',
	});

	useLoad(() => {
		Taro.setNavigationBarTitle({ title: '用户信息设置' });
		const user = Taro.getStorageSync('user');
		const name = user.name || user.nickName || user.nickname;
		formRef.current = {
			avatar: user.avatar,
			name,
		};
		updateForm({
			avatar: user.avatar,
			name,
		});
	});

	useDidShow(() => {
		const isLogin = userIsLogin();
		console.log(isLogin);
	});

	usePullDownRefresh(() => {
		Taro.stopPullDownRefresh();
	});

	const handleNickNameReview = (e) => {
		console.log(e.detail);
	};

	const handleSubmit = (e) => {
		const { agree, name } = e.detail.value;
		const formObj = { nickName: name };
		if (!name) {
			Taro.showToast({
				title: '昵称不能为空',
				icon: 'none',
				duration: 2000,
			});
			return false;
		}
		console.log(formObj);
		if (!agree) {
			Taro.showToast({
				title: '请先同意《用户服务协议及隐私条款》',
				icon: 'none',
				duration: 2000,
			});
			return false;
		}
		updateUserInfo('POST', formObj).then((res) => {
			if (res && (res.status || res.statusCode === 200)) {
				Taro.showToast({
					title: '更新成功',
					icon: 'success',
					duration: 2000,
				});
				const localUser = Taro.getStorageSync('user');
				Taro.setStorageSync('user', { ...localUser, ...res.data });
				Taro.navigateBack();
			} else {
				console.log('---更新失败', res);
				Taro.showToast({
					title: '更新失败',
					icon: 'error',
					duration: 2000,
				});
			}
		});
	};

	const updateAvatar = () => {
		Taro.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			sourceType: ['album'],
			success: function (res) {
				// 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
				var tempFilePath = res.tempFilePaths[0];
				uploadUserAvatar('POST', {
					name: 'file',
					filePath: tempFilePath,
					platform: 'wxapp'
				}).then((_res) => {
					if (_res && (_res.status || _res.statusCode === 200)) {
						const user = Taro.getStorageSync('user');
						const { cdn_url } = JSON.parse(_res.data);
						Taro.setStorageSync('user', {
							...user,
							avatar: cdn_url,
							avatarUrl: cdn_url,
						});
						updateForm((pre) => ({
							...pre,
							avatar: cdn_url,
						}));
					}
				});
			},
			fail: (err) => {
				console.log(err);
			},
		});
	};

	return (
		<View className='page settingPage'>
			<Form onSubmit={handleSubmit}>
				<View className='formCard'>
					<View className='avatarSection' onClick={updateAvatar}>
						<View className='avatarWrap'>
							<CdnImage src={form.avatar || poetPng} className='avatarImg' />
							<View className='avatarMask'>
								<Text className='maskText'>更换</Text>
							</View>
						</View>
						<Text className='avatarTitle'>点击更换头像</Text>
						<Text className='avatarHint'>支持 JPG、PNG、JPEG，5M 以内</Text>
					</View>
				</View>
				<View className='formCard'>
					<View className='fieldRow'>
						<Text className='fieldLabel'>昵称</Text>
						<Input
							controlled={false}
							className='fieldInput'
							name='name'
							value={form.name}
							type='nickname'
							maxlength={14}
							onNickNameReview={handleNickNameReview}
							placeholder='请输入昵称'
							placeholderClass='inputPlaceholder'
						/>
					</View>
				</View>
				<View className='agressContainer'>
					<Switch name='agree' type='checkbox' controlled={false} />
					<Text className='agreeLabel'>已阅读并同意</Text>
					<Navigator
						url='/pages/post/index?type=privateRule'
						className='navigator'
						hoverClass='none'
					>
						《用户服务协议及隐私条款》
					</Navigator>
				</View>
				<View className='formBtns'>
					<Button
						size='default'
						type='primary'
						formType='submit'
						className='submitBtn'
					>
						保存
					</Button>
				</View>
			</Form>
			<View className='tipText'>修改后返回个人中心即可查看最新资料</View>
		</View>
	);
};

export default SettingPage;
