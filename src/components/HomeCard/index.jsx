import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './styles.scss';

const CardItem = (props) => {
	const { code, name, profile, type } = props;
	const handleNavigate = () => {
		console.log(code, type);
		const path =
			type && type === 'book' ? '/pages/book?' : '/pages/poem/index?';
		Taro.navigateTo({
			url: `${path}code=${code}&name=${name}&profile=${profile}&from=home`,
		});
	};
	return (
		<View className='cardItem' onClick={handleNavigate}>
			<View className='name'>{name}</View>
			<View className='profile'>{profile}</View>
		</View>
	);
};

export default CardItem;
