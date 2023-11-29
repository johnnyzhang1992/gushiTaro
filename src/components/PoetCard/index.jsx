import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './style.scss';

const PoetCard = (props) => {
	const handleNavigate = () => {
		Taro.navigateTo({
			url: '/pages/poet/detail?id=' + props.id,
		});
	};
	return (
		<View className='poetCard' key={props.id} onClick={handleNavigate}>
			<View className='avatar'>
				<Image
					lazyLoad
					fadeIn
					showMenuByLongpress
					src={props.avatar}
					className='img'
				/>
			</View>
			<View className='content'>
				<View className='author'>
					<Text className='name'>{props.author_name}</Text>
					<Text className='dynasty'>「{props.dynasty}」</Text>
				</View>
				<View className='profile'>
					<Text className='text'>{props.profile}</Text>
				</View>
			</View>
		</View>
	);
};

export default PoetCard;
