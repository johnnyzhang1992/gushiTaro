import { View, Text, ScrollView, Input } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro, { useRouter, useLoad, usePullDownRefresh } from '@tarojs/taro';

import PoemPlaylistCard from '../../components/PoemPlaylistCard';
import Request from '../../apis/request';
import { createCollection } from '../../services/global';

import './collection.scss';

const CollectionsPage = () => {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState('created');
  const [createdList, setCreatedList] = useState([]);
  const [favoritedList, setFavoritedList] = useState([]);
  const [isLoading, setLoading] = useState(true);

  // 创建诗单弹窗
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [collectionDesc, setCollectionDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // 加载创建的诗单
  const loadCreated = () => {
    const user = Taro.getStorageSync('user') || {};
    return Request('/api/collections', { mine: true, uid: user.uid }, 'GET')
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
    const user = Taro.getStorageSync('user') || {};
    return Request('/api/favorites', { target_type: 'collection', size: 50, uid: user.uid }, 'GET')
      .then((res) => {
        if (res && res.status && res.data) {
          setFavoritedList(res.data.list || []);
        }
      })
      .catch(() => {});
  };

  // 移除诗单
  const handleRemove = (id) => {
    const api = currentTab === 'created' 
      ? Request(`/api/collections/${id}`, {}, 'DELETE')
      : Request('/api/favorites/toggle', { target_id: id, target_type: 'collection' }, 'POST');
    
    api.then((res) => {
      if (res && res.status) {
        Taro.showToast({ title: '已移除', icon: 'success' });
        loadData();
      }
    }).catch(() => {
      Taro.showToast({ title: '移除失败', icon: 'none' });
    });
  };

  // 创建诗单
  const handleCreate = async () => {
    if (!collectionName.trim()) {
      Taro.showToast({ title: '请输入诗单名称', icon: 'none' });
      return;
    }
    setCreating(true);
    try {
      const res = await createCollection('POST', {
        collection_name: collectionName.trim(),
        collection_description: collectionDesc.trim(),
      });
      if (res && res.status) {
        Taro.showToast({ title: '创建成功', icon: 'success' });
        setShowCreateModal(false);
        setCollectionName('');
        setCollectionDesc('');
        loadData();
      } else {
        Taro.showToast({ title: res?.msg || '创建失败', icon: 'none' });
      }
    } catch (err) {
      Taro.showToast({ title: '创建失败', icon: 'none' });
    } finally {
      setCreating(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setCollectionName('');
    setCollectionDesc('');
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
            <View className='badge'>{tab.count}</View>
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
            {currentList.map((item, index) => (
              <PoemPlaylistCard
                key={item._id || item.id || item.target_id || index}
                playlist={item}
                showRemove={true}
                onRemove={handleRemove}
              />
            ))}
          </View>
        </ScrollView>
      )}

      {/* 浮动新建按钮 - 仅我创建的显示 */}
      {currentTab === 'created' && (
        <View className='fabBtn' onClick={() => setShowCreateModal(true)}>
          <Text className='fabIcon'>+</Text>
        </View>
      )}

      {/* 创建诗单弹窗 */}
      {showCreateModal && (
        <View className='modalMask' onClick={handleCloseModal}>
          <View className='modalContent' onClick={(e) => e.stopPropagation()}>
            <View className='modalHeader'>
              <Text className='modalTitle'>新建诗单</Text>
              <Text className='modalClose' onClick={handleCloseModal}>×</Text>
            </View>
            <View className='modalBody'>
              <View className='inputGroup'>
                <Text className='inputLabel'>诗单名称</Text>
                <Input
                  className='inputField'
                  placeholder='请输入诗单名称'
                  value={collectionName}
                  onInput={(e) => setCollectionName(e.detail.value)}
                  maxlength={20}
                />
              </View>
              <View className='inputGroup'>
                <Text className='inputLabel'>诗单描述</Text>
                <Input
                  className='inputField'
                  placeholder='请输入诗单描述（选填）'
                  value={collectionDesc}
                  onInput={(e) => setCollectionDesc(e.detail.value)}
                  maxlength={100}
                />
              </View>
            </View>
            <View className='modalFooter'>
              <View className='modalBtn cancel' onClick={handleCloseModal}>取消</View>
              <View
                className={`modalBtn confirm ${creating ? 'disabled' : ''}`}
                onClick={handleCreate}
              >
                {creating ? '创建中...' : '创建'}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default CollectionsPage;