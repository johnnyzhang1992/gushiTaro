const formatTime = (date = new Date()) => {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const hour = date.getHours();
	const minute = date.getMinutes();
	const second = date.getSeconds();

	return (
		[year, month, day].map(formatNumber).join('/') +
		' ' +
		[hour, minute, second].map(formatNumber).join(':')
	);
};
const getDateDiff = (dateStr) => {
	let getDateTimeStamp = (str) => {
		return Date.parse(str.replace(/-/gi, '/'));
	};
	let publishTime = getDateTimeStamp(dateStr) / 1000,
		d_seconds,
		d_minutes,
		d_hours,
		d_days,
		timeNow = parseInt(new Date().getTime() / 1000),
		d,
		date = new Date(publishTime * 1000),
		Y = date.getFullYear(),
		M = date.getMonth() + 1,
		D = date.getDate(),
		H = date.getHours(),
		m = date.getMinutes(),
		s = date.getSeconds();
	//小于10的在前面补0
	if (M < 10) {
		M = '0' + M;
	}
	if (D < 10) {
		D = '0' + D;
	}
	if (H < 10) {
		H = '0' + H;
	}
	if (m < 10) {
		m = '0' + m;
	}
	if (s < 10) {
		s = '0' + s;
	}
	d = timeNow - publishTime;
	d_days = parseInt(d / 86400);
	d_hours = parseInt(d / 3600);
	d_minutes = parseInt(d / 60);
	d_seconds = parseInt(d);

	if (d_days > 0 && d_days < 3) {
		return d_days + '天前';
	} else if (d_days <= 0 && d_hours > 0) {
		return d_hours + '小时前';
	} else if (d_hours <= 0 && d_minutes > 0) {
		return d_minutes + '分钟前';
	} else if (d_seconds < 60) {
		if (d_seconds <= 0) {
			return '刚刚';
		} else {
			return d_seconds + '秒前';
		}
	} else if (d_days >= 3 && d_days < 30) {
		return M + '-' + D + ' ' + H + ':' + m;
	} else if (d_days >= 30) {
		return Y + '-' + M + '-' + D + ' ' + H + ':' + m;
	}
};

const formatNumber = (n) => {
	n = n.toString();
	return n[1] ? n : '0' + n;
};

const formatDateToMb = () => {
	let date = new Date();
	let mb_str = [
		'零',
		'一',
		'二',
		'三',
		'四',
		'五',
		'六',
		'七',
		'八',
		'九',
		'十',
		'十一',
		'十二',
	];
	let y = date.getFullYear().toString();
	let Y = '';
	let m = date.getMonth() + 1;
	let M = mb_str[m] + '月';
	let d = date.getDate();
	for (let i = 0; i < y.split('').length; i++) {
		Y = Y + mb_str[y.split('')[i]];
	}
	return [Y, M, d];
};

const formatDate = (str = false) => {
	let date = new Date();
	let y = date.getFullYear().toString();
	let m = date.getMonth() + 1;
	let d = date.getDate();
	if (m < 10) {
		m = '0' + m;
	}
	if (d < 10) {
		d = '0' + d;
	}
	if (str) {
		return `${y}-${m}-${d}`
	}
	return [y, m, d];
};

const excludeSpecial = (s) => {
	let pattern = new RegExp(
		"[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？%《》]",
		'g'
	);
	let rs = '';
	for (let i = 0; i < s.length; i++) {
		rs = rs + s.substr(i, 1).replace(pattern, '');
	}
	return rs;
};

const formateSeconds = (seconds) => {
	let min = 0;
	let sec = 0;
	if (typeof seconds !== 'number' || Number.isNaN(seconds)) {
		return '00:00'
	}
	if (seconds > 0) {
		min = parseInt(seconds / 60);
		sec = parseInt(seconds % 60);
	} else {
		sec = parseInt(seconds);
	}
	return `${formatNumber(min)}:${formatNumber(sec)}`;
};

export default {
	formatTime,
	getDateDiff,
	formatDateToMb,
	formatDate,
	excludeSpecial,
	formateSeconds,
};
