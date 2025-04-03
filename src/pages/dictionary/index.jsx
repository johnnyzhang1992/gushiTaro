import { View } from '@tarojs/components';
import { useLoad } from '@tarojs/taro';

import PageHeader from '../../components/PageHeader';

import './style.scss';

// 字典搜索页
const DictionaryPage = () => {
	useLoad((options) => {
		console.log('DictionaryPage loaded', options);
	});
	return (
		<View className='page dictionaryPage'>
			<PageHeader title='字典' />
			{/* 合理分类 */}
			{/* 推荐字 */}
			{/* 推荐词 */}
			{/* 推荐成语 */}
		</View>
	);
};

export default DictionaryPage;
