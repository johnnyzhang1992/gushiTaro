// import { useCallback, useEffect, useState } from "react";
import { View, Navigator } from "@tarojs/components";
import { useNavigationBar } from "taro-hooks";

import "./index.less";

import HomeHeader from "../components/HomeHeader";

const Index = () => {
	const { setTitle } = useNavigationBar({ title: "首页 | 古诗文小助手" });
	setTitle( "首页 | 古诗文小助手")
	return (
		<View className='wrapper'>
			<HomeHeader />
			<View>
				<Navigator url='/pages/home/index'>Home Page</Navigator>
			</View>
		</View>
	);
};

export default Index;
