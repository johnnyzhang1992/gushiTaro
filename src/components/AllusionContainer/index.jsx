import { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';

import './style.scss';

const AllusionContainer = () => {
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

  const reachBottom = () => {
    console.log('--rearchBottom');
    const { page, last_page } = pagination.current;
    if (page < last_page) {
      pagination.current.page = page + 1;
    }
    Taro.nextTick(() => {
      fetchList();
    });
  };

  const fetchList = () => {
    if (refreshFlag.current) return;
    const { page, last_page: lastPage } = pagination.current;
    if (page > lastPage) return;

    refreshFlag.current = true;
    if (page === 1) {
      Taro.showLoading({ title: '加载中' });
    }

    Taro.request({
      url: `${Taro.getStorageSync('BaseUrl') || 'http://192.168.31.138:3000'}/api/allusions`,
      data: { page, size: 20 },
    })
      .then((res) => {
        if (res.data && res.data.status) {
          const apiData = res.data.data;
          const { list = [], current_page, last_page, total } = apiData;
          pagination.current = {
            ...pagination.current,
            page: parseInt(current_page),
            last_page,
            total,
          };
          setList(page === 1 ? list : [...allusionList, ...list]);
        }
      })
      .catch((err) => {
        console.log(err);
        setError('加载失败');
      })
      .finally(() => {
        refreshFlag.current = false;
        Taro.hideLoading();
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
            {item.aliases && item.aliases.length > 0 ? (
              <View className='allusionAliases'>
                <Text className='label'>别称：</Text>
                <Text>{item.aliases.slice(0, 3).join('、')}</Text>
              </View>
            ) : null}
          </View>
        ))}
        {loading ? (
          <View className='loading'>
            <Text>加载中...</Text>
          </View>
        ) : null}
        {!loading && allusionList.length === 0 ? (
          <View className='empty'>
            <Text>暂无典故数据</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default AllusionContainer;
