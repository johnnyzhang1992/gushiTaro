import { useMemo, useState } from 'react';

import { Image } from '@tarojs/components';

import { getAuthkey } from '../../utils/alioss';
import defaultAvatar from '../../images/svg/poet.svg';

// 图片地址 -> CDN 签名地址
// 仅对 CDN 域名追加 auth_key（本地静态资源/其他域名原样返回）
const buildUrl = (src) => {
	if (!src || typeof src !== 'string') return '';
	// 存量数据里有 http 地址：小程序图片仅支持 https
	const httpsSrc = src.replace(/^http:\/\//, 'https://');
	const key = getAuthkey(httpsSrc);
	return key ? `${httpsSrc}?auth_key=${key}` : httpsSrc;
};

/**
 * 带兜底的图片组件
 * - 无 src 或加载失败时显示默认头像，避免出现空白/裂图
 * - fallback 可覆盖默认兜底图（如非头像类图片）
 */
const CdnImage = ({ src, fallback = defaultAvatar, className, onError, ...resetProps }) => {
	const [loadFailed, setLoadFailed] = useState(false);

	const cdnUrl = useMemo(() => buildUrl(src), [src]);
	const useFallback = !cdnUrl || loadFailed;
	const finalSrc = useFallback ? fallback : cdnUrl;

	return (
		<Image
			className={className}
			data-cdn={cdnUrl}
			{...resetProps}
			src={finalSrc}
			onError={(e) => {
				setLoadFailed(true);
				if (typeof onError === 'function') onError(e);
			}}
		/>
	);
};

export default CdnImage;