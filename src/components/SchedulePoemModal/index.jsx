import { View, ScrollView } from '@tarojs/components';
import { AtSearchBar } from 'taro-ui';
import { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';

import { addPoemToSchedule } from '../../services/global';
import { fetchPoemData } from '../../pages/poem/service';

import FloatLoayout from '../../components/FloatLayout';
import HighLightText from '../HighLightText';

import './style.scss';

const PoemItem = (props) => {
	const {
		keyWord = '',
		schedule_id,
		schedule_name,
		poem_info = {},
		onSuccess,
	} = props;
	// 直接选中某个计划
	const handleAddPoem = async () => {
		if (poem_info.isInSchedule) {
			return false;
		}
		addPoemToSchedule('POST', {
			poem_id: poem_info.id,
			schedule_id,
			schedule_name,
		})
			.then((res) => {
				if (res && res.statusCode === 200) {
					Taro.showToast({
						title: '加入成功！记得打卡哦',
						icon: 'none',
						duration: 2000,
					});
					if (onSuccess && typeof onSuccess === 'function') {
						onSuccess({
							schedule_id,
							poem_id: poem_info.id,
							type: 'add',
						});
					}
				}
			})
			.catch((err) => {
				console.log('updateUserCollect', err);
				Taro.showToast({
					title: err.errmsg || '操作失败',
					icon: 'error',
					duration: 2000,
				});
			});
	};

	const navigateToPoem = () => {
		Taro.navigateTo({
			url: '/pages/poem/detail?id=' + poem_info.id,
		});
	};

	return (
		<View className={`poem-card ${poem_info.isInSchedule ? 'active' : ''}`}>
			<View className='card_content'>
				{/* 诗词信息，点击调整详情 */}
				<View className='poem_info' onClick={navigateToPoem}>
					<View className='title'>
						<HighLightText
							text={`${poem_info.author}《${poem_info.title}》`}
							lightWord={keyWord}
						/>
					</View>
					<View className='content'>{poem_info.content}</View>
				</View>
				<View className='operate'>
					{/* 打卡、已打卡 */}
					{!poem_info.isInSchedule ? (
						<View className='btn' onClick={handleAddPoem}>
							加入
						</View>
					) : (
						<View className='btn disable'>已加入</View>
					)}
				</View>
			</View>
		</View>
	);
};

const initPagination = {
	page: 1,
	last_page: 2,
	size: 20,
	total: 0,
};
const SchedulePoemModal = ({
	show = false,
	schedule_id,
	schedule_name,
	onClose,
	onSuccess,
}) => {
	// const [scheduleIds, setIds] = useState([...initIds]);
	const [showModal, setShowModal] = useState(false);
	const [poemList, setPoemList] = useState([]);
	const [keyWord, setKeyword] = useState(undefined);
	const paginationRef = useRef({ ...initPagination });
	const isFetching = useRef(false);

	const queryList = async (_page) => {
		const { page, size } = paginationRef.current;
		const Page = _page || page;
		if (Page > paginationRef.current.last_page) {
			return false;
		}
		if (isFetching.current) {
			return false;
		}
		isFetching.current = true;
		const res = await fetchPoemData('GET', {
			keyWord,
			page: Page,
			size,
			noCache: 1,
			_type: 'schedule',
			schedule_id,
		})
			.catch((err) => {
				console.log(err);
			})
			.finally(() => {
				isFetching.current = false;
			});
		if (res.statusCode == 200) {
			const { list = [], current_page, last_page, total } = res.data || {};
			list.forEach((poem) => {
				poem.content = String(poem.content).split(/[。？！]/)[0] + '。';
			});
			const List = Page > 1 ? [...poemList, ...list] : list;
			paginationRef.current = {
				...paginationRef.current,
				page: current_page,
				last_page,
				total,
			};
			setPoemList(List);
		}
	};

	const handleScrollToBottom = () => {
		paginationRef.current.page += 1;
		queryList();
	};

	const handleClose = () => {
		if (onClose && typeof onClose === 'function') {
			onClose();
		}
		setShowModal(false);
	};

	const handleSearch = () => {
		if (keyWord && !isFetching.current) {
			queryList();
		}
	};

	const handleChange = (val) => {
		console.log('搜索词变化：', val);
		if (keyWord === val.trim()) {
			return false;
		}
		setKeyword(val.trim());
	};

	const handleClear = () => {
		setKeyword('');
		setPoemList([]);
		paginationRef.current = {
			...initPagination,
		};
	};

	const handlePoemCallback = (options) => {
		const { poem_id } = options || {};
		const temList = poemList.map((item) => {
			if (item.id == poem_id) {
				item.isInSchedule = true;
			}
			return item;
		});
		setPoemList(temList);
		if (onSuccess && typeof onSuccess === 'function') {
			onSuccess(options);
		}
	};

	useEffect(() => {
		setShowModal(show);
	}, [show]);

	return (
		<FloatLoayout isOpen={showModal} showTitle={false} close={handleClose}>
			<View className='schedulePoemModal'>
				{/* 搜索部分 */}
				<View className='searchTop'>
					<AtSearchBar
						showActionButton
						placeholder='搜索作品'
						value={keyWord}
						onClear={handleClear}
						onChange={handleChange}
						onConfirm={handleSearch}
						onActionClick={handleSearch}
					/>
				</View>
				{/* 搜索筛选 */}
				{/* 搜索记录 */}
				{/* 列表 */}
				<ScrollView
					scrollY
					scrollWithAnimation
					enableFlex
					enableBackToTop
					enhanced
					showScrollbar={false}
					onScrollToLower={handleScrollToBottom}
					className='schedulePoemList'
				>
					{poemList.length > 0 ? (
						poemList.map((poem) => (
							<PoemItem
								key={poem.id}
								keyWord={keyWord}
								isIn={poem.isIn}
								poem_info={poem}
								schedule_id={schedule_id}
								schedule_name={schedule_name}
								onSuccess={handlePoemCallback}
							/>
						))
					) : (
						<View className='empty'>暂无内容</View>
					)}
				</ScrollView>
			</View>
		</FloatLoayout>
	);
};

export default SchedulePoemModal;
