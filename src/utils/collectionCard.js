// 诗单卡片排版工具：文库「诗单」横滑区与「查看全部」页共用

// 竖排书名的统一字号与行高（rpx）：所有卡片保持一致，不再按字数缩放
export const SPINE_FONT_SIZE = 27;
export const SPINE_LINE_HEIGHT = 34;

// 单列最多字数（4 字 × 34rpx = 136rpx，正好落在书名可用高度内）
const MAX_COL_CHARS = 4;
// 最多列数
const MAX_COLS = 3;

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

// 把一段文字均分成两段（用于过长的单列）
const splitEven = (text) => {
	const half = Math.ceil(text.length / 2);
	return [text.slice(0, half), text.slice(half)];
};

/**
 * 竖排书脊分列：优先按「·」分段，单段过长再均分，
 * 保证每列不超过 MAX_COL_CHARS 字，从而所有卡片使用同一字号。
 * @param {string} name 已处理过的诗单名
 * @returns {{ cols: string[] }}
 */
export const layoutSpine = (name = '') => {
	const raw = (name || '').replace(/\s/g, '');
	let cols = raw.split('·').filter((seg) => seg !== '');
	if (cols.length === 0) cols = [''];

	// 单段过长：均分成两列
	if (cols.length === 1 && cols[0].length > MAX_COL_CHARS) {
		cols = splitEven(cols[0]);
	}

	// 任一列仍超长：继续拆到新列（最多 MAX_COLS 列）
	const out = [];
	cols.forEach((col) => {
		if (col.length <= MAX_COL_CHARS) {
			out.push(col);
		} else {
			out.push(...splitEven(col));
		}
	});

	// 超出列数上限的合并回最后一列，并截断防止溢出
	const limited = out.slice(0, MAX_COLS);
	if (out.length > MAX_COLS) {
		limited[MAX_COLS - 1] = out.slice(MAX_COLS - 1).join('');
	}
	return {
		cols: limited.map((col) =>
			col.length > MAX_COL_CHARS ? `${col.slice(0, MAX_COL_CHARS - 1)}…` : col
		),
	};
};

/**
 * 数量展示：统一为「29 首」
 */
export const formatPoemCount = (n) => `${Number(n) || 0} 首`;