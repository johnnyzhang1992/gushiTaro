import { View, Text } from '@tarojs/components';
import { useNavigationBar } from 'taro-hooks';
import { useState } from 'react';
import { useLoad } from '@tarojs/taro';

import './style.scss';

import { about, privateRule } from './config';

const PostPage = () => {
	const { setTitle } = useNavigationBar({ title: '古诗文小助手' });
	const [text, setText] = useState({
		article: [],
		title: '',
	});

	useLoad((options) => {
		console.log(options);
		const { type = 'about' } = options;
		if (type === 'about') {
			setText(about);
			setTitle(about.title);
		}
		if (type === 'privateRule') {
			setText(privateRule);
			setTitle(privateRule.title);
		}
	});
	return (
		<View className='page postPage'>
			<View className='page__hd'>
				<Text userSelect className='text'>
					{text.title}
				</Text>
			</View>
			{text.intro ? (
				<View className='page__desc'>
					<Text className='text' userSelect decode>
						{text.intro}
					</Text>
				</View>
			) : null}
			<View className='page__bd'>
				<View className='article'>
					{text.article.map((article, index) => (
						<View className='article__section' key={index}>
							<View className='article__title'>
								<Text className='text' userSelect>
									{article.title}
								</Text>
							</View>
							{article.contents.length > 0 ? (
								<View className='article__section'>
									{article.contents.map((content, indx) => (
										<View className='article__p' key={indx}>
											<Text
												className='text'
												decode
												userSelect
											>
												{content}
											</Text>
										</View>
									))}
								</View>
							) : null}
							{article.article.length > 0 ? (
								<View className='article__section'>
									{article.article.map((subArticle) => (
										<>
											<View className='article__h3'>
												<Text
													className='text'
													userSelect
												>
													{subArticle.title}
												</Text>
											</View>
											{subArticle.content.map(
												(content, indx) => (
													<View
														className='article__p'
														key={indx}
													>
														<Text
															className='text'
															decode
															userSelect
														>
															{content}
														</Text>
													</View>
												)
											)}
										</>
									))}
								</View>
							) : null}
						</View>
					))}
				</View>
			</View>
		</View>
	);
};

export default PostPage;
