import { View, Text, Navigator, ScrollView } from '@tarojs/components';
import { useState, useEffect } from 'react';

import { fetchCollectionGroups } from '../../services/study';
import Skeleton from '../Skeleton';

import './style.scss';
import { isApiSuccess, getApiData } from '../../apis/response';
import CollectionInfoCard from '../CollectionInfoCard';

// 每组最多两行两列（4 个）；只有 3 个时退成一行两个，避免最后一行孤零零一个
const visibleCount = (total) => {
	const capped = Math.min(4, Number(total) || 0);
	return capped === 3 ? 2 : capped;
};

const CollectionContainer = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchCollectionGroups('GET', { with_collections: true })
      .then((res) => {
        if (isApiSuccess(res) && res.data) {
          setGroups(getApiData(res) || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading && groups.length === 0) {
    return (
      <View className='collectionContainer'>
        <Skeleton rows={6} />
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View className='collectionContainer'>
        <View className='emptyTip'>
          <Text>暂无诗单分组</Text>
        </View>
      </View>
    );
  }

  return (
    <View className='collectionContainer' id='collectionScrollContainer'>
      <ScrollView className='scrollContainer' scrollY enhanced showScrollbar={false} enableBackToTop>
        {groups.map((group) => (
          <View key={group._id} className='groupSection'>
            {/* 分组头部 */}
            <View className='groupHeader'>
              <Text className='groupName'>{group.group_name}</Text>
              <Navigator
                className='groupMore'
                hoverClass='none'
                url={`/pages/library/collection-group?id=${group._id}&name=${encodeURIComponent(
                  group.group_name
                )}`}
              >
                查看全部 ›
              </Navigator>
            </View>
            {/* 诗单信息卡：每组展示两行（4 个），更多走「查看全部」 */}
            <View className='collectionGrid'>
              {(group.collections || []).slice(0, visibleCount((group.collections || []).length)).map((c) => (
                <CollectionInfoCard
                  key={c._id}
                  collection={c}
                  groupName={group.group_name}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CollectionContainer;