import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './style.scss';

const PoetCard = ({ id, avatar, author_name, dynasty, profile }) => {
	const handleNavigate = () => {
		Taro.navigateTo({
			url: '/pages/poet/detail?id=' + id,
		});
	};
	return (
		<View className='poetCard' key={id} onClick={handleNavigate}>
			<View className='avatar'>
				<Image
					lazyLoad
					fadeIn
					showMenuByLongpress
					src={avatar}
					className='img'
				/>
			</View>
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
