import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './style.scss';

const PoemItem = (props) => {
	// poem_book 列表返回的是 id/target_id，没有 poem_id/author 字段
	const poemId = props.poem_id || props.id || props.target_id;
	const handlePoemNavigate = () => {
		if (!poemId) return;
		Taro.navigateTo({
			url: '/pages/poem/detail?id=' + poemId,
		});
	};
	const handlePoetNavigate = () => {
		if (!props.author_id) return;
		Taro.navigateTo({
			url: '/pages/poet/detail?id=' + props.author_id,
		});
	};
	return (
		<View className='poemItem' key={poemId}>
			<View className='name' onClick={handlePoemNavigate}>
				<Text className='text'>{props.title}</Text>
			</View>
			{props.author || props.dynasty ? (
				<View className='author' onClick={handlePoetNavigate}>
					<Text>[{props.dynasty}]</Text>
					<Text className='text'>{props.author}</Text>
				</View>
			) : null}
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
					<PoemItem key={poem.poem_id || poem.id || poem.target_id} {...poem} />
				))}
			</View>
		</View>
	);
};

export default BookCard;
