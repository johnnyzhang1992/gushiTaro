// 诗单卡片排版工具：文库「诗单」横滑区与「查看全部」页共用

// 卡片内书名可用高度（rpx），与 style.scss 的 .coverTitle 内容高度保持一致
const TITLE_AREA = 132;
// 单列超过该字数就对半拆成两列
const SPLIT_AT = 4;
// 书名最多保留字数（超出截断）
const MAX_TOTAL = 8;

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
 * 竖排书脊排版：按「·」断列；单列过长时对半拆成两列，
 * 再按最长列字数自适应字号，保证竖排不会被裁字。
 * @param {string} name 已处理过的诗单名
 * @returns {{ cols: string[], fontSize: number, lineHeight: number }}
 */
export const layoutSpine = (name = '') => {
	const raw = (name || '').replace(/\s/g, '').slice(0, MAX_TOTAL);
	const segs = raw.split('·').filter((seg) => seg !== '');

	let cols = segs.length === 0 ? [''] : segs.slice(0, 2);
	if (segs.length > 2) cols = [segs[0], segs.slice(1).join('·')];

	// 单列过长：对半拆开，两列更接近古籍版式，字号也更大
	if (cols.length === 1 && cols[0].length > SPLIT_AT) {
		const half = Math.ceil(cols[0].length / 2);
		cols = [cols[0].slice(0, half), cols[0].slice(half)];
	}

	const maxLen = Math.max(...cols.map((col) => col.length), 1);
	const lineHeight = Math.max(22, Math.min(36, Math.floor(TITLE_AREA / maxLen)));
	const fontSize = Math.max(18, Math.min(27, Math.round(lineHeight * 0.76)));
	return { cols, fontSize, lineHeight };
};

/**
 * 数量展示：统一为「29 首」
 */
export const formatPoemCount = (n) => `${Number(n) || 0} 首`;