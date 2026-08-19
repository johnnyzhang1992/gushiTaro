import { View, Text, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useState, useCallback } from 'react';
import {
  fetchStudyPlans,
  createStudyPlan,
  deleteStudyPlan,
  fetchCollectionGroups,
  fetchCollections,
  createStudyPlanFromCollection,
} from '../../services/study';
import SwipeAction from './swipe-action';
import './index.scss';

export default function StudyPage() {
  const [activeTab, setActiveTab] = useState('mine'); // mine | recommended
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [creating, setCreating] = useState(false);

  // 推荐计划相关
  const [recommendedData, setRecommendedData] = useState(null);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [creatingPlanId, setCreatingPlanId] = useState(null);
  const [learnedCollectionIds, setLearnedCollectionIds] = useState(new Set());

  // 获取学习计划列表
  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchStudyPlans('GET');
      console.log('学习计划列表:', res);
      if (res && res.status && res.data) {
        setPlans(res.data || []);
      }
    } catch (err) {
      console.error('加载学习计划失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载推荐计划
  const loadRecommended = useCallback(async () => {
    if (recommendedData) return; // 已加载过则跳过
    setRecommendedLoading(true);
    try {
      // 获取系统分组
      const groupsRes = await fetchCollectionGroups('GET', { is_system: true });
      console.log('系统分组:', groupsRes);

      if (!groupsRes || !groupsRes.status || !groupsRes.data) {
        setRecommendedLoading(false);
        return;
      }

      // API 返回格式: { status: true, data: { data: [...], total: N } }
      const groups = groupsRes.data.data || groupsRes.data || [];
      const primaryGroup = groups.find((g) => g.group_name === '小学古诗');
      const middleGroup = groups.find((g) => g.group_name === '初中古诗');

      // 并行获取两个分组的合集
      const [primaryCollections, middleCollections] = await Promise.all([
        primaryGroup ? fetchCollections('GET', { group_id: primaryGroup._id }) : Promise.resolve(null),
        middleGroup ? fetchCollections('GET', { group_id: middleGroup._id }) : Promise.resolve(null),
      ]);

      console.log('小学古诗合集:', primaryCollections);
      console.log('初中古诗合集:', middleCollections);

      // API 返回格式: { status: true, data: { list: [...], total: N } }
      setRecommendedData({
        primary: primaryGroup
          ? { group: primaryGroup, collections: primaryCollections?.data?.list || primaryCollections?.data || [] }
          : null,
        middle: middleGroup
          ? { group: middleGroup, collections: middleCollections?.data?.list || middleCollections?.data || [] }
          : null,
      });

      // 获取用户学习计划，检查哪些 collection 已经学习
      const userPlansRes = await fetchStudyPlans('GET');
      if (userPlansRes && userPlansRes.status && userPlansRes.data) {
        const learnedIds = new Set();
        userPlansRes.data.forEach(plan => {
          if (plan.source_type === 'collection' && plan.source_collection_id) {
            learnedIds.add(plan.source_collection_id);
          }
        });
        setLearnedCollectionIds(learnedIds);
      }
    } catch (err) {
      console.error('加载推荐计划失败:', err);
    } finally {
      setRecommendedLoading(false);
    }
  }, [recommendedData]);

  useDidShow(() => {
    loadPlans();
  });

  // Tab 切换
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'recommended') {
      loadRecommended();
    }
  };

  // 下拉刷新
  Taro.usePullDownRefresh(() => {
    if (activeTab === 'mine') {
      loadPlans().then(() => {
        Taro.stopPullDownRefresh();
      });
    } else {
      setRecommendedData(null);
      loadRecommended().then(() => {
        Taro.stopPullDownRefresh();
      });
    }
  });

  // 创建计划
  const handleCreate = async () => {
    if (!newPlanName.trim()) {
      Taro.showToast({ title: '请输入计划名称', icon: 'none' });
      return;
    }
    setCreating(true);
    try {
      const res = await createStudyPlan('POST', { name: newPlanName.trim() });
      console.log('创建计划结果:', res);
      if (res && res.status) {
        Taro.showToast({ title: '创建成功', icon: 'success' });
        setShowCreateModal(false);
        setNewPlanName('');
        loadPlans();
      } else {
        Taro.showToast({ title: res?.msg || '创建失败', icon: 'none' });
      }
    } catch (err) {
      console.error('创建计划失败:', err);
      Taro.showToast({ title: '创建失败，请检查登录状态', icon: 'none' });
    } finally {
      setCreating(false);
    }
  };

  // 删除计划
  const handleDelete = async (plan) => {
    const res = await Taro.showModal({
      title: '确认删除',
      content: `确定要删除学习计划"${plan.name}"吗？`,
    });
    if (res.confirm) {
      try {
        await deleteStudyPlan('DELETE', { id: plan._id });
        Taro.showToast({ title: '删除成功', icon: 'success' });
        loadPlans();
      } catch (err) {
        Taro.showToast({ title: '删除失败', icon: 'none' });
      }
    }
  };

  // 进入计划详情
  const goDetail = (plan) => {
    Taro.navigateTo({
      url: `/pages/study/detail?id=${plan._id}`,
    });
  };

  // 计算进度百分比
  const getProgress = (plan) => {
    if (!plan.poem_count || plan.poem_count === 0) return 0;
    return Math.round(((plan.mastered_count || 0) / plan.poem_count) * 100);
  };

  // 从推荐合集创建计划
  const handleStartFromCollection = async (collection) => {
    // 检查登录状态
    const user = Taro.getStorageSync('user');
    if (!user || !user.token) {
      Taro.showModal({
        title: '提示',
        content: '请先登录后再创建学习计划',
        confirmText: '去登录',
        success: function (_res) {
          if (_res.confirm) {
            Taro.switchTab({ url: '/pages/me/index' });
          }
        },
      });
      return;
    }

    setCreatingPlanId(collection._id);
    try {
      // 检查是否已存在相同来源的计划
      const plansRes = await fetchStudyPlans('GET');
      if (plansRes && plansRes.status && plansRes.data) {
        const existingPlan = plansRes.data.find(
          (p) =>
            p.source_type === 'collection' &&
            p.source_collection_id === collection._id
        );

        if (existingPlan) {
          Taro.showToast({ title: '已存在该计划，直接跳转', icon: 'none' });
          goDetail(existingPlan);
          return;
        }
      }

      // 创建新计划
      const res = await createStudyPlanFromCollection('POST', {
        name: collection.collection_name,
        source_type: 'collection',
        source_collection_id: collection._id,
        source_collection_name: collection.collection_name,
      });

      console.log('从合集创建计划:', res);
      if (res && res.status && res.data) {
        Taro.showToast({ title: '创建成功', icon: 'success' });
        goDetail(res.data);
        loadPlans(); // 刷新我的计划列表
      } else {
        Taro.showToast({ title: res?.msg || '创建失败', icon: 'none' });
      }
    } catch (err) {
      console.error('创建计划失败:', err);
      Taro.showToast({ title: '创建失败', icon: 'none' });
    } finally {
      setCreatingPlanId(null);
    }
  };

  // 渲染我的计划
  const renderMinePlans = () => (
    <View className="mine-content">
      {/* 统计概览 */}
      <View className="stats-card">
        <View className="stats-title">学习概览</View>
        <View className="stats-grid">
          <View className="stats-item">
            <View className="stats-number">
              {plans.reduce((sum, p) => sum + (p.poem_count || 0), 0)}
            </View>
            <View className="stats-label">诗词总数</View>
          </View>
          <View className="stats-item">
            <View className="stats-number">
              {plans.reduce((sum, p) => sum + (p.mastered_count || 0), 0)}
            </View>
            <View className="stats-label">已掌握</View>
          </View>
          <View className="stats-item">
            <View className="stats-number">{plans.length}</View>
            <View className="stats-label">学习计划</View>
          </View>
        </View>
      </View>

      {/* 计划列表 */}
      <View className="plan-list">
        {plans.length === 0 && !loading ? (
          <View className="empty-state">
            <Text className="empty-icon">📚</Text>
            <Text className="empty-text">还没有学习计划</Text>
            <View className="empty-btn" onClick={() => setActiveTab('recommended')}>
              去看看推荐
            </View>
          </View>
        ) : (
          plans.map((plan) => (
            <SwipeAction key={plan._id} onDelete={() => handleDelete(plan)}>
              <View
                className="plan-card"
                onClick={() => goDetail(plan)}
              >
                <View className="plan-header">
                  <View className="plan-info">
                    <View className="plan-name">{plan.name}</View>
                    <View className="plan-source">
                      {plan.source_type === 'collection' ? '来自诗单' : '自建计划'}
                    </View>
                  </View>
                  <View
                    className={`plan-status ${plan.status === 'completed' ? 'completed' : ''}`}
                  >
                    {plan.status === 'completed' ? '已完成' : '学习中'}
                  </View>
                </View>

                {/* 进度信息 */}
                <View className="plan-progress">
                  <View className="progress-bar">
                    <View
                      className="progress-fill"
                      style={{ width: `${getProgress(plan)}%` }}
                    />
                  </View>
                  <View className="progress-info">
                    <Text className="text-mastered">
                      已掌握 {plan.mastered_count || 0}/{plan.poem_count || 0}
                    </Text>
                    {(plan.due_count || 0) > 0 && (
                      <Text className="text-due">
                        待复习 {plan.due_count}
                      </Text>
                    )}
                    <Text className="text-percent">{getProgress(plan)}%</Text>
                  </View>
                </View>
              </View>
            </SwipeAction>
          ))
        )}
      </View>
    </View>
  );

  // 渲染推荐计划
  const renderRecommended = () => (
    <View className="recommended-content">
      {recommendedLoading ? (
        <View className="loading-state">
          <Text className="loading-text">加载中...</Text>
        </View>
      ) : !recommendedData ||
        (!recommendedData.primary && !recommendedData.middle) ? (
        <View className="empty-state">
          <Text className="empty-icon">📖</Text>
          <Text className="empty-text">暂无推荐</Text>
        </View>
      ) : (
        <View className="recommended-list">
          {/* 小学古诗 */}
          {recommendedData.primary && (
            <View className="recommend-section">
              <View className="section-header">
                <Text className="section-icon">📖</Text>
                <Text className="section-title">小学古诗</Text>
              </View>
              <View className="collection-grid">
                {(recommendedData.primary.collections || []).map((collection) => {
                  const isLearned = learnedCollectionIds.has(collection._id);
                  return (
                    <View className="collection-card" key={collection._id}>
                      <View className="collection-info">
                        <View className="collection-name" numberOfLines={1}>
                          {collection.collection_name}
                        </View>
                        <View className="collection-desc" numberOfLines={2}>
                          {collection.collection_description || '暂无描述'}
                        </View>
                        <View className="collection-meta">
                          <Text>{collection.poem_count || 0} 首诗词</Text>
                        </View>
                      </View>
                      <View
                        className={`collection-btn ${isLearned ? 'learned' : ''} ${creatingPlanId === collection._id ? 'disabled' : ''}`}
                        onClick={() => !isLearned && handleStartFromCollection(collection)}
                      >
                        {creatingPlanId === collection._id ? '创建中...' : isLearned ? '已学习' : '开始学习'}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* 初中古诗 */}
          {recommendedData.middle && (
            <View className="recommend-section">
              <View className="section-header">
                <Text className="section-icon">📖</Text>
                <Text className="section-title">初中古诗</Text>
              </View>
              <View className="collection-grid">
                {(recommendedData.middle.collections || []).map((collection) => {
                  const isLearned = learnedCollectionIds.has(collection._id);
                  return (
                    <View className="collection-card" key={collection._id}>
                      <View className="collection-info">
                        <View className="collection-name" numberOfLines={1}>
                          {collection.collection_name}
                        </View>
                        <View className="collection-desc" numberOfLines={2}>
                          {collection.collection_description || '暂无描述'}
                        </View>
                        <View className="collection-meta">
                          <Text>{collection.poem_count || 0} 首诗词</Text>
                        </View>
                      </View>
                      <View
                        className={`collection-btn ${isLearned ? 'learned' : ''} ${creatingPlanId === collection._id ? 'disabled' : ''}`}
                        onClick={() => !isLearned && handleStartFromCollection(collection)}
                      >
                        {creatingPlanId === collection._id ? '创建中...' : isLearned ? '已学习' : '开始学习'}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View className="study-page">
      {/* 顶部 Tabs */}
      <View className="tabs-bar">
        <View
          className={`tab-item ${activeTab === 'mine' ? 'active' : ''}`}
          onClick={() => handleTabChange('mine')}
        >
          <Text className="tab-text">我的计划</Text>
          {activeTab === 'mine' && <View className="tab-line" />}
        </View>
        <View
          className={`tab-item ${activeTab === 'recommended' ? 'active' : ''}`}
          onClick={() => handleTabChange('recommended')}
        >
          <Text className="tab-text">推荐计划</Text>
          {activeTab === 'recommended' && <View className="tab-line" />}
        </View>
      </View>

      {/* 内容区域 */}
      {activeTab === 'mine' ? renderMinePlans() : renderRecommended()}

      {/* 浮动创建按钮 - 仅我的计划页面显示 */}
      {activeTab === 'mine' && (
        <View className="fab-btn" onClick={() => setShowCreateModal(true)}>
          <Text className="fab-icon">+</Text>
        </View>
      )}

      {/* 创建计划弹窗 */}
      {showCreateModal && (
        <View className="modal-mask" onClick={() => setShowCreateModal(false)}>
          <View className="modal-content" onClick={(e) => e.stopPropagation()}>
            <View className="modal-header">
              <Text className="modal-title">新建学习计划</Text>
              <Text
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </Text>
            </View>
            <View className="modal-body">
              <View className="input-group">
                <View className="input-label">计划名称</View>
                <Input
                  className="input-field"
                  placeholder="请输入计划名称"
                  value={newPlanName}
                  onInput={(e) => setNewPlanName(e.detail.value)}
                  maxlength={20}
                />
              </View>
            </View>
            <View className="modal-footer">
              <View
                className="modal-btn cancel"
                onClick={() => setShowCreateModal(false)}
              >
                取消
              </View>
              <View
                className={`modal-btn confirm ${creating ? 'disabled' : ''}`}
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
}
