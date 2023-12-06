import {
	View,
	Image,
	Navigator,
	Form,
	Input,
	Switch,
	Button,
} from '@tarojs/components';
import { useState, useRef } from 'react';
import Taro, { useDidShow, useLoad, usePullDownRefresh } from '@tarojs/taro';

import { updateUserInfo, uploadAvatar } from '../service';
import { userIsLogin } from '../../../utils/auth'

import './style.scss';

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
		formRef.current = {
			avatar: user.avatarUrl,
			name: user.name || user.nickName,
		};
		updateForm({
			avatar: user.avatarUrl,
			name: user.name || user.nickName,
		});
	});

	useDidShow(() => {
		const isLogin = userIsLogin();
		console.log(isLogin)
	})

	usePullDownRefresh(() => {
		Taro.stopPullDownRefresh();
	})

	const handleNickNameReview = (e) => {
		console.log(e.detail);
	};

	const handleSubmit = (e) => {
		const { agree, name } = e.detail.value;
		const formObj = { nickName: name };
		if (!name) {
			Taro.showToast({
				title: '姓名不能为空',
				icon: 'none',
				duration: 2000,
			});
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
			if (res && res.statusCode === 200) {
				Taro.showToast({
					title: '更新成功',
					icon: 'success',
					duration: 2000,
				});
				Taro.setStorageSync('user', res.data);
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
				uploadAvatar('POST', {
					name: 'file',
					filePath: tempFilePath,
				}).then((_res) => {
					if (_res && _res.statusCode === 200) {
						const user = Taro.getStorageSync('user');
						const { avatarUrl } = JSON.parse(_res.data);
						Taro.setStorageSync('user', {
							...user,
							avatar: avatarUrl,
							avatarUrl,
						});
						updateForm((pre) => ({
							...pre,
							avatar: avatarUrl,
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
				<View className='formItem center noBottom'>
					<View className='formContent' onClick={updateAvatar}>
						<View className='avatar'>
							<Image src={form.avatar} className='avatarImg' />
						</View>
						<View className='intro'>设置头像</View>
					</View>
				</View>
				<View className='formItem'>
					<View className='label'>姓名</View>
					<View className='formContent'>
						<Input
							controlled={false}
							name='name'
							value={form.name}
							type='nickname'
							onNickNameReview={handleNickNameReview}
							placeholder='自定义昵称'
						/>
					</View>
				</View>
				<View className='formBtns'>
					<Button
						size='small'
						type='primary'
						formType='submit'
						className='submitBtn'
					>
						保存
					</Button>
				</View>
				<View className='agressContainer'>
					<Switch name='agree' type='checkbox' controlled={false} />
					<Navigator
						url='/pages/post/index?type=privateRule'
						className='navigator'
						hoverClass='none'
					>
						《用户服务协议及隐私条款》
					</Navigator>
				</View>
			</Form>
		</View>
	);
};

export default SettingPage;
