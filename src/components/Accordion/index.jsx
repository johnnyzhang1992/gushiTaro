import { View, Navigator, Text } from '@tarojs/components';
import { useState } from 'react';

import CdnImage from '../CdnImage';

import './style.scss';

const AccordionList = ({ children }) => {
	return <View className='list'>{children}</View>;
};

const AccordionItem = ({ title, source, target_id, tag = '' }) => {
	return (
		<Navigator
			url={`/pages/poem/detail?id=${target_id}`}
			className='accordion__item'
			hoverClass='none'
		>
			<View className='item__title'>
				<Text>{title}</Text>
				{tag && <Text className='tag'>{tag}</Text>}
			</View>
			<View className='item__source'>{source}</View>
			<View className='item__line'></View>
		</Navigator>
	);
};

// 手风琴
const Accordion = ({
	defaultOpen = false,
	showHeader = true,
	thumbnail,
	title,
	note,
	children,
}) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	const toggleOpen = () => {
		setIsOpen(!isOpen);
	};

	return (
		<View className='poem_accordion'>
			{showHeader && (
				<View className='accordion__header' onClick={toggleOpen}>
					{thumbnail && (
						<View className='accordion__thumb'>
							<CdnImage
								src={thumbnail}
								className='thumb_image'
								mode='heightFix'
							/>
						</View>
					)}
					<View className='accordion__info'>
						<View className='info__title'>{title}</View>
						<View className='info__note'>{note}</View>
					</View>
					<View className='accordion__arrow'>
						<View className='at-icon at-icon-chevron-down' />
					</View>
				</View>
			)}
			<View className={`accordion__content ${isOpen ? '' : 'inactive'}`}>
				<View className='accordion_body'>{children}</View>
			</View>
		</View>
	);
};

export { Accordion, AccordionList, AccordionItem };
