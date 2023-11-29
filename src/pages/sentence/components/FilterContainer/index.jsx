import { View } from '@tarojs/components';
import { useEffect, useState, useRef } from 'react';

import FilterCard from '../../../../components/FilterCard';

import './style.scss';

const FilterContainer = (props) => {
	const { updateParam } = props;
	const [thems, setThems] = useState(['全部']);
	const [types, setTypes] = useState(['全部']);
	const cacheRef = useRef({});

	const updateTheme = (themeObj) => {
		const theme = themeObj['theme'];
		setTypes(theme === '全部' ? [] : cacheRef.current[theme] || ['全部']);
		updateParam({
			...themeObj,
			type: '全部',
		});
	};

	useEffect(() => {
		const _themes = ['全部'];
		const cacheObj = {};
		props.categories.forEach((item) => {
			_themes.push(item.theme_name);
			cacheObj[item.theme_name] = item.types;
		});
		cacheRef.current = cacheObj;
		setThems(_themes);
	}, [props.categories]);

	return (
		<View className='filterContainer'>
			<FilterCard
				name='theme'
				title='主题'
				filters={thems}
				updateParams={updateTheme}
			/>
			{types.length > 0 ? (
				<FilterCard
					name='type'
					title='类型'
					filters={types}
					updateParams={updateParam}
				/>
			) : null}
		</View>
	);
};

export default FilterContainer;
