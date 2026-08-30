import { View, Text, ScrollView } from '@tarojs/components';
import { useState, useEffect, useRef } from 'react';
import FloatLayout from '../../components/FloatLayout';
import { fetchPoetData } from '../../pages/poet/service';

const themeList = [
	'茶', '酒', '爱情', '友情', '战争', '离别', '悼亡', '思乡',
	'孤独', '壮志', '田园', '乡村', '边塞', '羁旅', '哲理', '怀古',
	'母亲', '老师', '儿童', '爱国', '思念', '伤感', '闺怨', '励志',
	'青春', '读书', '春天', '夏天', '秋天', '冬天', '风', '花',
	'雪', '月', '山水', '写景', '咏物', '抒情', '送别', '节日',
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
		const author = currentSelect.author || '';
		setSelect({
			...currentSelect,
			author: author === value ? '' : value,
		});
	};

	const handleThemeSelect = (value) => {
		const theme = currentSelect.theme || '';
		setSelect({
			...currentSelect,
			theme: theme === value ? '' : value,
		});
	};

	const handleClearSelect = () => {
		setSelect({ author: '', theme: '' });
	};

	const queryAuthorList = async () => {
		const res = await fetchPoetData('GET', { size: 8 }).catch((err) => {
			console.log(err);
		});
		if (res && res && res.status) {
			const apiData = res.data?.data || res.data;
			const list = apiData?.list || apiData?.poets || [];
			const temList = list.map((item) => ({
				label: item.author_name,
				value: item.author_name,
			}));
			setList(temList);
		}
		initRef.current = true;
	};

	const btnText =
		!currentSelect.author && !currentSelect.theme
			? '全部'
			: `${currentSelect.author} ${currentSelect.theme}`;

	useEffect(() => {
		queryAuthorList();
	}, []);

	useEffect(() => {
		if (initRef.current && handleSelect) {
			handleSelect(currentSelect);
		}
	}, [currentSelect, handleSelect]);

	const isAll = !currentSelect.theme && !currentSelect.author;

	return (
		<View className='filter-modal'>
			<View className='filter-btn' onClick={() => setOpen(true)}>
				<Text className='filter-btn__icon'>&#x2699;</Text>
				<Text className='filter-btn__text'>{btnText}</Text>
			</View>
			<FloatLayout title='选择摘录范围' isOpen={isOpen} close={() => setOpen(false)}>
				<ScrollView scrollY className='filter-layout-container'>
					<View
						className={`filter-row ${isAll ? 'active' : ''}`}
						onClick={handleClearSelect}
					>
						<Text className='filter-row-text'>全部</Text>
					</View>
					<View className='filter-section'>
						<View className='filter-section-title'>作者</View>
						{authorList.map((item) => (
							<View
								key={item.value}
								className={`filter-row ${currentSelect.author === item.value ? 'active' : ''}`}
								onClick={() => handleAuthorChange(item.value)}
							>
								<Text className='filter-row-text'>{item.label}</Text>
							</View>
						))}
					</View>
					<View className='filter-section'>
						<View className='filter-section-title'>主题</View>
						{themeList.map((item) => (
							<View
								key={item}
								className={`filter-row ${currentSelect.theme === item ? 'active' : ''}`}
								onClick={() => handleThemeSelect(item)}
							>
								<Text className='filter-row-text'>{item}</Text>
							</View>
						))}
					</View>
				</ScrollView>
			</FloatLayout>
		</View>
	);
};

export default FilterModal;
