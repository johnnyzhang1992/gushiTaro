import { View } from '@tarojs/components';
import { useEffect, useState, useRef } from 'react';

import FilterCard from '../../../../components/FilterCard';

import './style.scss';

const FilterContainer = ({
	updateParam,
	defaultTheme,
	defaultType,
	categories = [],
}) => {
	const [themes, setThemes] = useState(['全部']);
	const [types, setTypes] = useState(['全部']);
	const cacheRef = useRef({});

	const updateTheme = (themeObj) => {
		const theme = themeObj['theme'];
		const preTheme = themeObj['pre_theme'];
		setTypes(
			theme === '全部' ? ['全部'] : cacheRef.current[theme] || ['全部']
		);
		// 此处代码作用 ---
		// 默认情况下 defaultTheme、 defaultType 都是 ‘全部’
		// 当从分享链接打开且携带初始值时，theme 从‘全部’变为 ‘初始值’，此时要保留 type 的初始值
		// 通常情况下，theme 变化后，type 要设置为 ‘全部’，因为不同theme 对应的 typeArr 不同
		let type = '全部';
		if (preTheme === '全部' && preTheme != theme) {
			type = defaultType;
		}
		updateParam({
			...themeObj,
			type: type,
		});
	};

	useEffect(() => {
		const _themes = ['全部'];
		const cacheObj = {};
		categories.forEach((item) => {
			_themes.push(item.theme_name);
			cacheObj[item.theme_name] = item.types;
		});
		cacheRef.current = cacheObj;
		setThemes(_themes);
		if (defaultTheme && defaultTheme !== '全部') {
			setTypes(cacheObj[defaultTheme] || ['全部']);
		}
	}, [categories, defaultTheme]);
	return (
		<View className='filterContainer'>
			<FilterCard
				name='theme'
				title='主题'
				initValue={defaultTheme}
				filters={themes}
				updateParams={updateTheme}
			/>
			{(types || []).length > 0 ? (
				<FilterCard
					name='type'
					title='类型'
					initValue={defaultType}
					filters={types}
					updateParams={updateParam}
				/>
			) : null}
		</View>
	);
};

export default FilterContainer;
