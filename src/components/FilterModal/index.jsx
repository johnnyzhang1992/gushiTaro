import { View, Text, ScrollView } from '@tarojs/components';
import { AtRadio } from 'taro-ui';
import { useState, useEffect, useRef } from 'react';

import FloatLayout from '../FloatLayout';

import { fetchPoetData } from '../../pages/poet/service';

import './style.scss';

const themeList = [
	'抒情',
	'四季',
	'山水',
	'天气',
	'人物',
	'人生',
	'生活',
	'节日',
	'动物',
	'植物',
	'食物',
];

const FilterModal = (props) => {
	const { handleSelect } = props;
	const [isOpen, setOpen] = useState(false);
	const [authorList, setList] = useState([]);
	const [currentSelect, setSelect] = useState({
		author: '',
		theme: '',
	});
	const initRef = useRef(false);

	const handleAuthorChange = (value) => {
		const { author = ''} = currentSelect
		setSelect({
			...currentSelect,
			author: author == value ? '' : value,
		});
	};

	const handleThemeSelect = (value) => {
		const { theme = '' } = currentSelect;
		setSelect({
			...currentSelect,
			theme: theme == value ? '' : value,
		});
	};

	const handleClearSelect = () => {
		setSelect({
			author: '',
			theme: '',
		});
	};

	const showModal = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const queryAuthorList = async () => {
		const res = await fetchPoetData('GET', { size: 8 }).catch((err) => {
			console.log(err);
		});
		if (res && res.statusCode == 200) {
			const { list = [] } = res.data || {};
			const temList = list.map((item) => {
				return {
					...item,
					label: item.author_name,
					value: item.author_name,
				};
			});
			setList(temList);
		}
		initRef.current = true;
	};

	const themeOptions = themeList.map((item) => {
		return {
			label: item,
			value: item,
		};
	});

	const btnText =
		!currentSelect.author && !currentSelect.theme
			? '全部'
			: `${currentSelect.author} ${currentSelect.theme}`;

	useEffect(() => {
		queryAuthorList();
	}, []);

	useEffect(() => {
		if (initRef && handleSelect && typeof handleSelect === 'function') {
			handleSelect(currentSelect);
		}
	}, [currentSelect, handleSelect]);

	return (
		<View className='filter-modal'>
			{/* 按钮 */}
			<View className='filter-btn' onClick={showModal}>
				<View className='at-icon at-icon-filter'></View>
				<Text className='filter-btn__text'>{btnText}</Text>
			</View>
			{/* 弹窗 */}
			<FloatLayout title='选择摘录范围' isOpen={isOpen} close={handleClose}>
				<ScrollView scrollY className='filter-layout-container'>
					{/* 全部 */}
					<View className='filter-card'>
						{/* <View className='filter-card__title'>全部</View> */}
						<AtRadio
							className='filter-radio'
							options={[{ label: '全部', value: 'all' }]}
							value={currentSelect.theme || currentSelect.author ? '' : 'all'}
							onClick={handleClearSelect}
						/>
					</View>
					{/* 作者 */}
					<View className='filter-card'>
						<View className='filter-card__title'>作者</View>
						<AtRadio
							className='filter-radio'
							options={authorList}
							value={currentSelect.author}
							onClick={handleAuthorChange}
						/>
					</View>
					{/* 主题 */}
					<View className='filter-card'>
						<View className='filter-card__title'>主题</View>
						<AtRadio
							className='filter-radio'
							options={themeOptions}
							value={currentSelect.theme}
							onClick={handleThemeSelect}
						/>
					</View>
				</ScrollView>
			</FloatLayout>
		</View>
	);
};

export default FilterModal;
