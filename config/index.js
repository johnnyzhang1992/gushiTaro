const config = {
	projectName: 'gushiTaro',
	date: '2023-11-7',
	designWidth: 750,
	deviceRatio: {
		640: 2.34 / 2,
		750: 1,
		828: 1.81 / 2,
		375: 2 / 1,
	},
	sourceRoot: 'src',
	outputRoot: 'dist',
	plugins: ['@taro-hooks/plugin-react'],
	defineConstants: {},
	copy: {
		patterns: [],
		options: {},
	},
	framework: 'react',
	compiler: {
		type: 'webpack5',
		prebundle: {
			exclude: ['taro-ui'],
		},
	},
	cache: {
		enable: false, // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
	},
	css: {
		extract: {
			ignoreOrder: true,
		},
	},
	mini: {
		postcss: {
			pxtransform: {
				enable: true,
				config: {},
			},
			url: {
				enable: true,
				config: {
					limit: 1024, // 设定转换尺寸上限
				},
			},
			cssModules: {
				enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
				config: {
					namingPattern: 'module', // 转换模式，取值为 global/module
					generateScopedName: '[name]__[local]___[hash:base64:5]',
				},
			},
		},
	},
	h5: {
		esnextModules: ['taro-ui'],
		publicPath: '/',
		staticDirectory: 'static',
		postcss: {
			autoprefixer: {
				enable: true,
				config: {},
			},
			cssModules: {
				enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
				config: {
					namingPattern: 'module', // 转换模式，取值为 global/module
					generateScopedName: '[name]__[local]___[hash:base64:5]',
				},
			},
		},
	},
};

module.exports = function (merge) {
	if (process.env.NODE_ENV === 'development') {
		return merge({}, config, require('./dev'));
	}
	return merge({}, config, require('./prod'));
};
