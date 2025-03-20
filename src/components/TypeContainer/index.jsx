import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, ScrollView } from '@tarojs/components';

import SectionCard from '../../components/SectionCard';
import TypeCard from '../../components/TypeCard';

import './style.scss';

import { HomeCategories } from '../../const/config';

const TypeContainer = () => {
	const [scrollHeight, updateHeight] = useState('auto');

	useEffect(() => {
		Taro.createSelectorQuery()
			.select('#typeScrollContainer')
			.fields(
				{
					dataset: true,
					size: true,
					scrollOffset: true,
					properties: ['scrollX', 'scrollY'],
				},
				function (res) {
					console.log(res);
					updateHeight(res.height-20 || 500);
				}
			)
			.exec();
	}, []);

	return (
		<View className='typeContainer' id='typeScrollContainer'>
			{/* 诗词列表 */}
			<ScrollView
				className='scrollContainer'
				scrollY
				enableFlex
				enhanced
				showScrollbar={false}
				enableBackToTop
				refresherEnabled={false}
				style={{
					height: scrollHeight == 'auto' ? scrollHeight : scrollHeight + 'px',
				}}
			>
				<SectionCard title='选集'>
					<View className='typeList'>
						{HomeCategories.map((item) => (
							<TypeCard key={item.code} {...item} />
						))}
					</View>
				</SectionCard>
			</ScrollView>
		</View>
	);
};

export default TypeContainer;
