import { useMemo } from 'react';

import { Image } from '@tarojs/components';

import { getAuthkey } from '../../utils/alioss';

const CdnImage = ({ src, ...resetProps }) => {
	const cdnUrl = useMemo(() => {
		const key = getAuthkey(src);
		return `${src}?auth_key=${key}`;
	}, [src]);

	return <Image data-cdn={cdnUrl} {...resetProps} src={cdnUrl} />;
};

export default CdnImage;
