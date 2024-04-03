import { View,Navigator, Image } from '@tarojs/components';
// import { AtIcon } from 'taro-ui';

import './style.scss';

import poemIcon from '../../images/icon/poem.png';
import poetIcon from '../../images/svg/poet.svg';
import collectIcon from '../../images/svg/collect_active.svg';
import sentenceIcon from '../../images/svg/sentence.svg';


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

const HomeNavs = () => {
	const homeNavs = [
		{
			icon: poemIcon,
			path: '/pages/poem/index',
			type: 'poem',
			title: '诗词文言',
		},
		{
			icon: sentenceIcon,
			path: '/pages/sentence/index',
			type: 'poet',
			title: '热门名句',
		},
		{
			icon: poetIcon,
			path: '/pages/poet/index',
			type: 'sentence',
			title: '历朝诗人',
		},
		{
			icon: collectIcon,
			path: '/pages/me/collect?type=poem',
			type: 'collect',
			title: '我的收藏',
		},
	];
	return (
		<View className='homeNavs'>
			{homeNavs.map((nav) => (
				<NavItem {...nav} key={nav.type} />
			))}
		</View>
	);
};

export default HomeNavs;
