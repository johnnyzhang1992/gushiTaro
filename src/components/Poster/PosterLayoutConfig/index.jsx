import { View, Text, Image, ScrollView } from '@tarojs/components';
import { AtButton } from 'taro-ui';
import { useEffect, useState } from 'react';

import PoemPosterLayout from '../PoemPosterLayout';

import Qrcode from '../../../images/icon/qrcode.png';
import shareSvg from '../../../images/svg/share.svg';
import saveSvg from '../../../images/svg/save.svg';

import {
	postBgColorArr,
	letterLayoutConfig,
	fontColorArr,
	ratioConfig,
	initConfig,
	postBgImages,
} from '../../../const/posterConfig';

import './style.scss';

const PosterLayoutItem = (props) => {
	const {
		title = '',
		containerClass = '',
		isInline = false,
		containerStyle = {},
	} = props;
	const _class = isInline ? 'layout-bottom' : 'scrollContainer';
	return (
		<View className='shareLayout'>
			<View className='title'>
				<Text className='text'>{title}</Text>
			</View>
			<View
				className={`${_class} ${containerClass}`}
				style={{
					...containerStyle,
				}}
			>
				{props.children}
			</View>
		</View>
	);
};
const PostLayoutConfig = ({
	update,
	handleDownload,
	safeArea,
	isPc = false,
	isTab = false,
}) => {
	const [posterConfig, updateConfig] = useState({
		...initConfig,
	});

	const handleToggleBottom = () => {
		updateConfig({
			...posterConfig,
			showQrcode: !posterConfig.showQrcode,
		});
	};

	const updateLayout = ({ type, letterBorder }) => {
		updateConfig({
			...posterConfig,
			type: type,
			letterBorder: letterBorder || '',
		});
	};

	const selectFontColor = (e) => {
		const { fontColor } = e.currentTarget.dataset;
		updateConfig({
			...posterConfig,
			fontColor: fontColor || '#333',
		});
	};

	const selectBgImg = (e) => {
		const { img } = e.currentTarget.dataset;
		updateConfig({
			...posterConfig,
			bgImg: img,
		});
	};

	const selectBgColor = (e) => {
		const { color } = e.currentTarget.dataset;
		updateConfig({
			...posterConfig,
			bgColor: color,
		});
	};

	const selecrRatio = (e) => {
		const { ratio } = e.currentTarget.dataset;
		updateConfig({
			...posterConfig,
			ratio: ratio || 0.75,
		});
	};

	useEffect(() => {
		if (update && typeof update === 'function') {
			update(posterConfig);
		}
	}, [posterConfig, update]);

	return (
		<View className={`poster-layout-config ${!isTab ? 'safeBottom' : ''}`}>
			{/* 布局 */}
			<PosterLayoutItem title='布局' isInline>
				<>
					<View className='scrollContainer'>
						{letterLayoutConfig.map((layout) => {
							return (
								<PoemPosterLayout
									type={layout.name}
									key={layout.name}
									style={{
										width: 30,
										height: 40,
										marginRight: 10,
										borderColor: layout.color,
									}}
									borderColor={layout.color}
									letterBorder={layout.name}
									update={updateLayout}
									activeType={posterConfig.type}
								/>
							);
						})}
					</View>
					<View
						className={`qrcode-container  ${
							posterConfig.showQrcode ? 'active' : ''
						}`}
						onClick={handleToggleBottom}
					>
						<Image
							src={Qrcode}
							className='qrcode'
							mode='widthFix'
							style={{
								height: 25,
								width: 25,
							}}
						/>
					</View>
				</>
			</PosterLayoutItem>
			{/* 模式，小红书和壁纸 */}
			<PosterLayoutItem title='展示模式' containerClass='ratio-list'>
				{ratioConfig.map((ratio) => {
					return (
						<View
							key={ratio.value}
							data-ratio={ratio.value}
							onClick={selecrRatio}
							className={`ratio-item ${
								posterConfig.ratio == ratio.value ? 'active' : ''
							}`}
						>
							{ratio.name}
						</View>
					);
				})}
			</PosterLayoutItem>
			{/* 字体颜色 */}
			<PosterLayoutItem
				title='字体颜色'
				containerStyle={{
					width: '100%',
				}}
			>
				{fontColorArr.map((color) => {
					return (
						<View
							key={color}
							className={`color-item bgColor ${
								posterConfig.fontColor === color ? 'active' : ''
							}`}
							style={{
								backgroundColor: color,
								width: 30,
								height: 30,
								padding: 4,
								marginRight: 10,
							}}
							data-fontColor={color || ''}
							onClick={selectFontColor}
						></View>
					);
				})}
			</PosterLayoutItem>
			{/* 背景图 */}
			<PosterLayoutItem title='背景图'>
				{postBgImages.map((bg) => {
					return (
						<View
							className={`bgImg ${posterConfig.bgImg === bg ? 'active' : ''}`}
							Key={bg}
							data-img={bg}
							onClick={selectBgImg}
							style={{
								backgroundImage: `url(${bg})`,
								width: 90,
								height: 30,
							}}
						/>
					);
				})}
			</PosterLayoutItem>
			{/* 背景色 */}
			<PosterLayoutItem title='背景色' containerClass='bgColorList'>
				<ScrollView
					scrollX
					enableFlex
					enhanced
					showScrollbar={false}
					className='scrollContainer bgImgList'
					style={{
						height: 52,
						width: safeArea.width - 30,
					}}
				>
					{postBgColorArr.map((color) => {
						return (
							<View
								key={color}
								className={`color-item bgImg ${
									posterConfig.bgColor === color ? 'active' : ''
								}`}
								style={{
									width: 30,
									height: 30,
									marginRight: 8,
									backgroundColor: color,
								}}
								data-color={color}
								onClick={selectBgColor}
							></View>
						);
					})}
				</ScrollView>
			</PosterLayoutItem>
			{/* 底部按钮 */}
			<View className='shareBottom'>
				{!isPc ? (
					<AtButton
						className='share-btn'
						type='primary'
						size='small'
						circle
						onClick={handleDownload}
					>
						<Image src={saveSvg} mode='widthFix' className='icon' />
						<Text className='text'>保存</Text>
					</AtButton>
				) : null}
				<AtButton
					className='share-btn'
					type='secondary'
					size='small'
					circle
					openType='share'
				>
					<Image src={shareSvg} mode='widthFix' className='icon' />
					<Text className='text'>分享</Text>
				</AtButton>
			</View>
		</View>
	);
};

export default PostLayoutConfig;
