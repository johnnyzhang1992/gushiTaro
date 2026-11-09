import { isDevEnv } from '../const/config';

const DEBUG = isDevEnv();

const logger = {
	debug: (...args) => {
		if (DEBUG) console.log('[debug]', ...args);
	},
	warn: (...args) => {
		if (DEBUG) console.warn('[warn]', ...args);
	},
	error: (...args) => console.error('[error]', ...args),
};

export default logger;
