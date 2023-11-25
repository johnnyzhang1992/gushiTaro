import { View } from '@tarojs/components';
import './styles.scss';

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

export default CardItem;
