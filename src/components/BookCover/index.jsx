import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './style.scss';

// 书籍封面
const BookCover = ({ code, name, profile, type = '' }) => {
	const handleNavigate = () => {
		const path = type === 'book' ? '/pages/book?' : '/pages/poem/index?';
		Taro.navigateTo({
			url: `${path}code=${code}&name=${name}&profile=${profile}&from=home`,
		});
	};
	return (
		<View className='book-cover' onClick={handleNavigate}>
			<View className='cover-container'>
				<View className='book-name'>
					<View className='name-container'>
						<Text className='text name'>{name}</Text>
						<Text className='text desc'>{profile}</Text>
					</View>
				</View>
				<View className='book-slider'>
					<View className='top'></View>
					<View className='middle_t'></View>
					<View className='middle_b'></View>
					<View className='bottom'></View>
				</View>
			</View>
		</View>
	);
};

export default BookCover;
