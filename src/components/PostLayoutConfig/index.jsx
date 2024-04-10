import { View, Text, Image, ScrollView } from '@tarojs/components';
import { AtButton } from 'taro-ui';
import { useEffect, useState } from 'react';

import PoemPostLayout from '../Skeleton/PoemPostLayout';

import Qrcode from '../../images/icon/qrcode.png';
import shareSvg from '../../images/svg/share.svg';
import saveSvg from '../../images/svg/save.svg';
import { postBgImages } from '../../const/config';

import './style.scss';

// 边框颜色配置
const letterLayoutConfig = [
	{
		name: 'default',
		color: '#333',
	},
	{
		name: 'center',
		color: '#333',
	},
	{
		name: 'blackBorder',
		color: '#212321',
	},
	{
		name: 'redBorder',
		color: '#c01112',
	},
];

// 字体颜色
const fontColorArr = ['#fff', '#333'];

// 模式
const ratioConfig = [
	{
		name: '默认',
		value: 1,
	},
	{
		name: '小红书',
		value: 0.75,
	},
	{
		name: '手机壁纸',
		value: 0.4615,
	},
];

const PostLayoutConfig = ({
	update,
	handleDownload,
	safeArea,
	isPc = false,
}) => {
	const [postConfig, updateConfig] = useState({
		type: 'default', // default center letter horiv
		showQrcode: true,
		letterBorder: 'default', // redBorder blankBorder
		bgColor: '#fff',
		bgImg: postBgImages[0], // 背景图
		fontColor: '#333',
		ratio: 1, // 显示比例 0.75 0.46
	});

	const handleToggleBottom = () => {
		updateConfig({
			...postConfig,
			showQrcode: !postConfig.showQrcode,
		});
	};

	const updateLayout = ({ type, letterBorder }) => {
		updateConfig({
			...postConfig,
			type: type,
			letterBorder: letterBorder || '',
		});
	};

	const selectFontColor = (e) => {
		const { fontColor } = e.currentTarget.dataset;
		updateConfig({
			...postConfig,
			fontColor: fontColor || '#333',
		});
	};

	const selectBgImg = (e) => {
		const { img } = e.currentTarget.dataset;
		updateConfig({
			...postConfig,
			bgImg: img,
		});
	};

	const selecrRatio = (e) => {
		const { ratio } = e.currentTarget.dataset;
		updateConfig({
			...postConfig,
			ratio: ratio || 0.75,
		});
	};

	useEffect(() => {
		if (update && typeof update === 'function') {
			update(postConfig);
		}
	}, [postConfig, update]);

	return (
		<View className='post-layout-config'>
			{/* 布局 */}
			<View className='shareLayout'>
				<View className='title'>
					<Text className='text'>布局</Text>
				</View>
				<View className='layout-bottom'>
					<View className='scrollContainer'>
						{letterLayoutConfig.map((layout) => {
							return (
								<PoemPostLayout
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
									activeType={postConfig.letterBorder}
								/>
							);
						})}
					</View>
					<View
						className={`qrcode-container  ${
							postConfig.showQrcode ? 'active' : ''
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
				</View>
			</View>
			{/* 模式，小红书和壁纸 */}
			<View className='shareLayout'>
				<View className='title'>
					<Text className='text'>展示模式</Text>
				</View>
				<View className='scrollContainer ratio-list'>
					{ratioConfig.map((ratio) => {
						return (
							<View
								key={ratio.value}
								data-ratio={ratio.value}
								onClick={selecrRatio}
								className={`ratio-item ${
									postConfig.ratio == ratio.value ? 'active' : ''
								}`}
							>
								{ratio.name}
							</View>
						);
					})}
				</View>
			</View>
			{/* 字体颜色 */}
			<View className='shareLayout'>
				<View className='title'>
					<Text className='text'>字体颜色</Text>
				</View>
				<View className='layout-bottom'>
					<View
						className='scrollContainer'
						style={{
							width: '100%',
						}}
					>
						{fontColorArr.map((color) => {
							return (
								<View
									key={color}
									className={`color-item bgColor ${
										postConfig.fontColor === color ? 'active' : ''
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
					</View>
				</View>
			</View>
			{/* 背景图 */}
			<View className='shareLayout'>
				<View className='title'>
					<Text className='text'>背景色</Text>
				</View>
				<View className='layout-bottom'>
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
						{postBgImages.map((img) => {
							return (
								<View
									key={img}
									className={`color-item bgImg ${
										postConfig.bgImg === img ? 'active' : ''
									}`}
									style={{
										width: 30,
										height: 30,
										marginRight: 8,
									}}
									data-img={img}
									onClick={selectBgImg}
								>
									<Image
										src={img}
										mode='widthFix'
										className='bg-img'
										style={{
											width: 30,
											height: 30,
										}}
									/>
								</View>
							);
						})}
					</ScrollView>
				</View>
			</View>
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
