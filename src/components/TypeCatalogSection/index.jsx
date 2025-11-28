import { useState, useEffect, useCallback } from 'react';
import Taro from '@tarojs/taro';

import { View } from '@tarojs/components';

import { fetchCatalogList } from '../../services/global';

import SectionCard from '../SectionCard';
import TypeCard from '../TypeCard';

import './styles.scss';

const TypeCatalogSection = (props) => {
	const { tag = '' } = props;
	const [list, setList] = useState([]);

	const getList = useCallback(async () => {
		const cacheId = `catalog_${tag}`;
		const cache = Taro.getStorageSync(cacheId);
		if (cache) {
			setList(cache || []);
		}
		const res = await fetchCatalogList('GET', {
			tag,
			page: 1,
			size: 12,
		}).catch((err) => {
			console.log('err', err);
			Taro.showToast({
				title: '获取分类列表失败',
				icon: 'none',
			});
		});
		if (res && !res.code) {
			if (res.data && res.data.list) {
				Taro.setStorageSync(cacheId, res.data.list);
				setList(res.data.list);
			}
		}
	}, [tag]);

	useEffect(() => {
		getList();
	}, [getList]);

	return (
		<SectionCard title={tag}>
			<View className='typeList catalog'>
				{list.slice(0, 8).map((item) => (
					<TypeCard
						{...item}
						key={item._id}
						type='catalog'
						catalog_id={item._id}
						name={item.catalog_name}
					/>
				))}
			</View>
		</SectionCard>
	);
};

export default TypeCatalogSection;
