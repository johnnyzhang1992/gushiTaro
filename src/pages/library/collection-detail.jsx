import { View, Text, Navigator, Button } from '@tarojs/components';
import Taro, { useRouter, useLoad, usePullDownRefresh } from '@tarojs/taro';
import { useState } from 'react';

import CollectionPoemCard from '../../components/CollectionPoemCard';
import Request from '../../apis/request';

import './collection-detail.scss';

const CollectionDetailPage = () => {
  const router = useRouter();
  const id = router.params.id;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

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

  // 检查登录状态和收藏状态
  const checkLoginAndFavorite = () => {
    const token = Taro.getStorageSync('wx_token');
    setIsLogin(!!token);
    if (token && id) {
      checkFavorite();
    }
  };

  // 检查是否已收藏
  const checkFavorite = () => {
    Request('/api/favorites/check', { target_id: id, target_type: 'collection' }, 'GET')
      .then((res) => {
        if (res && res.status && res.data) {
          setIsFavorited(res.data.isFavorited);
        }
      })
      .catch(() => {});
  };

  // 切换收藏
  const handleToggleFavorite = () => {
    if (!isLogin) {
      Taro.showModal({
        title: '提示',
        content: '请先登录后再收藏',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            Taro.switchTab({ url: '/pages/me/index' });
          }
        },
      });
      return;
    }

    Request('/api/favorites/toggle', { target_id: id, target_type: 'collection' }, 'POST')
      .then((res) => {
        if (res && res.status && res.data) {
          setIsFavorited(res.data.isFavorited);
          Taro.showToast({
            title: res.data.isFavorited ? '收藏成功' : '已取消收藏',
            icon: 'success',
          });
        }
      })
      .catch(() => {
        Taro.showToast({ title: '操作失败', icon: 'none' });
      });
  };

  useLoad(() => {
    loadDetail();
    checkLoginAndFavorite();
  });

  usePullDownRefresh(() => {
    loadDetail();
    checkLoginAndFavorite();
    Taro.stopPullDownRefresh();
  });

  return (
    <View className='page collectionDetailPage'>
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
                <View className='statsRight'>
                  <Text className='poemCount'>{detail.totalPoems || detail.poem_count || 0} 首</Text>
                  <Button
                    className={`collectBtn ${isFavorited ? 'collected' : ''}`}
                    onClick={handleToggleFavorite}
                  >
                    {isFavorited ? '★ 已收藏' : '☆ 收藏'}
                  </Button>
                </View>
              </View>
            </View>

            {/* 诗词列表 */}
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