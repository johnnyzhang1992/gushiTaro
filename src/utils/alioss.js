import CryptoJS from 'crypto-js';
import { CDN_DOMAIN, OSS_URL_CHECK_KEY } from '../const/constants';

/* 哈希 */
// exports.md5   = str => CryptoJS.MD5(str).toString();
// exports.sha256 = str => CryptoJS.SHA256(str).toString();
// localAuthKey = {
// 	authkey: "",
// 	timestamp: 0,
// };

const keyMap = new Map();

/**
 * 获取签名
 * @returns
 */
export const getAuthkey = async (fileName) => {
	try {
		if (!fileName || !fileName.startsWith(CDN_DOMAIN)) {
			return '';
		}
		const file_name = decodeURI(fileName);
		const localKey = keyMap.get(file_name);
		const { authkey, timestamp } = localKey || {};
		const now = new Date().getTime() / 1000;
		const gap = now - timestamp;
		if (localKey && gap < 1800 && gap > 0) {
			return authkey;
		}
		const authkeyNew = await computeAuthkey(file_name);
		if (authkeyNew.authkey) {
			keyMap.set(file_name, authkeyNew);
		}
		return authkeyNew.authkey || '';
	} catch (error) {
		console.log(error);
	}
};

/**
 * 生成签名
 * @param {*} filename
 * @returns
 */
const computeAuthkey = async (filename) => {
	const timestamp = parseInt(new Date().getTime() / 1000);
	const rand = 0;
	const uid = 0;
	const fileName = encodeURI(filename).replace(CDN_DOMAIN, '');
	// console.log(fileName, timestamp, rand, uid);
	const md5hash = CryptoJS.MD5(
		`${fileName}-${timestamp}-${rand}-${uid}-${OSS_URL_CHECK_KEY}`
	).toString();
	// <timestamp>-rand-uid-<md5hash>}
	return {
		authkey: `${timestamp}-${rand}-${uid}-${md5hash}`,
		timestamp,
	};
};
