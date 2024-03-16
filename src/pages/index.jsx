import { View, Text, Snapshot } from '@tarojs/components';
import { AtButton } from 'taro-ui';
import Taro, {
	usePullDownRefresh,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';

import './index.scss';

const Index = () => {
	// 下载图片到本地
	const handleDownload = () => {
		console.log('点击生成图片');
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
						const randomNum = Math.floor(Math.random() * 1000000);
						const f = `${Taro.env.USER_DATA_PATH}/gushiPoemCard_${randomNum}.png`;
						const fs = Taro.getFileSystemManager();
						fs.writeFileSync(f, res1.data, 'binary');
						Taro.saveImageToPhotosAlbum({
							filePath: f,
							success() {
								Taro.showToast({
									title: '保存成功',
								});
							},
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
	// 分享
	const handleShare = () => {
		Taro.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline'],
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
							<View className='nongli'>
								<Text className='text'>甲辰年 二月初四</Text>
							</View>
							<View className='yangli'>
								<Text className='text'>2024/03/13</Text>
							</View>
						</View>
						<View className='desc'>
							<View className='yi'>
								<Text className='text'>宜 平安喜乐·出行</Text>
							</View>
							<View className='ji'>
								<Text className='text'>忌 平安喜乐·出行</Text>
							</View>
						</View>
					</View>
				</View>
			</Snapshot>
			<View className='outShare'>
				<AtButton
					type='primary'
					size='normal'
					circle
					onClick={handleDownload}
				>
					保存图片
				</AtButton>
				<AtButton
					type='secondary'
					size='normal'
					circle
					openType='share'
					onClick={handleShare}
				>
					收藏分享
				</AtButton>
			</View>
		</View>
	);
};

export default Index;
