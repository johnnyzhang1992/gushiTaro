import { View } from '@tarojs/components';
import React, { useState, useEffect } from 'react';

import './style.scss';

const FilterItem = (props) => {
	const { name, activeName, formName, setName, handleChange } = props;
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
			{props.name}
		</View>
	);
};

const FilterCard = ({ title, name, filters = [], updateParams, initValue }) => {
	// 选中项：初始默认值或者数组第一项
	const [activeName, setName] = useState(initValue || filters[0]);
	console.log('activeName', title, name, initValue, activeName);
	// 默认值会发生变化，若变化则设置新的初始值（activeName 初始赋值只有第一次有效
	useEffect(() => {
		setName(initValue);
	}, [initValue]);
	return (
		<View className='filterCard'>
			{title ? <View className='title'>{title}</View> : null}
			<View className='filterList'>
				{filters.map((filter) => (
					<FilterItem
						key={filter}
						activeName={activeName}
						formName={name}
						name={filter}
						setName={setName}
						handleChange={updateParams}
					/>
				))}
			</View>
		</View>
	);
};

export default React.memo(FilterCard);
