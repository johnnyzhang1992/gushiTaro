import { View, Image, ScrollView } from '@tarojs/components';

import './style.scss';

import closeSvg from '../../images/svg/close.svg';

const FloatLayout = (props) => {
	const {
		close,
		title='',
		style = {},
		showTitle = true,
		className='',
		isOpen,
		scrollY = false,
	} = props;

	const handleClose = () => {
		if (close && typeof close === 'function') {
			close();
		}
	};

	return (
		<View
			className={`float-layout ${className} ${isOpen ? 'active' : 'hide'}`}
			style={{
				...style,
				visibility: isOpen ? 'visible' : 'hidden',
			}}
		>
			<View className='float-layout__overlay' onClick={handleClose}></View>
			<View className='float-layout-container'>
				{showTitle ? (
					<View
						className='float-layout-header'
						style={{
							display: title ? 'flex' : 'none',
						}}
					>
						<View className='layout-header__title'>{title}</View>
						<View className='layout-header__btn_close' onClick={handleClose}>
							<Image className='svg' mode='widthFix' src={closeSvg} />
						</View>
					</View>
				) : null}
				<View className='float-layout-body'>
					{scrollY ? (
						<ScrollView scrollY className='float-layout-body__scroll-view'>
							{props.children}
						</ScrollView>
					) : (
						props.children
					)}
				</View>
			</View>
		</View>
	);
};

export default FloatLayout;
