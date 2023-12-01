import { View, Text, Navigator } from '@tarojs/components';

const Page = () => {
	return (
		<View>
			<Text>设置页面</Text>
			<Navigator url='/pages/post/index?type=privateRule'>《用户服务协议和隐私政策》</Navigator>
		</View>
	);
};

export default Page;
