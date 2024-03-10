import { View, Text } from '@tarojs/components';
// import { useNavigationBar } from 'taro-hooks';
// import { useState } from 'react';
import { useLoad } from '@tarojs/taro';

import './style.scss';

const PostPage = () => {
	// const { setTitle } = useNavigationBar({ title: '古诗文小助手' });
	// const [text, setText] = useState({
	// 	article: [],
	// 	title: '',
	// });

	useLoad((options) => {
		console.log(options);
	});
	return (
		<View className='page'>
			<Text>文库</Text>
		</View>
	);
};

export default PostPage;
