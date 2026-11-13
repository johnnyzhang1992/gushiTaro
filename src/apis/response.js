/**
 * 接口响应统一判断与解包
 *
 * apis/request.js resolve 的是后端响应体：{ status, data, errmsg }
 * - status 为 true 表示业务成功（历史接口可能只给 statusCode=200）
 * - 部分老接口存在 data.data 双层包装，统一在这里兼容
 *
 * 用法：
 *   const apiData = getApiData(res);
 *   if (isApiSuccess(res) && apiData) { ... }
 */
export const isApiSuccess = (res) => {
	if (!res) return false;
	return Boolean(res.status) || res.statusCode === 200;
};

export const getApiData = (res) => {
	if (!res) return null;
	const body = res.data;
	if (body && typeof body === 'object' && body.data !== undefined) {
		return body.data;
	}
	return body !== undefined ? body : res;
};
