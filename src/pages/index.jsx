// import { useCallback, useEffect, useState } from "react";
import { View, Navigator, Image } from '@tarojs/components';
import { useNavigationBar } from 'taro-hooks';
import { AtIcon } from 'taro-ui';

import './index.scss';

import HomeHeader from '../components/HomeHeader';

import poemIcon from '../images/icon/poem.png';
import poetIcon from '../images/icon/poet.png';
import sentenceIcon from '../images/icon/sentence.png';
import { HomeCategories, HomeBooks } from '../const/config';

const homeNavs = [
	{
		icon: poemIcon,
		path: 'pages/poem/index',
		type: 'poem',
		title: '诗词文言',
	},
	{
		icon: poetIcon,
		path: 'pages/poet/index',
		type: 'poet',
		title: '热门名句',
	},
	{
		icon: sentenceIcon,
		path: 'pages/sentence/index',
		type: 'sentence',
		title: '历朝诗人',
	},
	{
		icon: <AtIcon value='star' size='30' color='#337ab7'></AtIcon>,
		path: 'pages/me/collect/index',
		type: 'collect',
		title: '我的收藏',
		iconType: 'icon',
	},
];
const NavItem = (props) => {
	const { icon, path, type, title, iconType } = props;
	return (
		<Navigator url={path} className='navItem' hoverClass='navigator-hover'>
			{iconType === 'icon' ? (
				<View className='iconContainer'>{icon}</View>
			) : (
				<Image src={icon} alt={type} className='navIcon' />
			)}
			<View className='navText'>{title}</View>
		</Navigator>
	);
};

const CardItem = (props) => {
	const { code, name, profile, type } = props;
	const handleNavigate = () => {
		console.log(code, type);
	};
	return (
		<View className='cardItem' onClick={handleNavigate}>
			<View className='name'>{name}</View>
			<View className='profile'>{profile}</View>
		</View>
	);
};
const Index = () => {
	const { setTitle } = useNavigationBar({ title: '首页 | 古诗文小助手' });
	setTitle('首页 | 古诗文小助手');

	return (
		<View className='wrapper'>
			{/* 顶部 - 每日一诗词 */}
			<HomeHeader />
			{/* 导航 */}
			<View className='homeNavs'>
				{homeNavs.map((nav) => (
					<NavItem {...nav} key={nav.type} />
				))}
			</View>
			<View className='divide' />
			{/* 课本 */}
			<View className='sectionCard'>
				<View className='cardTitle'>课本</View>
				<View className='cardContent'>
					{HomeCategories.map((item) => (
						<CardItem type='category' key={item.code} {...item} />
					))}
				</View>
			</View>
			<View className='divide' />
			{/* 选集 */}
			<View className='sectionCard'>
				<View className='cardTitle'>选集</View>
				<View className='cardContent'>
					{HomeBooks.map((item) => (
						<CardItem type='book' key={item.code} {...item} />
					))}
				</View>
			</View>
		</View>
	);
};

export default Index;
