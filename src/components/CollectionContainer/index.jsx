import { View, Text, Navigator, ScrollView } from '@tarojs/components';
import { useState, useEffect } from 'react';

import { fetchCollectionGroups } from '../../services/study';
import Skeleton from '../Skeleton';

import './style.scss';
import { isApiSuccess, getApiData } from '../../apis/response';
import { getDisplayName, layoutSpine, formatPoemCount } from '../../utils/collectionCard';

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
            {/* 诗单封面横向滚动 */}
            <ScrollView className='collectionScroll' scrollX enableFlex showScrollbar={false}>
              {(group.collections || []).slice(0, 10).map((c) => {
                const layout = layoutSpine(getDisplayName(c.collection_name, group.group_name));
                return (
                  <Navigator
                    key={c._id}
                    className='bookCard'
                    hoverClass='none'
                    url={`/pages/library/collection-detail?id=${c._id}`}
                  >
                    <View className='bookCover'>
                      <View className='coverSpine' />
                      <View className='coverTitle' style={{ fontSize: `${layout.fontSize}rpx` }}>
                        {layout.cols.map((col, ci) => (
                          <View className='titleCol' key={ci}>
                            {[...col].map((ch, i) => (
                              <Text
                                className='titleChar'
                                key={i}
                                style={{ lineHeight: `${layout.lineHeight}rpx`, height: `${layout.lineHeight}rpx` }}
                              >
                                {ch}
                              </Text>
                            ))}
                          </View>
                        ))}
                      </View>
                      <View className='coverDivider' />
                      <Text className='coverCount'>{formatPoemCount(c.poem_count)}</Text>
                    </View>
                  </Navigator>
                );
              })}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CollectionContainer;