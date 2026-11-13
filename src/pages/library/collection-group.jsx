import { View, Text } from '@tarojs/components';
import Taro, {
	useRouter,
	useLoad,
	usePullDownRefresh,
	useShareAppMessage,
	useShareTimeline,
} from '@tarojs/taro';
import { useState } from 'react';
import { useNavigationBar } from 'taro-hooks';

import { fetchCollectionGroups, fetchCollections } from '../../services/study';

import './collection-group.scss';
import { isApiSuccess } from '../../apis/response';
import CollectionInfoCard from '../../components/CollectionInfoCard';

const CollectionGroupPage = () => {
  const { setTitle } = useNavigationBar({ title: '古诗文小助手' });
  const router = useRouter();
  const groupId = router.params.id;
  const groupName = decodeURIComponent(router.params.name || '诗单分组');

  const [group, setGroup] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    if (!groupId) return;
    setLoading(true);
    Promise.all([
      fetchCollectionGroups('GET', { id: groupId }),
      fetchCollections('GET', { group_id: groupId }),
    ])
      .then(([groupRes, colRes]) => {
        if (isApiSuccess(groupRes) && groupRes.data) {
          setGroup(groupRes.data);
          setCollections(groupRes.data.collections || []);
        }
        // getGroup 已附带 collections；若为空则用 getCollections 兜底
        if (isApiSuccess(colRes) && colRes.data) {
          const list = colRes.data?.list || [];
          if (list.length > 0 && collections.length === 0) setCollections(list);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useLoad(() => {
    setTitle(groupName || '诗单分组');
    loadData();
  });
  usePullDownRefresh(() => {
    loadData();
    Taro.stopPullDownRefresh();
  });

  useShareAppMessage(() => ({
    title: groupName || '诗单分组',
    path: `/pages/library/collection-group?id=${groupId}&name=${encodeURIComponent(groupName)}`,
  }));

  useShareTimeline(() => ({
    title: groupName || '诗单分组',
    path: `/pages/library/collection-group?id=${groupId}&name=${encodeURIComponent(groupName)}`,
  }));

  const totalPoems = collections.reduce((sum, c) => sum + (c.poem_count || 0), 0);

  return (
    <View className='page collectionGroupPage'>
      <View className='cgContainer'>
        {/* 分组头部大卡 */}
        <View className='groupHero'>
          <Text className='heroName'>{groupName}</Text>
          {group?.group_description ? (
            <Text className='heroDesc'>{group.group_description}</Text>
          ) : null}
          <View className='heroStats'>
            <Text>{collections.length} 个诗单</Text>
            <Text>共 {totalPoems} 首诗词</Text>
          </View>
        </View>

        {/* 全部诗单网格 */}
        {loading ? (
          <View className='emptyTip'>
            <Text>加载中...</Text>
          </View>
        ) : collections.length === 0 ? (
          <View className='emptyTip'>
            <Text>该分组暂无诗单</Text>
          </View>
        ) : (
          <View className='collectionGrid'>
            {collections.map((c) => (
              <CollectionInfoCard key={c._id} collection={c} groupName={groupName} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default CollectionGroupPage;
