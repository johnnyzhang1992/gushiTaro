import { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import Request from '../../apis/request';
import Skeleton from '../Skeleton';

import './style.scss';
import { isApiSuccess } from '../../apis/response';

const AllusionContainer = (props) => {
  const searchRef = useRef(props.keyWord || '');
  const [allusionList, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pagination = useRef({
    page: 1,
    size: 20,
    total: 0,
    last_page: 2,
  });
  const refreshFlag = useRef(false);
  const reqIdRef = useRef(0);

  const reachBottom = () => {
    console.log('--rearchBottom');
    const { page, last_page } = pagination.current;
    if (page < last_page) {
      Taro.nextTick(() => {
        fetchList(page + 1);
      });
    }
  };

  const fetchList = (nextPage) => {
    if (refreshFlag.current) return;
    const { last_page: lastPage } = pagination.current;
    const page = nextPage || pagination.current.page;
    if (page > lastPage) return;

    refreshFlag.current = true;
    setLoading(page === 1);
    setError('');

    const reqData = { page, size: 20 }
    if (searchRef.current) reqData['keyword'] = searchRef.current
    const seq = ++reqIdRef.current;
    Request('/api/allusions', reqData, 'GET')
      .then((res) => {
        if (seq !== reqIdRef.current) return;
        if (isApiSuccess(res) && res.data) {
          const apiData = res.data;
          const { list = [], current_page, last_page, total } = apiData;
          pagination.current = {
            ...pagination.current,
            page: parseInt(current_page),
            last_page,
            total,
          };
          // 函数式更新，避免闭包里的旧列表丢数据
          setList((pre) => (page === 1 ? list : [...pre, ...list]));
        } else {
          setError('加载失败');
        }
      })
      .catch(() => {
        if (seq !== reqIdRef.current) return;
        setError('加载失败');
      })
      .finally(() => {
        if (seq === reqIdRef.current) {
          refreshFlag.current = false;
          setLoading(false);
        }
      });
  };

  const goDetail = (item) => {
    Taro.navigateTo({
      url: `/pages/library/allusion-detail?id=${item._id}`,
    });
  };

  useEffect(() => {
    fetchList();
  }, []);

  // 搜索参数变化时重新查询（文库传入 params 对象，兼容外部直接传 keyWord）
  useEffect(() => {
    const newKey = props.params?.keyWord ?? (props.keyWord || '');
    if (newKey !== searchRef.current) {
      searchRef.current = newKey;
      pagination.current = { ...pagination.current, page: 1, last_page: 2 };
      refreshFlag.current = false;
      setList([]);
      fetchList();
    }
  }, [props.params, props.keyWord]);

  return (
    <View className='allusionContainer' id='allusionScrollContainer'>
      <ScrollView
        className='scrollContainer'
        scrollY
        enableFlex
        enhanced
        showScrollbar={false}
        enableBackToTop
        onScrollToLower={reachBottom}
      >
        {allusionList.map((item) => (
          <View className='allusionCard' key={item._id} onClick={() => goDetail(item)}>
            <View className='allusionName'>
              <Text>{item.name}</Text>
            </View>
            {item.relatedPeople && item.relatedPeople.length > 0 ? (
              <View className='allusionPeople'>
                <Text>{item.relatedPeople.join('、')}</Text>
              </View>
            ) : null}
            {item.examples && item.examples.length > 0 ? (
              <View className='allusionExample'>
                <Text className='verse'>{item.examples[0].verse}</Text>
                {item.examples[0].author ? (
                  <Text className='from'>
                    {item.examples[0].author}
                    {item.examples[0].poemTitle ? `《${item.examples[0].poemTitle}》` : ''}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        ))}
        {loading && allusionList.length === 0 ? (
          <Skeleton rows={6} />
        ) : null}
        {!loading && allusionList.length === 0 && !error ? (
          <View className='empty'>
            <Text>暂无典故数据</Text>
          </View>
        ) : null}
        {error ? (
          <View className='empty'>
            <Text>{error}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default AllusionContainer;
