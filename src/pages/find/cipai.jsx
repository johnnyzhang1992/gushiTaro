import { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';

import { CiPaiArr } from '../../const/config';

import './cipai.scss';

/** 热门推荐词牌 */
const HOT_CIPAI = [
	'浣溪沙', '水调歌头', '满江红', '菩萨蛮', '鹧鸪天',
	'临江仙', '蝶恋花', '西江月', '念奴娇', '沁园春',
	'虞美人', '渔家傲', '卜算子', '浪淘沙', '踏莎行',
	'鹊桥仙', '如梦令', '清平乐', '醉花阴', '江城子',
	'声声慢', '青玉案', '一剪梅', '长相思', '点绛唇',
	'采桑子', '诉衷情', '忆秦娥', '苏幕遮', '定风波',
	'玉楼春', '相见欢', '雨霖铃', '兰陵王', '破阵子',
	'望江南', '梅花引', '千秋岁', '风入松', '祝英台近',
	'八声甘州', '暗香', '疏影', '水龙吟', '永遇乐',
	'扬州慢', '桂枝香', '昼夜乐', '天仙子', '生查子',
];

/** 按首字分组 */
function groupByFirstChar(names) {
	const groups = {};
	for (const name of names) {
		const first = name[0];
		if (!groups[first]) groups[first] = [];
		groups[first].push(name);
	}
	const sorted = Object.keys(groups).sort((a, b) => a.localeCompare(b, 'zh'));
	const result = {};
	for (const k of sorted) {
		result[k] = groups[k].sort((a, b) => a.localeCompare(b, 'zh'));
	}
	return result;
}

const CiPaiPage = () => {
	const [searchText, setSearchText] = useState('');
	const [activeIndex, setActiveIndex] = useState('');

	const groups = useMemo(() => groupByFirstChar(CiPaiArr), []);
	const groupKeys = Object.keys(groups);

	const filtered = useMemo(() => {
		if (!searchText.trim()) return [];
		const q = searchText.trim();
		return CiPaiArr.filter((name) => name.includes(q)).slice(0, 20);
	}, [searchText]);

	const handleClick = (name) => {
		setSearchText('');
		// 按标题搜索该词牌（词作标题形如「浣溪沙·xxx」；tag 范围后端无数据）
		Taro.navigateTo({
			url: `/pages/poem/index?type=title&keyWord=${encodeURIComponent(name)}`,
		});
	};

	// 滚动到指定分组（selector 用分组序号，避免中文 id 匹配问题）
	const scrollToGroup = (idx) => {
		setActiveIndex(groupKeys[idx]);
		Taro.pageScrollTo({
			selector: `#cipai-${idx}`,
			duration: 300,
		}).catch(() => {});
	};

	return (
		<View className='page cipaiPage'>
			{/* 词牌说明 */}
			<View className='cipai-desc'>
				<Text className='desc-text'>
					词牌名是词的一种制式曲调的名称，有固定的格式与声律，决定着词的节奏与音律。词牌数目大约有八百七十多个，词的内容多数已与词牌的意义无关。
				</Text>
			</View>

			{/* 搜索框 */}
			<View className='searchBar'>
				<View className='searchInputWrap'>
					<Input
						className='searchInput'
						placeholder='搜索词牌名'
						value={searchText}
						onInput={(e) => setSearchText(e.detail.value)}
					/>
					{searchText ? (
						<View className='searchClear' onClick={() => setSearchText('')}>
							<Text className='searchClearIcon'>×</Text>
						</View>
					) : null}
				</View>
			</View>

			{/* 搜索结果 */}
			{searchText && filtered.length > 0 ? (
				<View className='searchResult'>
					<Text className='resultTitle'>搜索结果 ({filtered.length})</Text>
					<View className='resultGrid'>
						{filtered.map((name) => (
							<View key={name} className='resultItem' onClick={() => handleClick(name)}>
								<Text className='resultText'>{name}</Text>
							</View>
						))}
					</View>
				</View>
			) : null}
			{searchText && !filtered.length ? (
				<View className='searchResult'>
					<Text className='resultTitle'>未找到相关词牌</Text>
				</View>
			) : null}

			{/* 热门推荐 */}
			<View className='hotSection'>
				<Text className='sectionTitle'>🔥 热门推荐</Text>
				<View className='hotGrid'>
					{HOT_CIPAI.map((name) => (
						<View key={name} className='hotItem' onClick={() => handleClick(name)}>
							<Text className='hotText'>{name}</Text>
						</View>
					))}
				</View>
			</View>

			{/* 首字索引 */}
			<ScrollView className='indexScroll' scrollX enableFlex>
				<View className='indexList'>
					{groupKeys.map((key, idx) => (
						<View
							key={key}
							className={`indexItem ${activeIndex === key ? 'active' : ''}`}
							onClick={() => scrollToGroup(idx)}
						>
							<Text className='indexText'>{key}</Text>
						</View>
					))}
				</View>
			</ScrollView>

			{/* 按首字分组展示 */}
			<View className='groupSection'>
				{groupKeys.map((key, idx) => (
					<View key={key} className='groupItem' id={`cipai-${idx}`}>
						<View className='groupHeader'>
							<Text className='groupKey'>{key}</Text>
							<Text className='groupCount'>{groups[key].length}个</Text>
						</View>
						<View className='groupGrid'>
							{groups[key].map((name) => (
								<View key={name} className='groupGridItem' onClick={() => handleClick(name)}>
									<Text className='groupGridText'>{name}</Text>
								</View>
							))}
						</View>
					</View>
				))}
			</View>
		</View>
	);
};

export default CiPaiPage;
