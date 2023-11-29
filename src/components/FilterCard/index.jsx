import { View } from '@tarojs/components';
import React, { useState } from 'react';

import './style.scss';

const FilterItem = (props) => {
	const { name, activeName, formName, setName, handleChange } = props;
	const handleClick = () => {
		setName(name);
		if (handleChange && typeof handleChange === 'function') {
			const obj = {};
			obj[formName] = name;
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

const FilterCard = (props) => {
	const { title, name, filters = [], updateParams } = props;
	const [activeName, setName] = useState(filters[0]);

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
