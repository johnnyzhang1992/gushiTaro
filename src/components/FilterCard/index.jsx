import { View, ScrollView } from '@tarojs/components';
import React, { useState, useEffect } from 'react';

import './style.scss';

const FilterItem = (props) => {
	const { name, label, activeName, formName, setName, handleChange } = props;
	const handleClick = () => {
		setName(name);
		if (handleChange && typeof handleChange === 'function') {
			const obj = {};
			obj[formName] = name;
			obj['pre_' + formName] = activeName;
			handleChange(obj);
		}
	};
	return (
		<View
			className={`filterItem ${activeName === name ? 'active' : ''}`}
			onClick={handleClick}
		>
			{label || name}
		</View>
	);
};

const FilterCard = ({ title, name, filters = [], updateParams, initValue }) => {
	// 选中项：初始默认值或者数组第一项
	const [activeName, setName] = useState(initValue || filters[0]);
	// 默认值会发生变化，若变化则设置新的初始值（activeName 初始赋值只有第一次有效）
	useEffect(() => {
		setName(initValue || filters[0]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initValue]);
	return (
		<View className='filterCard'>
			<ScrollView className='filterList' scrollX showScrollbar={false}>
				{filters.map((filter) => (
					<FilterItem
						key={filter}
						activeName={activeName}
						formName={name}
						name={filter}
						label={title && filter === '全部' ? `${title}：全部` : filter}
						setName={setName}
						handleChange={updateParams}
					/>
				))}
			</ScrollView>
		</View>
	);
};

export default React.memo(FilterCard);
