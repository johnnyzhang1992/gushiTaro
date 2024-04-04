import { View } from '@tarojs/components';
import { AtButton } from 'taro-ui';
import Taro, { useLoad } from '@tarojs/taro';
import { useState } from 'react';

import { FontFaceList } from '../../../const/config';
import LoadLocalFont from '../../../utils/loadFont';

import './style.scss';

const FontSetting = () => {
	const [selectFont, updateFont] = useState('');

	const handleSelect = (name) => {
		updateFont(name);
		Taro.setStorageSync('fontName', name);
		LoadLocalFont(true, () => {
			Taro.showToast({
				icon: 'none',
				title: '字体下载完成！'
			})
		})
	};

	useLoad(() => {
		const localFont = Taro.getStorageSync('fontName');
		updateFont(localFont || '');
	});

	return (
		<View className='page FontSetting'>
			{FontFaceList.map((font) => {
				return (
					<View className='font-item' key={font.name}>
						<View className='font-info'>
							<View className='name'>{font.extra_name}</View>
							<View className='size'>{font.size}</View>
						</View>
						<View
							className='font-btn'
							style={{
								display:
									selectFont === font.extra_name
										? 'none'
										: 'inline-block',
							}}
						>
							<AtButton
								size='small'
								type='primary'
								data-name={font.extra_name}
								onClick={() => {
									handleSelect(font.extra_name);
								}}
							>
								立即使用
							</AtButton>
						</View>
					</View>
				);
			})}
		</View>
	);
};

export default FontSetting;
