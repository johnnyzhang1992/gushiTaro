import { View, Image, Navigator } from '@tarojs/components';
import { useState, useEffect } from 'react';

import { getAuthkey } from '../../utils/alioss';

import './style.scss';

const AccordionList = ({ children }) => {
	return <View className='list'>{children}</View>;
};

const AccordionItem = ({ title, source, target_id }) => {
	return (
		<Navigator
			url={`/pages/poem/detail?id=${target_id}`}
			className='accordion__item'
			hoverClass='none'
		>
			<View className='item__title'>{title}</View>
			<View className='item__source'>{source}</View>
			<View className='item__line'></View>
		</Navigator>
	);
};

// 手风琴
const Accordion = ({
	defaultOpen = false,
	thumbnail,
	title,
	note,
	children,
}) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);
	const [cdnThumbnail, setCdnThumbnail] = useState('');

	const toggleOpen = () => {
		setIsOpen(!isOpen);
	};

	const getCdnThumbnail = async (url) => {
		const authkey = await getAuthkey(url);
		setCdnThumbnail(`${thumbnail}?auth_key=${authkey}`);
	};

	useEffect(() => {
		if (thumbnail) {
			getCdnThumbnail(thumbnail);
		}
	}, [thumbnail]);

	return (
		<View className='poem_accordion'>
			<View className='accordion__header'>
				{cdnThumbnail && (
					<View className='accordion__thumb'>
						<Image
							src={cdnThumbnail}
							className='thumb_image'
							mode='heightFix'
						/>
					</View>
				)}
				<View className='accordion__info'>
					<View className='info__title'>{title}</View>
					<View className='info__note'>{note}</View>
				</View>
				<View className='accordion__arrow' onClick={toggleOpen}>
					<View className='at-icon at-icon-chevron-down' />
				</View>
			</View>
			<View className={`accordion__content ${isOpen ? '' : 'inactive'}`}>
				<View className='accordion_body'>{children}</View>
			</View>
		</View>
	);
};

export { Accordion, AccordionList, AccordionItem };
