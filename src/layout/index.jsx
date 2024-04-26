import { View } from '@tarojs/components';

import GushiAudio from '../components/GushiAudio';

import './style.scss'

const Layout = (props) => {
	return <View className='layout'>
		{props.children}
		<View className='layout-extra'>
			<GushiAudio />
		</View>
	</View>;
};

export default Layout;
