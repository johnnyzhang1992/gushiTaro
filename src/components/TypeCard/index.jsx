import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import CdnImage from '../CdnImage';
import './styles.scss';

const TypeCard = (props) => {
	const {
		code = '',
		name = '',
		profile = '',
		sentence = '',
		type = '',
		thumbnail = '',
	} = props;
	const handleNavigate = () => {
		console.log(code, type, props);

		let path = type === 'book' ? '/pages/book?' : '/pages/library/detail?';
		let query = 'from=home';

		if (sentence) {
			query = `${query}&name=${name}&profile=${
				sentence || profile
			}&keyWord=${name}`;
			if (type) {
				query = `${query}&type=tag`;
			}
		} else {
			query = `${query}&code=${code}&name=${name}&profile=${
				sentence || profile
			}`;
		}
		if (type && type == 'catalog') {
			path = '/pages/library/catalog?';
			const { catalog_id, catalog_name } = props;
			console.log(catalog_id, catalog_name, props);
			query = `catalog_id=${catalog_id}&catalog_name=${catalog_name}`;
		}

		Taro.navigateTo({
			url: `${path}${query}`,
		});
	};
	return (
		<View
			className={`cardItem ${type === 'catalog' ? 'catalog' : ''}`}
			onClick={handleNavigate}
		>
			{type === 'catalog' && thumbnail ? (
				<>
					<CdnImage src={thumbnail} mode='heightFix' className='thumbnail' />
					<View className='name'>{name}</View>
				</>
			) : (
				<>
					<View className='name'>{name}</View>
					<View className='profile'>{profile}</View>
				</>
			)}
		</View>
	);
};

export default TypeCard;
