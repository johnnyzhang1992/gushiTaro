import { View, Text, Input } from '@tarojs/components';

import './style.scss';

const SearchField = ({
	value,
	placeholder,
	onInput,
	onClear,
	onConfirm,
	onFocus,
	onBlur,
	className = '',
}) => (
	<View className={`searchField ${className}`}>
		<View className='searchFieldIcon' />
		<Input
			className='searchFieldInput'
			placeholder={placeholder}
			placeholderClass='searchFieldPlaceholder'
			value={value}
			confirmType='search'
			onInput={(e) => onInput && onInput(e.detail.value)}
			onConfirm={() => onConfirm && onConfirm()}
			onFocus={() => onFocus && onFocus()}
			onBlur={() => onBlur && onBlur()}
		/>
		{value ? (
			<View className='searchFieldClear' onClick={() => onClear && onClear()}>
				<Text className='searchFieldClearIcon'>×</Text>
			</View>
		) : null}
	</View>
);

export default SearchField;
