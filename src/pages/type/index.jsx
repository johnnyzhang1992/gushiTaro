import { View } from '@tarojs/components';
import Taro, {
	useRouter,
	useLoad,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';
import { useState } from 'react';

import { CategoriesList } from '../../const/config';

import TypeCard from '../../components/TypeCard';

import './style.scss';

const TypePage = () => {
	const [typeList, setType] = useState(null);
	const router = useRouter();
	useLoad((options) => {
		console.log(options);
		const findOne = CategoriesList.find((cat) => {
			return cat.title == options.title;
		});
		Taro.setNavigationBarTitle({
			title: options.title || '分类',
		});

		if (findOne) {
			setType(findOne);
		}
	});

	useShareAppMessage(() => ({
		title: typeList?.title || '诗词分类',
		path: `/pages/type/index?title=${encodeURIComponent(router.params.title || '')}`,
	}));

	useShareTimeline(() => ({
		title: typeList?.title || '诗词分类',
		path: `/pages/type/index?title=${encodeURIComponent(router.params.title || '')}`,
	}));

	return (
		<View className='page typePage'>
			{typeList && typeList.list ? (
				<View className='pageContainer'>
					<View className='typeList'>
						{typeList.list.map((item) => (
							<TypeCard
								key={item.name}
								type={typeList.type || (typeList.tag && 'tag')}
								{...item}
							/>
						))}
					</View>
				</View>
			) : (
				<View className='empty'>暂无内容</View>
			)}
		</View>
	);
};

export default TypePage;
