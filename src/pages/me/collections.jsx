import { View, Text, ScrollView } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro, { useRouter, useLoad, usePullDownRefresh } from '@tarojs/taro';

import PoemPlaylistCard from '../../components/PoemPlaylistCard';
import Request from '../../apis/request';

import './collection.scss';

const CollectionsPage = () => {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState('created');
  const [createdList, setCreatedList] = useState([]);
  const [favoritedList, setFavoritedList] = useState([]);
  const [isLoading, setLoading] = useState(true);

  // 加载创建的诗单
  const loadCreated = () => {
    return Request('/api/collections', { mine: true }, 'GET')
      .then((res) => {
        if (res && res.status && res.data) {
          const list = res.data.list || res.data.collections || [];
          setCreatedList(list);
        }
      })
      .catch(() => {});
  };

  // 加载收藏的诗单
  const loadFavorited = () => {
    return Request('/api/favorites', { target_type: 'collection', size: 50 }, 'GET')
      .then((res) => {
        if (res && res.status && res.data) {
          setFavoritedList(res.data.list || []);
        }
      })
      .catch(() => {});
  };

  // 加载数据
  const loadData = () => {
    setLoading(true);
    Promise.all([loadCreated(), loadFavorited()])
      .finally(() => {
        setLoading(false);
        Taro.stopPullDownRefresh();
      });
  };

  useLoad((options) => {
    if (options.type === 'favorited') {
      setCurrentTab('favorited');
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  usePullDownRefresh(() => {
    loadData();
  });

  const tabs = [
    { key: 'created', label: '我创建的', count: createdList.length },
    { key: 'favorited', label: '我收藏的', count: favoritedList.length },
  ];

  const currentList = currentTab === 'created' ? createdList : favoritedList;

  return (
    <View className='page collectionsPage'>
      {/* Tab 切换 */}
      <View className='tabs'>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={`tabItem ${currentTab === tab.key ? 'active' : ''}`}
            onClick={() => setCurrentTab(tab.key)}
          >
            <Text className='tabText'>{tab.label}</Text>
            <Text className='tabCount'>{tab.count}</Text>
            {currentTab === tab.key ? <View className='tabLine' /> : null}
          </View>
        ))}
      </View>

      {/* 列表内容 */}
      {isLoading ? (
        <View className='loading'>
          <Text>加载中...</Text>
        </View>
      ) : currentList.length === 0 ? (
        <View className='empty'>
          <Text>{currentTab === 'created' ? '暂无创建的诗单' : '暂无收藏的诗单'}</Text>
        </View>
      ) : (
        <ScrollView className='listScroll' scrollY>
          <View className='listContainer'>
            {currentList.map((item) => (
              <PoemPlaylistCard
                key={item.id || item.target_id}
                playlist={currentTab === 'created' ? item : item}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default CollectionsPage;