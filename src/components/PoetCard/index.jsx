import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';

import { getAuthkey } from '../../utils/alioss';

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
		getCdnAvatar();
	});

	return (
		<View
			className={`poetCard ${hideBorder ? 'hideBorder' : ''} ${
				showAvatar ? '' : 'hideAvatar'
			}`}
			key={id}
			onClick={handleNavigate}
		>
			{showAvatar && cdnAvatar ? (
				<View className='avatar'>
					<Image
						lazyLoad
						fadeIn
						showMenuByLongpress
						src={cdnAvatar}
						className='img'
					/>
				</View>
			) : null}
			<View className='content'>
				<View className='author'>
					<Text className='name'>{author_name}</Text>
					{dynasty ? <Text className='dynasty'>「{dynasty}」</Text> : null}
				</View>
				<View className='profile'>
					<Text className='text'>{profile}</Text>
				</View>
			</View>
		</View>
	);
};

export default PoetCard;
