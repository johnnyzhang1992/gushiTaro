import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './styles.scss';

const TypeCard = (props) => {
	const { code = '', name = '', profile = '', sentence = '', type } = props;
	const handleNavigate = () => {
		console.log(code, type, props);
		const path =
			type && type === 'book' ? '/pages/book?' : '/pages/poem/index?';
		Taro.navigateTo({
			url: `${path}code=${code}&name=${name}&profile=${
				sentence || profile
			}&keyWord=${name}&from=home`,
		});
	};
	return (
		<View className='cardItem' onClick={handleNavigate}>
			<View className='name'>{name}</View>
			<View className='profile'>{profile}</View>
		</View>
	);
};

export default TypeCard;
