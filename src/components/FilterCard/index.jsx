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
	const [activeName, setName] = useState(initValue || filters[0]);
	console.log('activeName',title, name, initValue, activeName);
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
