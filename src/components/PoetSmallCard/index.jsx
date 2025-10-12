import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';

import { getAuthkey } from '../../utils/alioss';

import './style.scss';

const PoetSmallCard = ({ id, avatar, author_name }) => {
	const [cdnAvatar, setAvatar] = useState('');

	const handleNavigate = () => {
		Taro.navigateTo({
			url: '/pages/poet/detail?id=' + id,
		});
	};

	const getCdnAvatar = async () => {
		if (avatar) {
			const authkey = await getAuthkey(avatar);
			setAvatar(avatar + '?auth_key=' + authkey);
		}
	};

	useEffect(() => {
		getCdnAvatar()
	});

	return (
		<View className='poetSmallCard' onClick={handleNavigate}>
			<View className={`cardContainer ${cdnAvatar ? '' : 'noAvatar'}`}>
				{cdnAvatar ? (
					<View className='avatar'>
						<Image
							lazyLoad
							fadeIn
							mode='aspectFill'
							showMenuByLongpress
							src={cdnAvatar}
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
