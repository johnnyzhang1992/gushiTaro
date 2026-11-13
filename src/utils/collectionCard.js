// 诗单卡片共用工具：名称清洗与数量展示

// 底部弹层列表单行高度（rpx）：.sheet-row 的 padding + 标题 + 副标题 + 分隔线
export const SHEET_ROW_HEIGHT = 132;

/**
 * 名称处理：剥掉分组名前缀、全角冒号转 ·
 * @param {string} name 原始诗单名
 * @param {string} groupName 所属分组名（可能为空）
 */
export const getDisplayName = (name = '', groupName = '') => {
	let n = name || '';
	// 先剥掉分组名前缀（可能带分隔符）
	if (groupName && n.includes(groupName)) {
		n = n.slice(n.indexOf(groupName) + groupName.length);
	}
	// 循环去除开头残留的 · / ： / : 符号及空白（兼容多层）
	n = n.replace(/^[·：:\s]+/, '');
	// 全角冒号统一为 ·
	return n.replace(/：/g, '·');
};

/**
 * 数量展示：统一为「29 首」
 */
export const formatPoemCount = (n) => `${Number(n) || 0} 首`;