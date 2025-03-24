import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './style.scss';

const PoetSmallCard = ({ id, avatar, author_name }) => {
	const handleNavigate = () => {
		Taro.navigateTo({
			url: '/pages/poet/detail?id=' + id,
		});
	};
	return (
		<View className='poetSmallCard' onClick={handleNavigate}>
			<View className={`cardContainer ${avatar ? '' : 'noAvatar'}`}>
				{avatar ? (
					<View className='avatar'>
						<Image
							lazyLoad
							fadeIn
							mode='aspectFill'
							showMenuByLongpress
							src={avatar}
							className='img'
						/>
					</View>
				) : null}
				<View className='content'>
					<View className='author'>
						<Text className='name'>{author_name}</Text>
					</View>
				</View>
			</View>
		</View>
	);
};

export default PoetSmallCard;
