import { View } from '@tarojs/components';
// import { useState } from 'react';

// import GushiAudio from '../components/GushiAudio';

import './style.scss';

const Layout = (props) => {
	// const [showExtra, extraVisible] = useState(false);
	// const handleClose = () => {
	// 	extraVisible(false);
	// };
	// const handleShow = () => {
	// 	extraVisible(true);
	// };
	return (
		<View className='layout'>
			{props.children}
			{/* <View
				className='layout-extra'
				style={{
					display: showExtra ? 'block' : 'none',
				}}
			>
				<GushiAudio close={handleClose} show={handleShow} />
			</View> */}
		</View>
	);
};

export default Layout;
