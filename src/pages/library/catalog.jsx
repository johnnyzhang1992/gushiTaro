import { View } from '@tarojs/components';
import Taro, {
	useLoad,
	usePullDownRefresh,
	useShareTimeline,
	useShareAppMessage,
} from '@tarojs/taro';
import { useState } from 'react';

import {
	Accordion,
	AccordionList,
	AccordionItem,
} from '../../components/Accordion';

import { fetchCatalogDetail } from '../../services/global';

import './catalog.scss';

const CatalogPage = () => {
	const [pageOptions, setOptions] = useState({
		catalog_id: '',
		catalog_name: '',
	});
	const [detail, setDetail] = useState({
		catalog_name: '',
		fasc_title: '',
		fasciculeList: [],
	});

	const fetchDetail = async (_id) => {
		const res = await fetchCatalogDetail('GET', {
			catalog_id: _id || pageOptions.catalog_id,
		});
		if (res && res.data) {
			setDetail(res.data);
		}
		console.log('res', res);
	};

	useLoad((options) => {
		setOptions(options);
		console.log('options', options);
		Taro.setNavigationBarTitle({
			title: options.catalog_name || '古诗文小助手',
		});
		fetchDetail(options.catalog_id);
	});

	usePullDownRefresh(() => {
		fetchDetail(pageOptions.catalog_id);
	});

	const computeParams = () => {
		const keys = Object.keys(pageOptions);
		let queryStr = '';
		keys.forEach((k) => {
			queryStr += `${k}=${pageOptions[k]}&`;
		});
		return queryStr;
	};

	const getShareConfig = () => {
		const queryStr = computeParams();
		const { title, name } = pageOptions;
		return {
			title: title || name,
			queryStr,
		};
	};

	useShareAppMessage(() => {
		const { title, queryStr } = getShareConfig();
		return {
			title,
			path: '/pages/library/catalog?' + queryStr,
		};
	});
	useShareTimeline(() => {
		const { title, queryStr } = getShareConfig();
		return {
			title,
			path: '/pages/library/catalog?' + queryStr,
		};
	});

	const { fasciculeList = [] } = detail;
	return (
		<View className='page catalogDetail'>
			{fasciculeList.map((fasc, index) => {
				return (
					<Accordion
						key={fasc._id}
						thumbnail={fasc.thumbnail}
						title={detail.fasc_title || detail.catalog_name}
						note={fasc.fascicule_name}
						defaultOpen={index === 0}
						showHeader={fasciculeList.length > 1}
					>
						<AccordionList>
							{fasc.doc_list.map((doc) => {
								return (
									<AccordionItem
										key={doc._id}
										title={doc.title}
										source={`〔${doc.dynasty}〕${doc.author}`}
										target_id={doc.target_id}
										tag={doc.target_type || ''}
									/>
								);
							})}
						</AccordionList>
					</Accordion>
				);
			})}
		</View>
	);
};

export default CatalogPage;
