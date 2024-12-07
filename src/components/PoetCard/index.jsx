import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './style.scss';

const PoetCard = ({
	id,
	avatar,
	author_name,
	dynasty,
	profile,
	showAvatar = true,
	hideBorder = false,
}) => {
	const handleNavigate = () => {
		Taro.navigateTo({
			url: '/pages/poet/detail?id=' + id,
		});
	};
	return (
		<View
			className={`poetCard ${hideBorder ? 'hideBorder' : ''} ${
				showAvatar ? '' : 'hideAvatar'
			}`}
			key={id}
			onClick={handleNavigate}
		>
			{showAvatar && avatar ? (
				<View className='avatar'>
					<Image
						lazyLoad
						fadeIn
						showMenuByLongpress
						src={avatar}
						className='img'
					/>
				</View>
			) : null}
			<View className='content'>
				<View className='author'>
					<Text className='name'>{author_name}</Text>
					{dynasty ? (
						<Text className='dynasty'>「{dynasty}」</Text>
					) : null}
				</View>
				<View className='profile'>
					<Text className='text'>{profile}</Text>
				</View>
			</View>
		</View>
	);
};

export default PoetCard;
