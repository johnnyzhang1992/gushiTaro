import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import { AtTag } from 'taro-ui';

import './style.scss';

const TagItem = (props) => {
	const handleClick = () => {
		Taro.navigateTo({
			url: '/pages/poem/index?type=tag&keywords=' + props.tag,
		});
	};

	return (
		<View className='tagItem'>
			<AtTag size='small' onClick={handleClick}>
				{props.tag}
			</AtTag>
		</View>
	);
};

const TagsCard = (props) => {
	const { tags = [] } = props;
	return (
		<View className='tagCard'>
			{tags.map((tag) => (
				<TagItem key={tag} tag={tag} />
			))}
		</View>
	);
};

export default TagsCard;
