import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './styles.scss';

const TypeCard = (props) => {
	const {
		code = '',
		name = '',
		profile = '',
		sentence = '',
		type = '',
	} = props;
	const handleNavigate = () => {
		console.log(code, type, props);

		const path = type === 'book' ? '/pages/book?' : '/pages/library/detail?';
		let query = 'from=home';
		if (sentence) {
			query = `${query}&name=${name}&profile=${
				sentence || profile
				}&keyWord=${name}`;
			if (type) {
				query = `${query}&type=tag`
			}
		} else {
			query = `${query}&code=${code}&name=${name}&profile=${
				sentence || profile
			}`;
		}
		Taro.navigateTo({
			url: `${path}${query}`,
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
