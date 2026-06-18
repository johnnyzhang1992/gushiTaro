import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import { Tag } from '@nutui/nutui-react-taro';

import './style.scss';

const TagItem = ({ tag }) => {
	const handleClick = () => {
		Taro.navigateTo({
			url: '/pages/poem/index?type=tag&from=tag&keyWord=' + tag,
		});
	};

	return (
		<View className='tagItem'>
			<Tag onClick={handleClick}>{tag}</Tag>
		</View>
	);
};

const TagsCard = ({ tags = [] }) => {
	return (
		<View className='tagCard'>
			{tags.map((tag, index) => (
				<TagItem key={index} tag={tag} />
			))}
		</View>
	);
};

export default TagsCard;
