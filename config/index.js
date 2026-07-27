const config = {
	projectName: 'gushiTaro',
	date: '2023-11-7',
	designWidth (input) {
		if (input?.from?.indexOf('nutui') > -1) {
			return 375
		}
		return 750
	},
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
			exclude: ['@nutui/nutui-react-taro'],
		},
	},
	cache: {
		enable: false,
	},
	css: {
		extract: {
			ignoreOrder: true,
		},
	},
	mini: {
      css: {
        extract: {
          ignoreOrder: true,
        },
      },
		 webpackChain (chain, webpack) {
      chain.performance.hints(false)
      // 通过自定义插件抑制 CSS 顺序警告
      chain.plugin('css-order-fix').use({
        apply (compiler) {
          compiler.hooks.afterPlugins.tap('CssOrderFix', () => {
            compiler.options.plugins.forEach(p => {
              if (p && p.constructor && p.constructor.name === 'MiniCssExtractPlugin') {
                const opts = p.options || {}
                if (opts.ignoreOrder !== true) {
                  opts.ignoreOrder = true
                }
              }
            })
          })
        }
      })
    },
		postcss: {
			pxtransform: {
				enable: true,
				config: {
					designWidth (input) {
						if (input?.from?.indexOf('nutui') > -1) {
							return 375
						}
						return 750
					},
				},
			},
			url: {
				enable: true,
				config: {
					limit: 1024,
				},
			},
			cssModules: {
				enable: false,
				config: {
					namingPattern: 'module',
					generateScopedName: '[name]__[local]___[hash:base64:5]',
				},
			},
		},
	},
	h5: {
		esnextModules: ['@nutui/nutui-react-taro'],
		publicPath: '/',
		staticDirectory: 'static',
		postcss: {
			autoprefixer: {
				enable: true,
				config: {},
			},
			cssModules: {
				enable: false,
				config: {
					namingPattern: 'module',
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
