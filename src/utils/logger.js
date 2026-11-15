import { isDevEnv } from '../const/config';

const DEBUG = isDevEnv();

// 小程序实时日志：提审/线上问题可在「小程序后台 → 实时日志」查看
const getRealtime = () => {
	try {
		return typeof wx !== 'undefined' && wx.getRealtimeLogManager
			? wx.getRealtimeLogManager()
			: null;
	} catch (e) {
		return null;
	}
};

const stringify = (args) =>
	args
		.map((a) => {
			if (typeof a === 'string') return a;
			try {
				return JSON.stringify(a);
			} catch (e) {
				return String(a);
			}
		})
		.join(' ');

const logger = {
	debug: (...args) => {
		if (DEBUG) console.log('[debug]', ...args);
	},
	warn: (...args) => {
		if (DEBUG) console.warn('[warn]', ...args);
	},
	error: (...args) => console.error('[error]', ...args),
	// 上报到实时日志（info）
	report: (...args) => {
		if (DEBUG) console.log('[report]', ...args);
		const rl = getRealtime();
		if (!rl) return;
		try {
			rl.info('app', stringify(args));
		} catch (e) {}
	},
	// 上报到实时日志（error），用于登录/注册等关键链路排障
	reportError: (...args) => {
		console.error('[report:error]', ...args);
		const rl = getRealtime();
		if (!rl) return;
		try {
			rl.error('app', stringify(args));
		} catch (e) {}
	},
};

export default logger;
