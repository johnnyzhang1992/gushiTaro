import { View, Text, Button } from '@tarojs/components';
import { useState, useRef, useEffect } from 'react';

import SectionCard from '../../../../components/SectionCard';
// <View className='at-icon at-icon-settings'></View>

import { getHistoryKeys, removeKey, clearAll } from '../../historyUtil';

import './style.scss';

const pageSize = 10;
const SearchRecord = ({ handleSearch }) => {
	// 默认显示五条
	const [keys, updateKeys] = useState([]);
	const allKeys = useRef(getHistoryKeys());

	const handleClearAll = () => {
		updateKeys([]);
		clearAll();
	};

	const handleSeeMore = () => {
		const lg = keys.length;
		updateKeys(keys.concat(allKeys.current.slice(lg, lg + pageSize)));
	};
	const handleClick = (key) => {
		if (handleSearch && typeof handleSearch === 'function') {
			handleSearch(key);
		}
	};

	const RecordItem = ({ text }) => {
		const handleRemove = (e) => {
			e.stopPropagation();
			removeKey(text);
			allKeys.current = getHistoryKeys();
			updateKeys(
				keys.filter((k) => {
					return k !== text;
				})
			);
		};
		const handleItemClick = () => {
			handleClick(text);
		};
		return (
			<View className='recordItem' onClick={handleItemClick}>
				<View className='text'>{text}</View>
				<View
					className='close at-icon at-icon-close'
					onClick={handleRemove}
				></View>
			</View>
		);
	};

	useEffect(() => {
		const localKeys = getHistoryKeys();
		updateKeys(localKeys.slice(0, pageSize));
	}, []);

	return keys.length > 0 ? (
		<SectionCard
			title='搜索记录'
			className='searchRecordSection'
			style={{
				backgroundColor: 'unset',
				margin: '0 20rpx 0 20rpx',
				borderRadius: '12rpx',
			}}
			extra={
				<Text className='clearAll' onClick={handleClearAll}>
					清空
				</Text>
			}
		>
			<View className='recordContainer'>
				{keys.map((key) => (
					<RecordItem key={key} text={key} />
				))}
			</View>
			{keys.length < allKeys.current.length ? (
				<View className='more'>
					<Button
						type='default'
						size='mini'
						plain
						onClick={handleSeeMore}
						className='moreBtn'
					>
						查看更多
					</Button>
				</View>
			) : null}
		</SectionCard>
	) : null;
};

export default SearchRecord;
