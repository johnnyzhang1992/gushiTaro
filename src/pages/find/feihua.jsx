import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useState } from 'react';

import PageHeader from '../../components/PageHeader';
import { FeiHuaConfig, HotFeiHua } from '../../const/config';

import './feihua.scss';

const FeihuaPage = () => {
	const [keyword, setKeyword] = useState('');
	const [showDrop, setShowDrop] = useState(false);

	// 所有主题字（扁平化，去重）
	const allChars = [...new Set(FeiHuaConfig.flatMap((c) => c.items))];
	// 过滤匹配
	const filtered =
		keyword.trim() === ''
			? []
			: allChars.filter((c) => c.includes(keyword.trim())).slice(0, 20);

	const goDetail = (char) => {
		Taro.navigateTo({ url: `/pages/find/feihua-detail?char=${encodeURIComponent(char)}` });
	};

	return (
		<View className='page feihuaPage'>
			<PageHeader showSearch={false} showBack title='飞花令' />

			<View className='fhContainer'>
				{/* 说明 */}
				<View className='introCard'>
					<Text className='introText'>
						共 {allChars.length} 个主题字。飞花令源自韩翃《寒食》“春城无处不飞花”，选择一个字，查看含有该字的经典诗句。
					</Text>
				</View>

				{/* 搜索框 */}
				<View className='searchWrap'>
					<Input
						className='searchInput'
						placeholder='搜索主题字，如：花'
						placeholderClass='searchPlaceholder'
						value={keyword}
						onInput={(e) => {
							setKeyword(e.detail.value);
							setShowDrop(true);
						}}
						onBlur={() => setTimeout(() => setShowDrop(false), 200)}
					/>
				</View>
				{/* 搜索下拉 */}
				{showDrop && keyword.trim() !== '' ? (
					<View className='dropList'>
						{filtered.map((c) => (
							<View key={c} className='dropItem' onClick={() => goDetail(c)}>
								<Text className='dropChar'>#{c}</Text>
								<Text className='dropText'>搜含「{c}」的诗句</Text>
							</View>
						))}
						{filtered.length === 0 ? (
							<View className='dropEmpty'>
								<Text>共 0 条匹配</Text>
							</View>
						) : (
							<View className='dropHint'>
								<Text>共 {filtered.length} 条匹配结果</Text>
							</View>
						)}
					</View>
				) : null}

				{/* 热门推荐 */}
				<View className='hotSection'>
					<Text className='hotTitle'>热门推荐</Text>
					<View className='hotWrap'>
						{HotFeiHua.map((c) => (
							<View key={c} className='hotTag' onClick={() => goDetail(c)}>
								<Text className='hotChar'>{c}</Text>
							</View>
						))}
					</View>
				</View>

				<View className='divider' />

				{/* 分类锚点 */}
				<ScrollView className='catIndex' scrollX showScrollbar={false}>
					{FeiHuaConfig.map((cat) => (
						<View key={cat.name} className='catAnchor'>
							<Text className='catIcon'>{cat.icon}</Text>
							<Text className='catName'>{cat.name}</Text>
						</View>
					))}
				</ScrollView>

				{/* 分类列表 */}
				{FeiHuaConfig.map((cat) => (
					<View key={cat.name} className='catSection'>
						<View className='catHeader'>
							<Text className='catTitle'>
								{cat.icon} {cat.name} · {cat.items.length} 个字
							</Text>
						</View>
						<View className='charGrid'>
							{[...new Set(cat.items)].map((c) => (
								<View key={c} className='charCard' onClick={() => goDetail(c)}>
									<Text className='char'>{c}</Text>
								</View>
							))}
						</View>
					</View>
				))}
			</View>
		</View>
	);
};

export default FeihuaPage;