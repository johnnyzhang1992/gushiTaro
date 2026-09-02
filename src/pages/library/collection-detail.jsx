import { View, Text, Navigator, Button } from '@tarojs/components';
import Taro, { useRouter, useLoad, usePullDownRefresh, useShareAppMessage, useShareTimeline } from '@tarojs/taro';
import { useState, useEffect } from 'react';

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
  const [hasPlan, setHasPlan] = useState(false);
  const [planId, setPlanId] = useState(null);
  const [creatingPlan, setCreatingPlan] = useState(false);

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

  // 检查是否已创建同名学习计划
  const checkStudyPlan = () => {
    const token = Taro.getStorageSync('wx_token');
    if (!token || !detail) return;
    
    Request('/api/study-plans', {}, 'GET')
      .then((res) => {
        if (res && res.status && res.data) {
          const existPlan = res.data.find(p => p.name === detail.collection_name);
          setHasPlan(!!existPlan);
          setPlanId(existPlan?._id || null);
        }
      })
      .catch(() => {});
  };

  // 加入学习计划
  const handleAddToStudyPlan = () => {
    if (!isLogin) {
      Taro.showModal({
        title: '提示',
        content: '请先登录后再操作',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            Taro.switchTab({ url: '/pages/me/index' });
          }
        },
      });
      return;
    }

    if (hasPlan) {
      Taro.showToast({ title: '已创建同名学习计划', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '加入学习计划',
      content: `将创建名为「${detail.collection_name}」的学习计划，并导入诗单内的所有诗词`,
      success: (res) => {
        if (res.confirm) {
          setCreatingPlan(true);
          Request('/api/study-plans', {
            name: detail.collection_name,
            description: detail.collection_description || '',
            source_type: 'collection',
            source_collection_id: id,
            source_collection_name: detail.collection_name,
          }, 'POST')
            .then((res) => {
              if (res && res.status) {
                setHasPlan(true);
                setPlanId(res.data?._id || null);
                Taro.showToast({ title: '创建成功', icon: 'success' });
              } else {
                Taro.showToast({ title: res?.msg || '创建失败', icon: 'none' });
              }
            })
            .catch(() => {
              Taro.showToast({ title: '创建失败', icon: 'none' });
            })
            .finally(() => setCreatingPlan(false));
        }
      },
    });
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

  // 分享
  useShareAppMessage(() => {
    return {
      title: detail?.collection_name || '诗单详情',
      path: `/pages/library/collection-detail?id=${id}`,
    };
  });

  useShareTimeline(() => {
    return {
      title: detail?.collection_name || '诗单详情',
      path: `/pages/library/collection-detail?id=${id}`,
    };
  });

  // detail 加载后检查学习计划
  useEffect(() => {
    if (detail) {
      checkStudyPlan();
    }
  }, [detail]);

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
                <Text className='poemCount'>{detail.totalPoems || detail.poem_count || 0} 首</Text>
                <View className='statsRight'>
                  <Button
                    className={`collectBtn ${isFavorited ? 'collected' : ''}`}
                    onClick={handleToggleFavorite}
                  >
                    {isFavorited ? '★ 已收藏' : '☆ 收藏'}
                  </Button>
                  <Button
                    className={`planBtn ${hasPlan ? 'hasPlan' : ''}`}
                    onClick={hasPlan ? () => Taro.navigateTo({ url: `/pages/study/detail?id=${planId}` }) : handleAddToStudyPlan}
                    disabled={creatingPlan}
                  >
                    {hasPlan ? '→ 去学习' : '+ 学习计划'}
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