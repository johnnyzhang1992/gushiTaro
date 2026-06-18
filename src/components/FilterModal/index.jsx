import { View, Text, ScrollView } from '@tarojs/components';
import { RadioGroup, Radio } from '@nutui/nutui-react-taro';

const FilterModal = (props) => {
	const { handleSelect } = props;
	const [isOpen, setOpen] = useState(false);
	const [authorList, setList] = useState([]);
	const [currentSelect, setSelect] = useState({
		author: '',
		theme: '',
	});
	const initRef = useRef(false);

	const handleAuthorChange = (value: string) => {
		const { author = ''} = currentSelect
		setSelect({
			...currentSelect,
			author: author == value ? '' : value,
		});
	};

	const handleThemeSelect = (value: string) => {
		const { theme = '' } = currentSelect;
		setSelect({
			...currentSelect,
			theme: theme == value ? '' : value,
		});
	};

	const handleClearSelect = (value: string) => {
		setSelect({
			author: '',
			theme: '',
		});
	};

	const getAuthorList = async () => {
		const res = await fetchPoetData('GET', {});
		if (res && res.data && res.data.poets) {
			const options = res.data.poets.map((item) => {
				return {
					label: item.author_name,
					value: item.author_name,
				};
			});
			setList(options);
		}
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
				<Text className='filter-btn__icon'>⚙</Text>
				<Text className='filter-btn__text'>{btnText}</Text>
			</View>
			{/* 弹窗 */}
			<FloatLayout title='选择摘录范围' isOpen={isOpen} close={handleClose}>
				<ScrollView scrollY className='filter-layout-container'>
					{/* 全部 */}
					<View className='filter-card'>
						<RadioGroup
							value={currentSelect.theme || currentSelect.author ? '' : 'all'}
							onChange={handleClearSelect}
						>
							<Radio value='all'>全部</Radio>
						</RadioGroup>
					</View>
					{/* 作者 */}
					<View className='filter-card'>
						<View className='filter-card__title'>作者</View>
						<RadioGroup value={currentSelect.author} onChange={handleAuthorChange}>
							{authorList.map((item) => (
								<Radio key={item.value} value={item.value}>{item.label}</Radio>
							))}
						</RadioGroup>
					</View>
					{/* 主题 */}
					<View className='filter-card'>
						<View className='filter-card__title'>主题</View>
						<RadioGroup value={currentSelect.theme} onChange={handleThemeSelect}>
							{themeOptions.map((item) => (
								<Radio key={item.value} value={item.value}>{item.label}</Radio>
							))}
						</RadioGroup>
					</View>
				</ScrollView>
			</FloatLayout>
		</View>
	);
};

export default FilterModal;
