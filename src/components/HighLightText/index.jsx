import { Text } from '@tarojs/components';
import React, { useMemo } from 'react';

import './style.scss';

// 根据亮词对字符串进行分词
const getHilightStrArray = (str, key) => {
	if (!str) {
		return [];
	}
	return str.replace(new RegExp(`${key}`, 'g'), `%%${key}%%`).split('%%');
};

const HighLightText = ({ lightWord, text, className = '', style = {} }) => {
	const textArr = useMemo(() => {
		if (!lightWord) {
			return [text];
		}
		return getHilightStrArray(text, lightWord);
	}, [lightWord, text]);
	return (
		<Text
			userSelect
			decode
			space='ensp'
			style={style}
			className={`${className} lightText`}
		>
			{textArr.map((t, index) =>
				lightWord === t ? (
					<Text
						key={index}
						decode
						userSelect
						space='ensp'
						className={`text ${lightWord === t ? 'light' : ''}`}
					>
						{t}
					</Text>
				) : (
					t
				)
			)}
		</Text>
	);
};

export default React.memo(HighLightText);
