import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, ScrollView, Text, Navigator } from '@tarojs/components';

import SectionCard from '../../components/SectionCard';
import TypeCard from '../../components/TypeCard';

import './style.scss';

import { CategoriesList } from '../../const/config';

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
					updateHeight(res.height - 20 || 500);
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
				{/* 每个分类，最多展示12条，多余的展示多余 */}
				{CategoriesList.map((cat) => (
					<SectionCard
						key={cat.title}
						title={cat.title}
						extra={
							cat.list.length > 8 ? (
								<Navigator hoverClass='none' url={`/pages/type/index?title=${cat.title}`}>
									<Text>更多</Text>
									<View className='icon at-icon at-icon-chevron-right' />
								</Navigator>
							) : null
						}
					>
						<View className='typeList'>
							{cat.list.slice(0, 8).map((item) => (
								<TypeCard
									key={item.name}
									type={item.type || (cat.tag && 'tag')}
									{...item}
								/>
							))}
						</View>
					</SectionCard>
				))}
			</ScrollView>
		</View>
	);
};

export default TypeContainer;
