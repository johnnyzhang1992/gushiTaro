import { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './cipai.scss';

/** 词牌名列表 */
const CiPaiArr = [
	'浣溪沙', '水调歌头', '满江红', '菩萨蛮', '鹧鸪天', '临江仙', '蝶恋花',
	'西江月', '念奴娇', '木兰花', '沁园春', '虞美人', '水龙吟', '渔家傲',
	'卜算子', '南乡子', '浪淘沙', '踏莎行', '鹊桥仙', '如梦令', '清平乐',
	'醉花阴', '玉楼春', '定风波', '忆王孙', '乌夜啼', '长相思', '生查子',
	'点绛唇', '采桑子', '谒金门', '诉衷情', '忆秦娥', '更漏子', '南歌子',
	'一斛珠', '苏幕遮', '锦缠道', '谢池春', '青玉案', '天仙子', '江城子',
	'声声慢', '兰陵王', '减字木兰花',
	'八归', '丁儿', '三台', '天香', '白萱', '东仙', '长春', '西河', '西湖',
	'西施', '寻梅', '竹枝', '合欢', '红情', '阳春', '河传', '招潮', '鸣梭',
	'孤鸾', '征招', '秋霁', '宣情', '眉妩', '垂阳', '胡州', '春游', '春晴',
	'倾杯', '消息', '离鸾', '留家', '黄金', '排歌', '情词', '琼台', '瑶花',
	'横云', '仄仄', '大有', '大酺', '九日', '入塞', '子夜', '木笡', '六丑',
	'月慢', '古记', '乐正', '乐令', '乐世', '导引', '防露', '步月', '杜宇',
	'尾犯', '侧犯', '录调', '相月', '品令', '绿意', '哨遍', '索酒', '戚氏',
	'韵令', '疏影', '赚煞', '酹月', '踏月', '簇水', '仄平', '大椿', '个侬',
	'比梅', '犯花', '胜常', '拜星', '夏州', '绿腰', '探春', '望梅', '凯歌',
	'禁烟', '解红', '暗香', '镇西', '鞮红', '露华', '平仄', '八塞', '无闷',
	'无怨', '不见', '多丽', '出塞', '花犯', '芳草', '佳色', '南浦', '秋水',
	'春弄', '调笑', '薄幸', '减兰', '梁令', '湘月', '催雪', '琴调',
	'一七令', '一寸金', '一叶叶', '一叶乐', '一叶落', '一半子', '一江风',
	'一丝风', '一过金', '一梦金', '一丛花', '一枝花', '一样花', '一点春',
	'一枝春', '一落春', '一年春', '一痕沙', '一落索', '一络索', '一捻红',
	'一萼红', '一斛球', '一剪梅', '一翦梅', '二郎神', '二色莲', '卜玉郎',
	'人月圆', '人南渡', '七娘子', '七娘仔', '八六子', '八宝妆', '八拍蛮',
	'八音谐', '九能归', '九回肠', '九张帆', '九张机', '十拍子', '十样花',
	'十爱词', '十二时', '十二红', '十二郎', '十八香', '二十时', '丁香结',
	'三字令', '三台令', '三学士', '三部乐', '三登乐', '三奠子', '三姝媚',
	'上行杯', '上升花', '上江虹', '上马娇', '上西平', '上南平', '上平西',
	'上平南', '上小楼', '上束马', '上西楼', '上林春', '上阳春', '下水船',
	'下手迟', '大江西', '大江乘', '大圣乐', '小圣乐', '小冲山', '小重山',
	'小阑干', '小桃红', '小桃花', '小庭花', '小梅花', '小镇西', '小秦王',
	'小梁州', '千秋岁', '千秋节', '千年调', '千春词', '万年秋', '万年枝',
	'万年春', '万里春', '万年斯', '山外云', '山花子', '山桃红', '山坡羊',
	'山渐青', '山鬼谣', '山亭柳', '山亭燕', '于飞乐', '于中好', '广寒枝',
	'广寒秋', '子夜歌', '川拨棹', '干荷叶', '女冠子', '天下乐', '天门谣',
	'天香引', '天净沙', '月儿高', '月下笛', '月中行', '月中桂', '月当听',
	'月当窗', '月边娇', '月宫春', '月城春', '月华清', '风入松', '风中柳',
	'风光好', '风归云', '风马儿', '风流子', '风蝶令', '风敲竹', '云雾敛',
	'云松令', '云鬓乱', '水仙子', '水云游', '水漫声', '水晶帘', '凤仙引',
	'凤池吟', '凤来朝', '凤求凰', '凤栖梧', '凤孤飞', '凤时春', '凤楼春',
	'凤楼吟',
];

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
		Taro.navigateTo({
			url: `/pages/poem/index?keyWord=${name}&_type=tag`,
		});
	};

	// 滚动到指定分组
	const scrollToGroup = (key) => {
		setActiveIndex(key);
		// 使用 dom scrollIntoView
		Taro.createSelectorQuery()
			.select(`#cipai-${key}`)
			.boundingClientRect((rect) => {
				if (rect) {
					Taro.pageScrollTo({
						scrollTop: rect.top - 100,
						duration: 300,
					});
				}
			})
			.exec();
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
					{groupKeys.map((key) => (
						<View
							key={key}
							className={`indexItem ${activeIndex === key ? 'active' : ''}`}
							onClick={() => scrollToGroup(key)}
						>
							<Text className='indexText'>{key}</Text>
						</View>
					))}
				</View>
			</ScrollView>

			{/* 按首字分组展示 */}
			<View className='groupSection'>
				{groupKeys.map((key) => (
					<View key={key} className='groupItem' id={`cipai-${key}`}>
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
