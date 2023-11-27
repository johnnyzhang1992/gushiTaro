import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './style.scss';

const PoemItem = (props) => {
	const handlePoemNavigate = () => {
		Taro.navigateTo({
			url: '/pages/poem/detail?id=' + props.poem_id,
		});
	};
	const handlePoetNavigate = () => {
		Taro.navigateTo({
			url: '/pages/poet/detail?id=' + props.author_id,
		});
	};
	return (
		<View className='poemItem' key={props.poem_id}>
			<View className='name' onClick={handlePoemNavigate}>
				<Text className='text'>{props.title}</Text>
			</View>
			<View className='author' onClick={handlePoetNavigate}>
				<Text>[{props.dynasty}]</Text>
				<Text className='text'>{props.author}</Text>
			</View>
		</View>
	);
};

const BookCard = (props) => {
	const { book, poems = [] } = props;
	return (
		<View className='bookCard'>
			<View className='title'>{book}</View>
			<View className='poems'>
				{poems.map((poem) => (
					<PoemItem key={poem.poem_id} {...poem} />
				))}
			</View>
		</View>
	);
};

export default BookCard;
