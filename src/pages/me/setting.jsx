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
import { isApiSuccess } from '../../apis/response';

const SettingPage = () => {
	const [form, updateForm] = useState({
		avatar: '',
		name: '',
	});
	const formRef = useRef({
		avatar: '',
		name: '',
	});
	// 待上传头像（本地临时路径）：选图→编辑→预览都只作用在本地，点「保存」才真正上传
	const pendingAvatarRef = useRef(null);
	// 服务端当前头像（用于「取消更换」回退）
	const originalAvatarRef = useRef('');
	// 保存中：防重复提交
	const [saving, setSaving] = useState(false);

	useLoad(() => {
		Taro.setNavigationBarTitle({ title: '用户信息设置' });
		const user = Taro.getStorageSync('user');
		const name = user.name || user.nickName || user.nickname;
		originalAvatarRef.current = user.avatar || '';
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

	// md5 去重缓存键：同一张图复用旧 CDN 地址，不重复上传
	const AVATAR_UPLOAD_KEY = 'avatar_upload';

	const getFileMd5 = (filePath) =>
		new Promise((resolve) => {
			Taro.getFileInfo({ filePath, digestAlgorithm: 'md5' })
				.then((r) => resolve(r.digest || ''))
				.catch(() => resolve(''));
		});

	const handleSubmit = async (e) => {
		if (saving) return; // 防重复提交
		const { agree, name } = e.detail.value;
		if (!name) {
			Taro.showToast({
				title: '昵称不能为空',
				icon: 'none',
				duration: 2000,
			});
			return;
		}
		if (!agree) {
			Taro.showToast({
				title: '请先同意《用户服务协议及隐私条款》',
				icon: 'none',
				duration: 2000,
			});
			return;
		}
		setSaving(true);

		// 有待上传头像时：先传头像拿 CDN 地址，再随昵称一起提交
		const doUpdate = (avatarUrl) => {
			const payload = avatarUrl ? { nickName: name, avatar: avatarUrl } : { nickName: name };
			return updateUserInfo('POST', payload).then((res) => {
				if (isApiSuccess(res)) {
					Taro.showToast({
						title: '更新成功',
						icon: 'success',
						duration: 2000,
					});
					const localUser = Taro.getStorageSync('user');
					Taro.setStorageSync('user', { ...localUser, ...res.data });
					setTimeout(() => Taro.navigateBack(), 600);
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

		try {
			if (!pendingAvatarRef.current) {
				await doUpdate();
				return;
			}
			Taro.showLoading({ title: '上传头像中', mask: true });
			// img_sec_check 硬限 ≤1MB：从 q80 起逐档压缩到 1MB 内再上传（检测在服务端进行）
			const filePath = await compressUnderLimit(pendingAvatarRef.current);
			if (!filePath) {
				Taro.hideLoading();
				Taro.showToast({
					title: '图片过大且无法压缩，请换一张',
					icon: 'none',
				});
				return;
			}
			// 同一张图（md5 一致）复用旧 CDN 地址
			const md5 = await getFileMd5(filePath);
			const last = Taro.getStorageSync(AVATAR_UPLOAD_KEY) || {};
			if (md5 && last.md5 === md5 && last.url) {
				Taro.hideLoading();
				const user = Taro.getStorageSync('user');
				Taro.setStorageSync('user', { ...user, avatar: last.url, avatarUrl: last.url });
				await doUpdate(last.url);
				return;
			}
			const _res = await uploadUserAvatar('POST', {
				name: 'file',
				filePath,
				platform: 'wxapp',
			});
			Taro.hideLoading();
			let cdn_url = '';
			try {
				cdn_url = JSON.parse(_res.data).cdn_url;
			} catch (err) {
				console.error('解析上传结果失败:', err);
			}
			if (!cdn_url) {
				Taro.showToast({
					title: '头像上传失败，请重试',
					icon: 'none',
				});
				return;
			}
			pendingAvatarRef.current = null;
			if (md5) Taro.setStorageSync(AVATAR_UPLOAD_KEY, { md5, url: cdn_url });
			const user = Taro.getStorageSync('user');
			Taro.setStorageSync('user', {
				...user,
				avatar: cdn_url,
				avatarUrl: cdn_url,
			});
			await doUpdate(cdn_url);
		} catch (err) {
			Taro.hideLoading();
			// UploadFile 已 toast 后端具体提示（如「头像包含不当内容」），此处不再叠加
			console.log('头像上传失败:', err);
		} finally {
			setSaving(false);
		}
	};

	// 逐档压缩到 1MB 内（img_sec_check 硬限）；全部失败返回 null
	const compressUnderLimit = (filePath) => {
		const LIMIT = 1024 * 1024;
		const fileSize = (path) =>
			new Promise((resolve) => {
				Taro.getFileInfo({ filePath: path })
					.then((r) => resolve(r.size || 0))
					.catch(() => resolve(0));
			});
		const compress = (path, quality) =>
			new Promise((resolve) => {
				Taro.compressImage({ src: path, quality, success: (r) => resolve(r.tempFilePath), fail: () => resolve(path) });
			});

		return (async () => {
			let best = { path: filePath, size: await fileSize(filePath) };
			if (best.size > 0 && best.size <= LIMIT) return best.path;
			for (const quality of [80, 50, 35, 25]) {
				const out = await compress(best.path, quality);
				if (out === best.path) break; // 压缩不可用
				const size = await fileSize(out);
				if (size > 0 && (best.size === 0 || size < best.size)) best = { path: out, size };
				if (best.size > 0 && best.size <= LIMIT) return best.path;
			}
			return best.size > 0 && best.size <= LIMIT ? best.path : null;
		})();
	};

	// 选图 → 原生编辑（裁剪/旋转）→ 本地预览，不上传
	const updateAvatar = () => {
		Taro.chooseMedia({
			count: 1,
			mediaType: ['image'],
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				const file = res.tempFiles && res.tempFiles[0];
				if (!file) return;
				// chooseMedia 直接带 size，无需再查文件信息
				if (file.size > 5 * 1024 * 1024) {
					Taro.showToast({
						title: '图片超过 5M，请重新选择',
						icon: 'none',
					});
					return;
				}
				editThenPreview(file.tempFilePath);
			},
			fail: (err) => {
				console.log(err);
			},
		});
	};

	// wx.editImage（基础库 2.22.0+）：系统原生裁剪/旋转编辑器，用户确认后返回新临时路径
	const editThenPreview = (filePath) => {
		if (typeof Taro.editImage === 'function' && Taro.canIUse('editImage')) {
			Taro.editImage({
				src: filePath,
				success: (res) => applyPendingAvatar(res.tempFilePath),
				fail: () => applyPendingAvatar(filePath), // 取消编辑时用原图，不阻塞流程
			});
		} else {
			applyPendingAvatar(filePath);
		}
	};

	const applyPendingAvatar = (filePath) => {
		pendingAvatarRef.current = filePath;
		updateForm((pre) => ({ ...pre, avatar: filePath }));
	};

	// 放弃本次更换，回退到服务端头像
	const resetAvatar = () => {
		pendingAvatarRef.current = null;
		updateForm((pre) => ({ ...pre, avatar: originalAvatarRef.current }));
	};

	return (
		<View className='page settingPage'>
			<Form onSubmit={handleSubmit}>
				<View className='formCard'>
					<View className='avatarSection' onClick={updateAvatar}>
						<View className='avatarWrap'>
							<CdnImage src={form.avatar || poetPng} className='avatarImg' />
							{pendingAvatarRef.current ? (
								<View className='pendingBadge'>待保存</View>
							) : null}
							<View className='avatarMask'>
								<Text className='maskText'>更换</Text>
							</View>
						</View>
						<Text className='avatarTitle'>点击更换头像</Text>
						<Text className='avatarHint'>拍照或相册，可先裁剪旋转，保存时自动审核</Text>
						{pendingAvatarRef.current ? (
							<Text
								className='actionLink'
								onClick={(e) => {
									e.stopPropagation();
									resetAvatar();
								}}
							>
								取消更换
							</Text>
						) : null}
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
					<Text className='fieldTip'>昵称将经过微信内容安全检测</Text>
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
						loading={saving}
						disabled={saving}
					>
						{saving ? '保存中…' : '保存'}
					</Button>
				</View>
			</Form>
			<View className='tipText'>修改后返回个人中心即可查看最新资料</View>
		</View>
	);
};

export default SettingPage;
