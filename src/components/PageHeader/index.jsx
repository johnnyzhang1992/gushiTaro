import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';

import searchSvg from '../../images/svg/search.svg';

import './style.scss';

const PageHeader = (props) => {
	const { title, showSearch = true, showBack = false } = props;
	const MenuRect = Taro.getMenuButtonBoundingClientRect();
	const deviceInfo = Taro.getDeviceInfo();
	// PC端样式比较特殊，且不支持图片导出
	const isPc = ['mac', 'windows'].includes(deviceInfo.platform);
	const LeaveTop = isPc ? 10 : MenuRect.top;

	const navigateSearch = () => {
		Taro.navigateTo({
			url: '/pages/search/index',
		});
	};
	const navigateBack = () => {
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
					className='search back'
					onClick={navigateBack}
					style={{
						height: (MenuRect.height || 32) + 'px',
					}}
				>
					<View className='at-icon at-icon-chevron-left'>
						<Text className='text'>返回</Text>
					</View>
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
