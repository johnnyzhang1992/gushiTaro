import { View, Text, Snapshot } from '@tarojs/components';
import Taro, {
	usePullDownRefresh,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';

import './index.scss';

const Index = () => {
	const handleShare = () => {
		console.log('点击生成图片')
		Taro.createSelectorQuery()
			.select('#poemCard')
			.node()
			.exec((res) => {
				console.log(res[0]);
				const node = res[0].node;
				node.takeSnapshot({
					type: 'arraybuffer',
					format: 'png',
					success: (res1) => {
						console.log(res1);
						const f = `${Taro.env.USER_DATA_PATH}/gushiPoemCard.png`;
						const fs = Taro.getFileSystemManager();
						fs.writeFileSync(f, res1.data, 'binary');
						Taro.showToast({
							title: '保存成功',
						});

						Taro.saveImageToPhotosAlbum({
							filePath: f,
							complete(res2) {
								console.log('saveImageToPhotosAlbum:', res2);
							},
						});
					},
					fail(res1) {
						console.log(res1);
					},
				});
			});
	};
	usePullDownRefresh(() => {
		Taro.stopPullDownRefresh();
	});
	useShareAppMessage(() => {
		return {
			title: '古诗文小助手',
			path: '/pages/index',
		};
	});
	useShareTimeline(() => {
		return {
			title: '古诗文小助手',
			path: '/pages/index',
		};
	});
	return (
		<View className='page homePage'>
			<Snapshot mode='view' className='poemShot' id='poemCard'>
				<View className='poemCard'>
					<View className='container'>
						<View className='poem-context'>
							<View className='author-container'>
								<Text className='text'>唐·李白</Text>
							</View>
							<View className='title-container'>
								<Text className='text'>赠汪伦</Text>
							</View>
							<View className='poem'>
								<View className='poem-text'>
									<Text className='text'>李白乘舟将欲行</Text>
								</View>
								<View className='poem-text'>
									<Text className='text'>忽闻岸上踏歌声</Text>
								</View>
								<View className='poem-text'>
									<Text className='text'>桃花潭水深千尺</Text>
								</View>
								<View className='poem-text'>
									<Text className='text'>不及汪伦送我情</Text>
								</View>
							</View>
						</View>
					</View>
					<View className='bottom'>
						<View className='date'>
							<View className='nongli'>甲辰年 二月初四</View>
							<View className='yangli'>2024/03/13</View>
						</View>
						<View className='desc'>
							<View className='yi'>宜平安喜乐·出行</View>
							<View className='share' onClick={handleShare}>
								<View className='at-icon at-icon-heart'></View>
								<View className='at-icon at-icon-share'></View>
							</View>
						</View>
					</View>
				</View>
			</Snapshot>
			<View className='outShare' onClick={handleShare}>分享生成图片</View>
		</View>
	);
};

export default Index;
