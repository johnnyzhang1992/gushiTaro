import Taro from "@tarojs/taro";
import { View, Image } from "@tarojs/components";
import copySVg from '../../images/svg/copy.svg';

import './style.scss'

const CopyButton = (props) => {
	const { text, className } = props;
	// 复制文本
	const handleCopy = () => {
		Taro.setClipboardData({
			data: text,
			success: function () {
				Taro.showToast({
					title: '诗词复制成功',
					icon: 'success',
					duration: 2000,
				});
			},
		});
	};
	return (
		<View className={['copyButton', className]} onClick={handleCopy}>
			<Image src={copySVg} mode='widthFix' className='icon' />
		</View>
	);
};

export default CopyButton;
