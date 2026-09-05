import { View, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';

import searchSvg from '../../images/svg/search.svg';

import './style.scss';

// 胶囊按钮位置是设备固定值，加载一次全局缓存，避免每次渲染都调用原生 API 造成卡顿/闪烁
let cachedMenuRect = null;
const getMenuRect = () => {
	if (cachedMenuRect) return cachedMenuRect;
	try {
		cachedMenuRect = Taro.getMenuButtonBoundingClientRect() || {};
	} catch (e) {
		cachedMenuRect = {};
	}
	return cachedMenuRect;
};

const PageHeader = (props) => {
	const { title, showSearch = true, showBack = false } = props;
	const MenuRect = getMenuRect();
	const deviceInfo = Taro.getDeviceInfo();
	const PageDeep = Taro.getCurrentPages().length;
	// PC端样式比较特殊，且不支持图片导出
	const isPc = ['mac', 'windows'].includes(deviceInfo.platform);
	const LeaveTop = isPc ? 25 : MenuRect.top;

	const navigateSearch = () => {
		Taro.navigateTo({
			url: '/pages/search/index',
		});
	};
	const navigateBack = () => {
		if (PageDeep === 1) {
			Taro.switchTab({
				url: '/pages/index',
			});
		}
		Taro.navigateBack({
			delta: 1,
		});
	};
	return (
		<View
			className={`custome-page-header ${title ? 'hasTitle' : ''}`}
			style={{
				paddingTop: `${LeaveTop}px`,
				height: (MenuRect.height || 32) + 'px',
			}}
		>
			{/* 搜索入口 */}
			{showSearch ? (
				<View
					className='search'
					onClick={navigateSearch}
					style={{
						height: (MenuRect.height || 32) + 'px',
					}}
				>
					<Image src={searchSvg} className='icon' mode='widthFix' />
				</View>
			) : null}
			{/* 返回按钮 */}
			{showBack ? (
				<View
					className='search'
					onClick={navigateBack}
					style={{
						height: (MenuRect.height || 32) + 'px',
					}}
				>
					<View className='chevron-left'></View>
				</View>
			) : null}
			{props.children ? (
				props.children
			) : (
				<View
					className='header-title'
					style={{
						display: title ? 'flex' : 'none',
					}}
				>
					{title}
				</View>
			)}
		</View>
	);
};

export default PageHeader;
