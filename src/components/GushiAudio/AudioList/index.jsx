import { View, Text, ScrollView } from '@tarojs/components';
import { getPoemList, poemAudioRemove, poemAudioClear } from '../util';

import './style.scss';

const AudioItem = ({ audio = {}, remove, currentPoem = {} }) => {
	const removeOne = () => {
		remove(audio);
	};
	return (
		<View
			className={`audio-item ${audio.id === currentPoem.id ? 'active' : ''}`}
		>
			<View className='poem-name'>
				<Text className='name'>{audio.title}</Text>
				<Text className='author'>-{audio.author}</Text>
			</View>
			<View className='delete svg' onClick={removeOne}>
				<Text className='svg'>x</Text>
			</View>
		</View>
	);
};

const AudioList = ({ update, currentPoem = {} }) => {
	const poemList = getPoemList();

	const handleClear = () => {
		poemAudioClear();
		update((pre) => pre + 1);
	};

	const handleRemove = (poem) => {
		poemAudioRemove(poem);
		update((pre) => pre + 1);
	};
	return (
		<View className='audio-list'>
			{/* 标题 */}
			<View className='l-title'>
				<Text className='text'>播放列表</Text>
				<Text className='text num'>({poemList.length})</Text>
				<View className='clear' onClick={handleClear}>
					<Text className='text'>清空</Text>
				</View>
			</View>
			<ScrollView scrollY enableFlex enhanced className='list-container'>
				<View className='list'>
					{poemList.map((item) => (
						<AudioItem
							key={item.id}
							audio={item}
							remove={handleRemove}
							currentPoem={currentPoem}
						/>
					))}
				</View>
			</ScrollView>
		</View>
	);
};

export default AudioList;
