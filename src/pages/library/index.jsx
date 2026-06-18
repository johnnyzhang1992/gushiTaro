import { View } from '@tarojs/components';
import { useState } from 'react';
import { useLoad } from '@tarojs/taro';
import { Tabs, TabPane } from '@nutui/nutui-react-taro';

import PageHeader from '../../components/PageHeader';
import TypeContainer from '../../components/TypeContainer';
import PoemContainer from '../../components/PoemContainer';
import PoetContainer from '../../components/PoetContainer';

import './style.scss';

const Page = () => {
	const [currentTab, setTab] = useState(0);
	const handleChangeTab = (index: string) => {
		setTab(Number(index));
	};

	useLoad((options) => {
		console.log(options);
	});
	return (
		<View className='page libraryPage'>
			<PageHeader title='文库'>
			</PageHeader>
			<Tabs value={currentTab} onChange={handleChangeTab}>
				<TabPane title='分类'>
					<TypeContainer />
				</TabPane>
				<TabPane title='作品'>
					<PoemContainer showDynasty />
				</TabPane>
				<TabPane title='作者'>
					<PoetContainer />
				</TabPane>
			</Tabs>
		</View>
	);
};

export default Page;
