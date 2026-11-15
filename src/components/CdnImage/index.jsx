import { useMemo } from 'react';

import { Image } from '@tarojs/components';

import { getAuthkey } from '../../utils/alioss';

const CdnImage = ({ src, ...resetProps }) => {
	const cdnUrl = useMemo(() => {
		// 存量头像曾写入 http 地址：小程序图片仅支持 https，且 getAuthkey 只认 https CDN 前缀
		const httpsSrc = typeof src === 'string' ? src.replace(/^http:\/\//, 'https://') : src;
		const key = getAuthkey(httpsSrc);
		return `${httpsSrc}?auth_key=${key}`;
	}, [src]);

	return <Image data-cdn={cdnUrl} {...resetProps} src={cdnUrl} />;
};

export default CdnImage;
