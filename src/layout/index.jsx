import { View } from '@tarojs/components';

import './style.scss'

const Layout = (props) => {
	return <View className='layout'>{props.children}</View>;
};

export default Layout;
