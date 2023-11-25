import { View,Navigator, Image } from '@tarojs/components';
import { AtIcon } from 'taro-ui';

import './style.scss';

import poemIcon from '../../images/icon/poem.png';
import poetIcon from '../../images/icon/poet.png';
import sentenceIcon from '../../images/icon/sentence.png';

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
			icon: poetIcon,
			path: '/pages/poet/index',
			type: 'poet',
			title: '热门名句',
		},
		{
			icon: sentenceIcon,
			path: '/pages/sentence/index',
			type: 'sentence',
			title: '历朝诗人',
		},
		{
			icon: <AtIcon value='star' size='30' color='#337ab7'></AtIcon>,
			path: '/pages/me/collect/index',
			type: 'collect',
			title: '我的收藏',
			iconType: 'icon',
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
