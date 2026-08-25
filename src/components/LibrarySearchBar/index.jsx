import { View, Text, Input, ScrollView } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';

import { getDynastyOptions } from '../../utils/dynasty';
import { fetchSentenceFilters } from '../../pages/sentence/service';

import './style.scss';

// 作品字段（参考 web 端），默认全部
const FIELD_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'title', label: '标题' },
  { value: 'author', label: '作者' },
  { value: 'poem', label: '内容' },
  { value: 'tag', label: '标签' },
];

const POEM_TYPES = ['全部', '诗', '词', '曲', '文言文'];

const LibrarySearchBar = ({ tab, onSearch }) => {
	const [keyword, setKeyword] = useState('');
	const [dynasty, setDynasty] = useState('全部');
	const [poemType, setPoemType] = useState('全部');
	const [field, setField] = useState('all');
	const [dynastyList, setDynastyList] = useState([]);
	const [sentenceThemes, setSentenceThemes] = useState([]);
	const [sentenceTypes, setSentenceTypes] = useState([]);
	const [sTheme, setSTheme] = useState('全部');
	const [sType, setSType] = useState('全部');
	const [collapsed, setCollapsed] = useState(false);

	// 拉取朝代（仅作品 tab 需要，作者 tab 左侧已有朝代筛选）
	useEffect(() => {
		if (tab === 0) {
			getDynastyOptions().then((list) => {
				if (list && list.length > 0) setDynastyList(list);
			});
		}
		// 拉取摘录筛选项（主题/类型）
		if (tab === 1) {
			fetchSentenceFilters('GET', {}).then((res) => {
				if (res && res.status && res.data) {
					setSentenceThemes(res.data.themes || []);
					setSentenceTypes(res.data.types || []);
				}
			}).catch(() => {});
		}
	}, [tab]);

	const handleSearch = () => {
		const key = keyword.trim();
		if (!key) {
			Taro.showToast({ title: '请输入搜索内容', icon: 'none' });
			return;
		}
		// 组装当前 tab 的查询参数，回调父组件在当前页查询（不跳转）
		const params = { keyWord: key };
		switch (tab) {
			case 1: // 作品
				if (dynasty !== '全部') params['dynasty'] = dynasty;
				if (poemType !== '全部') params['type'] = poemType;
				if (field !== 'all') params['field'] = field;
				break;
			case 2: // 摘录
				params['source_type'] = '古诗摘录';
				if (sTheme !== '全部') params['theme'] = sTheme;
				if (sType !== '全部') params['type'] = sType;
				break;
			case 3: // 作者（朝代由左侧栏筛选）
				break;
			case 4: // 典故
				break;
			default:
				return;
		}
		if (onSearch && typeof onSearch === 'function') {
			onSearch(params);
		}
	};

	// 清空搜索：清空输入并触发容器恢复默认列表
	const handleClear = () => {
		setKeyword('');
		if (onSearch && typeof onSearch === 'function') {
			onSearch({ keyWord: '' });
		}
	};

	const placeholder = {
		0: '搜索诗词标题、内容',
		1: '搜索名句、出处',
		2: '搜索诗人',
		4: '搜索典故',
	}[tab];

	return (
		<View className={`librarySearchArea ${collapsed ? 'collapsed' : ''}`}>
			{/* 搜索行 */}
			<View className='searchRow'>
				<View className='searchInputWrap'>
					<Input
						className='searchInput'
						placeholder={placeholder}
						placeholderClass='searchPlaceholder'
						value={keyword}
						onInput={(e) => setKeyword(e.detail.value)}
						onConfirm={handleSearch}
						confirmType='search'
					/>
					{keyword ? (
						<View className='searchClear' onClick={handleClear}>
							<Text className='searchClearIcon'>×</Text>
						</View>
					) : null}
				</View>
				<View className='searchBtn' onClick={handleSearch}>
					<Text className='searchBtnText'>搜索</Text>
				</View>
			</View>
			{/* 筛选项 */}
			{/* 朝代（作品） */}
			{tab === 0 && dynastyList.length > 0 ? (
				<ScrollView className='filterRow' scrollX showScrollbar={false}>
					{dynastyList.map((d) => (
						<Text
							key={d}
							className={`filterChip ${dynasty === d ? 'active' : ''}`}
							onClick={() => setDynasty(d)}
						>
							{d}
						</Text>
					))}
				</ScrollView>
			) : null}
			{/* 摘录：主题 + 类型筛选项 */}
			{tab === 0 ? (
				<View className='filterRows'>
					{sentenceThemes.length > 0 ? (
						<ScrollView className='filterRow' scrollX showScrollbar={false}>
							<Text
								className={`filterChip ${sTheme === '全部' ? 'active' : ''}`}
								onClick={() => setSTheme('全部')}
							>
								全部
							</Text>
							{sentenceThemes.map((t) => (
								<Text
									key={t}
									className={`filterChip ${sTheme === t ? 'active' : ''}`}
									onClick={() => setSTheme(t)}
								>
									{t}
								</Text>
							))}
						</ScrollView>
					) : null}
					{sentenceTypes.length > 0 ? (
						<ScrollView className='filterRow' scrollX showScrollbar={false}>
							<Text
								className={`filterChip ${sType === '全部' ? 'active' : ''}`}
								onClick={() => setSType('全部')}
							>
								全部
							</Text>
							{sentenceTypes.map((t) => (
								<Text
									key={t}
									className={`filterChip ${sType === t ? 'active' : ''}`}
									onClick={() => setSType(t)}
								>
									{t}
								</Text>
							))}
						</ScrollView>
					) : null}
				</View>
			) : null}
			{/* 类型 + 字段（作品），各自单独一行 */}
			{tab === 0 ? (
				<View className='filterRows'>
					<View className='filterRow static'>
						<View className='filterGroup'>
							{POEM_TYPES.map((t) => (
								<Text
									key={t}
									className={`filterChip ${poemType === t ? 'active' : ''}`}
									onClick={() => setPoemType(t)}
								>
									{t}
								</Text>
							))}
						</View>
					</View>
					<View className='filterRow static'>
						<View className='filterGroup'>
							{FIELD_OPTIONS.map((f) => (
								<Text
									key={f.value}
									className={`filterChip ${field === f.value ? 'active' : ''}`}
									onClick={() => setField(f.value)}
								>
									{f.label}
								</Text>
							))}
						</View>
					</View>
				</View>
			) : null}
			{/* 收起/展开按钮 */}
			<View className='toggleBtn' onClick={() => setCollapsed(!collapsed)}>
				<Text className='toggleText'>{collapsed ? '展开' : '收起'}</Text>
				<Text className='toggleArrow'>{collapsed ? '▼' : '▲'}</Text>
			</View>
		</View>
	);
};

export default LibrarySearchBar;