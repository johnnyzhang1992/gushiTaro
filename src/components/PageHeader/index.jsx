import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './style.scss';

const PageHeader = (props) => {
	const { title } = props;
	const MenuRect = Taro.getMenuButtonBoundingClientRect();
	const deviceInfo = Taro.getDeviceInfo();
	// PC端样式比较特殊，且不支持图片导出
	const isPc = ['mac', 'windows'].includes(deviceInfo.platform);
	const LeaveTop = isPc ? 10 : MenuRect.top;
	return (
		<View
			className={`custome-page-header ${title ? 'hasTitle' : ''}`}
			style={{
				paddingTop: `${LeaveTop}px`,
				height: (MenuRect.height || 32) + 'px',
			}}
		>
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
