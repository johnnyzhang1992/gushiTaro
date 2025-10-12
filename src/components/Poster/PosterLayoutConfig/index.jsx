import { View, Text, Image, ScrollView } from '@tarojs/components';
import { AtButton } from 'taro-ui';
import { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';

import PoemPosterLayout from '../PoemPosterLayout';

import Qrcode from '../../../images/icon/qrcode.png';
import shareSvg from '../../../images/svg/share.svg';
import saveSvg from '../../../images/svg/save.svg';

import {
	letterLayoutConfig,
	fontColorArr,
	ratioConfig,
	initConfig,
	postBgImages,
} from '../../../const/posterConfig';
import { colors } from '../../../const/color';
import { getAuthkey } from '../../../utils/alioss';

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
	const [secondaryBgColorArr, updateSecondarArr] = useState([]);
	const [colorName, updateColorName] = useState('');
	const [postBgImgs, setPostBgImgs] = useState(() => {
		return postBgImages.map((img) => {
			return {
				img,
				cdn_img: img,
				auth_key: '',
			};
		});
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
		const { bgImg } = posterConfig;
		updateConfig({
			...posterConfig,
			bgImg: bgImg == img ? '' : img,
		});
	};

	const selectBgColor = (e) => {
		const { color, name } = e.currentTarget.dataset;
		const findSecondary = colors.find((c) => {
			return c.hex === color;
		});
		updateColorName(name || '');
		if (findSecondary) {
			updateSecondarArr(findSecondary.colors || []);
		}
		updateConfig({
			...posterConfig,
			bgColor: color,
		});
	};

	const updateImgs = async () => {
		const newList = [];
		for (let i = 0; i < postBgImgs.length; i++) {
			const auth_key = await getAuthkey(postBgImgs[i].img);
			newList.push({
				...postBgImgs[i],
				cdn_img: postBgImgs[i].cdn_img + '?auth_key=' + auth_key,
				auth_key,
			});
		}
		setPostBgImgs(newList);
	};

	const selecrRatio = (e) => {
		const { ratio } = e.currentTarget.dataset;
		updateConfig({
			...posterConfig,
			ratio: ratio || 0.75,
		});
	};

	useEffect(() => {
		const cacheConfig = Taro.getStorageSync('posterConfig') || {};
		updateConfig({
			...posterConfig,
			...cacheConfig,
		});
		updateImgs();
	}, []);

	useEffect(() => {
		if (update && typeof update === 'function') {
			update(posterConfig);
		}
		Taro.setStorageSync('posterConfig', posterConfig);
	}, [posterConfig, update]);

	return (
		<View className={`poster-layout-config ${!isTab ? 'safeBottom' : ''}`}>
			{/* 布局 */}
			<PosterLayoutItem title='布局' isInline key='layout'>
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
			<PosterLayoutItem
				title='展示模式'
				containerClass='ratio-list'
				key='ratio'
			>
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
				key='fontColor'
			>
				{fontColorArr.map((color) => {
					return (
						<View
							key={color}
							className={`color-item fontBgColor ${
								posterConfig.fontColor === color ? 'active' : ''
							}`}
							style={{
								backgroundColor: color,
								marginRight: 10,
							}}
							data-fontColor={color || ''}
							onClick={selectFontColor}
						/>
					);
				})}
			</PosterLayoutItem>
			{/* 底纹图 */}
			<PosterLayoutItem title='底纹' key='bgImg'>
				{(postBgImgs || []).map((bg) => {
					return (
						<View
							className={`bgImg ${
								posterConfig.bgImg === bg.img ? 'active' : ''
							}`}
							key={bg.img}
							data-img={bg.img}
							onClick={selectBgImg}
							style={{
								backgroundImage: `url(${bg.cdn_img})`,
								width: 90,
								height: 30,
							}}
						/>
					);
				})}
			</PosterLayoutItem>
			{/* 背景色 */}
			<PosterLayoutItem
				title={`背景色(中国传统颜色  ${colorName})`}
				containerClass='bgColorList'
				key='bgColor'
			>
				<>
					<ScrollView
						scrollX
						enableFlex
						enhanced
						showScrollbar={false}
						className='scrollContainer bgImgList'
						style={{
							height: isPc ? 66 : 44,
							width: safeArea.width - 30,
						}}
					>
						{colors.map((color) => {
							return (
								<View
									key={color.id}
									className={`color-item bgColor  ${color.hex.replace(
										'#',
										''
									)} ${posterConfig.bgColor === color.hex ? 'active' : ''}`}
									data-color={color.hex}
									data-name={color.name}
									onClick={selectBgColor}
								>
									<View
										className='color-circle'
										style={{
											backgroundColor: color.hex,
										}}
									></View>
									<Text className='text'>{color.name}</Text>
								</View>
							);
						})}
					</ScrollView>
					{secondaryBgColorArr.length > 0 ? (
						<ScrollView
							scrollX
							enableFlex
							enhanced
							showScrollbar={false}
							className='scrollContainer bgImgList'
							style={{
								height: isPc ? 66 : 44,
								width: safeArea.width - 30,
							}}
						>
							{secondaryBgColorArr.map((color) => {
								return (
									<View
										key={color.id}
										className={`color-item bgColor ${
											posterConfig.bgColor === color.hex ? 'active' : ''
										}`}
										data-color={color.hex}
										data-name={color.name}
										onClick={selectBgColor}
									>
										<View
											className='color-circle'
											style={{
												backgroundColor: color.hex,
											}}
										></View>
										<Text className='text'>{color.name}</Text>
									</View>
								);
							})}
						</ScrollView>
					) : null}
				</>
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
