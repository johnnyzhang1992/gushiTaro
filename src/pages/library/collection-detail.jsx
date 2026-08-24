import { View, Text, Navigator } from '@tarojs/components';
import Taro, { useRouter, useLoad, usePullDownRefresh } from '@tarojs/taro';
import { useState } from 'react';

import PageHeader from '../../components/PageHeader';
import CollectionPoemCard from '../../components/CollectionPoemCard';
import Request from '../../apis/request';

import './collection-detail.scss';

const CollectionDetailPage = () => {
  const router = useRouter();
  const id = router.params.id;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  // GET /api/collections/:id（返回诗单信息 + poems 数组）
  const loadDetail = () => {
    if (!id) return;
    setLoading(true);
    Request(`/api/collections/${id}`, {}, 'GET')
      .then((res) => {
        if (res && res.status && res.data) {
          setDetail(res.data);
          Taro.setNavigationBarTitle({
            title: res.data.collection_name || '诗单详情',
          });
        } else {
          Taro.showToast({ title: '诗单不存在', icon: 'none' });
        }
      })
      .catch(() => Taro.showToast({ title: '加载失败', icon: 'none' }))
      .finally(() => setLoading(false));
  };

  useLoad(() => loadDetail());
  usePullDownRefresh(() => {
    loadDetail();
    Taro.stopPullDownRefresh();
  });

  return (
    <View className='page collectionDetailPage'>
      <PageHeader showSearch={false} showBack>
        <View className='cdHeader'>
          <Text className='title'>诗单详情</Text>
        </View>
      </PageHeader>

      <View className='cdContainer'>
        {loading && !detail ? (
          <View className='emptyTip'>
            <Text>加载中...</Text>
          </View>
        ) : detail ? (
          <>
            {/* 头部信息大卡 */}
            <View className='detailHero'>
              <Text className='heroName'>{detail.collection_name}</Text>
              {detail.collection_description ? (
                <Text className='heroDesc'>{detail.collection_description}</Text>
              ) : null}
              <View className='heroStats'>
                <Text>{detail.totalPoems || detail.poem_count || 0} 首</Text>
                <Text>{detail.pv_count || 0} 浏览</Text>
              </View>
            </View>

            {/* 诗词列表（网格布局，参考 web 端） */}
            {(detail.poems || []).filter((e) => e.poem).length > 0 ? (
              <View className='poemGrid'>
                {detail.poems
                  .filter((e) => e.poem)
                  .map((entry) => (
                    <CollectionPoemCard key={entry.poem._id} poem={entry.poem} />
                  ))}
              </View>
            ) : (
              <View className='emptyTip'>
                <Text>该诗单暂无诗词</Text>
              </View>
            )}
          </>
        ) : null}
      </View>
    </View>
  );
};

export default CollectionDetailPage;