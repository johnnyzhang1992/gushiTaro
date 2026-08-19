import { View, Text, Input } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { useState, useCallback } from 'react';
import { Button } from '@nutui/nutui-react-taro';
import {
  fetchStudyPlanDetail,
  fetchStudyPlanItems,
  addPoemsToStudyPlan,
  removePoemFromStudyPlan,
  submitReview,
  searchPoems,
} from '../../services/study';
import './detail.scss';

export default function StudyDetailPage() {
  const router = useRouter();
  const planId = router.params.id;

  const [plan, setPlan] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStage, setActiveStage] = useState('all');

  // 添加诗词相关
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addingPoem, setAddingPoem] = useState(null);

  // 学习相关
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [studyMode, setStudyMode] = useState('learn'); // learn / review
  const [studyItems, setStudyItems] = useState([]);
  const [currentStudyIndex, setCurrentStudyIndex] = useState(0);
  const [poemDetail, setPoemDetail] = useState(null);
  const [poemLoading, setPoemLoading] = useState(false);
  
  // 挖字模式: show | hide | first | last | random
  const [hiddenMode, setHiddenMode] = useState('hide');

  // 加载计划详情
  const loadPlan = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    try {
      const res = await fetchStudyPlanDetail('GET', { id: planId });
      console.log('计划详情:', res);
      if (res && res.status && res.data) {
        setPlan(res.data);
      }
    } catch (err) {
      console.error('加载计划详情失败:', err);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  // 加载诗词列表
  const loadItems = useCallback(async () => {
    if (!planId) return;
    try {
      const res = await fetchStudyPlanItems('GET', { id: planId });
      console.log('诗词列表:', res);
      if (res && res.status && res.data) {
        setItems(res.data || []);
      }
    } catch (err) {
      console.error('加载诗词列表失败:', err);
    }
  }, [planId]);

  useDidShow(() => {
    loadPlan();
    loadItems();
  });

  Taro.usePullDownRefresh(() => {
    Promise.all([loadPlan(), loadItems()]).then(() => {
      Taro.stopPullDownRefresh();
    });
  });

  // 搜索诗词
  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    setSearching(true);
    try {
      const res = await searchPoems('GET', { keyword: searchKeyword });
      console.log('搜索结果:', res);
      if (res && res.status && res.data) {
        setSearchResults(res.data || []);
      } else if (res && res.data) {
        // 兼容直接返回数组的情况
        setSearchResults(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('搜索失败:', err);
    } finally {
      setSearching(false);
    }
  };

  // 添加诗词到计划
  const handleAddPoem = async (poem) => {
    setAddingPoem(poem._id);
    try {
      const res = await addPoemsToStudyPlan('POST', {
        id: planId,
        poem_ids: [poem._id],
      });
      console.log('添加诗词结果:', res);
      if (res && res.status) {
        Taro.showToast({ title: '添加成功', icon: 'success' });
        loadItems();
        loadPlan();
      } else {
        Taro.showToast({ title: res?.msg || '添加失败', icon: 'none' });
      }
    } catch (err) {
      console.error('添加诗词失败:', err);
      Taro.showToast({ title: '添加失败', icon: 'none' });
    } finally {
      setAddingPoem(null);
    }
  };

  // 移除诗词
  const handleRemovePoem = async (item) => {
    const res = await Taro.showModal({
      title: '确认移除',
      content: `确定要从计划中移除"${item.poem_title}"吗？`,
    });
    if (res.confirm) {
      try {
        const removeRes = await removePoemFromStudyPlan('DELETE', {
          id: planId,
          poem_id: item.poem_id,
        });
        if (removeRes && removeRes.status) {
          Taro.showToast({ title: '移除成功', icon: 'success' });
          loadItems();
          loadPlan();
        }
      } catch (err) {
        console.error('移除诗词失败:', err);
        Taro.showToast({ title: '移除失败', icon: 'none' });
      }
    }
  };

  // 获取诗词详情
  const fetchPoemDetail = async (poemId) => {
    setPoemLoading(true);
    setPoemDetail(null);
    try {
      const user = Taro.getStorageSync('user') || {};
      const token = user.token;
      const baseUrl = 'http://127.0.0.1:3000';
      const res = await Taro.request({
        url: `${baseUrl}/api/poems/${poemId}`,
        method: 'GET',
        header: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      console.log('诗词详情:', res.data);
      if (res.data && res.data.status && res.data.data) {
        setPoemDetail(res.data.data);
      } else {
        setPoemDetail(null);
      }
    } catch (err) {
      console.error('获取诗词详情失败:', err);
      setPoemDetail(null);
    } finally {
      setPoemLoading(false);
    }
  };

  // 判断是否为汉字
  const isChinese = (char) => {
    const code = char.charCodeAt(0);
    return code >= 0x4e00 && code <= 0x9fa5;
  };

  // 渲染诗词内容（支持挖空模式）
  const renderPoemContent = () => {
    if (!poemDetail) return <Text className="loading-text">加载中...</Text>;

    // 解析诗词内容，支持多种格式
    let rawLines = [];
    
    if (poemDetail.content) {
      // 格式1: content 是对象 { content: ["第一句", "第二句"] }
      if (poemDetail.content.content && Array.isArray(poemDetail.content.content)) {
        rawLines = poemDetail.content.content;
      }
      // 格式2: content 是字符串 "第一句\n第二句"
      else if (typeof poemDetail.content === 'string') {
        rawLines = poemDetail.content.split('\n').filter(l => l.trim());
      }
    }
    
    // 兜底：使用 text_content
    if (rawLines.length === 0 && poemDetail.text_content) {
      rawLines = poemDetail.text_content.split('\n').filter(l => l.trim());
    }
    


    if (rawLines.length === 0) {
      return <Text className="poem-text">暂无内容</Text>;
    }

    // 拆分句子：以逗号、句号、问号、感叹号等标点拆分，但保留标点
    // 只有当拆分后的句子较长（>5字）才真正换行，短句合并
    const punctuation = ['，', '。', '？', '！', '、', '；', '：'];
    const MIN_LINE_LENGTH = 5;
    const lines = [];
    
    rawLines.forEach(rawLine => {
      let currentSegment = '';
      const segments = [];
      
      for (let i = 0; i < rawLine.length; i++) {
        const char = rawLine[i];
        currentSegment += char;
        if (punctuation.includes(char)) {
          segments.push(currentSegment);
          currentSegment = '';
        }
      }
      if (currentSegment) segments.push(currentSegment);
      
      let mergedLine = '';
      segments.forEach((seg, idx) => {
        if (mergedLine.length + seg.length <= MIN_LINE_LENGTH && idx < segments.length - 1) {
          mergedLine += seg;
        } else {
          mergedLine += seg;
          lines.push(mergedLine);
          mergedLine = '';
        }
      });
      if (mergedLine) {
        lines.push(mergedLine);
      }
    });

    // 计算每行的汉字列表（用于 first/last/random 模式）
    const getChineseChars = (line) => line.split('').filter(c => isChinese(c));

    return lines.map((line, lineIndex) => {
      const chineseChars = getChineseChars(line);
      const count = chineseChars.length;
      // 随机选一个位置（每行只随机一次）
      const randomIndex = count > 0 ? Math.floor(Math.random() * count) : 0;

      return (
        <View key={lineIndex} className="poem-line">
          {line.split('').map((char, charIndex) => {
            // 非汉字（标点）始终显示
            if (!isChinese(char)) {
              return <Text key={charIndex} className="poem-char">{char}</Text>;
            }

            // 判断当前汉字是否应该隐藏
            let hidden = false;
            if (hiddenMode === 'hide') {
              hidden = true;
            } else if (hiddenMode === 'first') {
              hidden = char !== chineseChars[0];
            } else if (hiddenMode === 'last') {
              hidden = char !== chineseChars[count - 1];
            } else if (hiddenMode === 'random') {
              hidden = char !== chineseChars[randomIndex];
            }
            // show 模式：hidden = false

            return hidden ? (
              <View key={charIndex} className="char-box"></View>
            ) : (
              <Text key={charIndex} className="poem-char">{char}</Text>
            );
          })}
        </View>
      );
    });
  };

  // 挖字模式配置
  const MODE_LIST = [
    { key: 'hide', label: '全遮' },
    { key: 'first', label: '首字' },
    { key: 'last', label: '尾字' },
    { key: 'random', label: '随机' },
    { key: 'show', label: '显示' },
  ];

  // 开始学习
  const startStudy = (mode) => {
    const now = new Date();
    let toStudy = [];

    if (mode === 'learn') {
      // 学习未学习的
      toStudy = items.filter((item) => item.stage === 0);
    } else {
      // 复习已到期的
      toStudy = items.filter(
        (item) => item.stage > 0 && new Date(item.nextReviewAt) <= now
      );
    }

    if (toStudy.length === 0) {
      Taro.showToast({
        title: mode === 'learn' ? '没有待学习的诗词' : '没有待复习的诗词',
        icon: 'none',
      });
      return;
    }

    setStudyMode(mode);
    setStudyItems(toStudy);
    setCurrentStudyIndex(0);
    setHiddenMode('hide'); // 每次开始学习时重置为全遮模式
    setPoemDetail(null);
    setShowStudyModal(true);

    // 获取第一首诗词详情
    if (toStudy.length > 0) {
      fetchPoemDetail(toStudy[0].poem_id);
    }
  };

  // 提交复习结果
  const handleSubmitReview = async (result) => {
    const currentItem = studyItems[currentStudyIndex];
    try {
      // 使用学习条目的 _id，而不是诗词的 poem_id
      const res = await submitReview('POST', {
        id: planId,
        item_id: currentItem._id,
        result,
      });
      console.log('提交复习结果:', res);

      if (res && res.status) {
        // 下一个
        if (currentStudyIndex < studyItems.length - 1) {
          const nextIndex = currentStudyIndex + 1;
          setCurrentStudyIndex(nextIndex);
          setHiddenMode('hide');
          setPoemDetail(null); // 先清空，显示加载中
          // 获取下一首诗词详情
          fetchPoemDetail(studyItems[nextIndex].poem_id);
        } else {
          // 完成
          setShowStudyModal(false);
          Taro.showToast({ title: '学习完成！', icon: 'success' });
          loadItems();
          loadPlan();
        }
      } else {
        Taro.showToast({ title: res?.msg || '提交失败', icon: 'none' });
      }
    } catch (err) {
      console.error('提交复习失败:', err);
      Taro.showToast({ title: '提交失败', icon: 'none' });
    }
  };

  // 过滤诗词列表
  const filteredItems = items.filter((item) => {
    if (activeStage === 'all') return true;
    if (activeStage === 'pending') return item.stage === 0;
    if (activeStage === 'learning') return item.stage > 0 && item.stage < 6;
    if (activeStage === 'mastered') return item.stage >= 6;
    return true;
  });

  // 获取阶段文本
  const getStageText = (stage) => {
    if (stage === 0) return '未学习';
    if (stage >= 6) return '已掌握';
    return '学习中';
  };

  // 获取阶段样式类名
  const getStageClass = (item) => {
    if (item.stage === 0) return 'pending';
    if (item.stage >= 6) return 'mastered';
    const now = new Date();
    if (item.nextReviewAt && new Date(item.nextReviewAt) <= now) return 'due';
    return 'learning';
  };

  // 获取当前学习项
  const currentStudyItem = studyItems[currentStudyIndex];

  // 计算统计
  const stats = {
    total: items.length,
    mastered: items.filter((i) => i.stage >= 6).length,
    learning: items.filter((i) => i.stage > 0 && i.stage < 6).length,
    due: items.filter((i) => {
      const now = new Date();
      return i.stage > 0 && i.nextReviewAt && new Date(i.nextReviewAt) <= now;
    }).length,
  };

  return (
    <View className="detail-page">
      {/* 计划头部 */}
      <View className="plan-header-card">
        <View className="plan-name">{plan?.name || '加载中...'}</View>
        <View className="plan-meta">
          {plan?.source_type === 'collection' ? '来自诗单' : '自建计划'} ·{' '}
          {items.length} 首诗词
        </View>
      </View>

      {/* 统计卡片 */}
      <View className="stats-card">
        <View className="stats-grid">
          <View className="stats-item">
            <View className="stats-number">{stats.total}</View>
            <View className="stats-label">诗词总数</View>
          </View>
          <View className="stats-item">
            <View className="stats-number">{stats.mastered}</View>
            <View className="stats-label">已掌握</View>
          </View>
          <View className="stats-item">
            <View className="stats-number">{stats.learning}</View>
            <View className="stats-label">学习中</View>
          </View>
          <View className="stats-item">
            <View className="stats-number">{stats.due}</View>
            <View className="stats-label">待复习</View>
          </View>
        </View>
      </View>

      {/* 阶段筛选 */}
      <View className="stage-filter">
        <View
          className={`stage-btn ${activeStage === 'all' ? 'active' : ''}`}
          onClick={() => setActiveStage('all')}
        >
          全部 ({items.length})
        </View>
        <View
          className={`stage-btn ${activeStage === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveStage('pending')}
        >
          未学习 ({items.filter((i) => i.stage === 0).length})
        </View>
        <View
          className={`stage-btn ${activeStage === 'learning' ? 'active' : ''}`}
          onClick={() => setActiveStage('learning')}
        >
          学习中 ({stats.learning})
        </View>
        <View
          className={`stage-btn ${activeStage === 'mastered' ? 'active' : ''}`}
          onClick={() => setActiveStage('mastered')}
        >
          已掌握 ({stats.mastered})
        </View>
      </View>

      {/* 诗词列表 */}
      <View className="poem-list">
        {filteredItems.length === 0 ? (
          <View className="empty-state">
            <Text className="empty-icon">📖</Text>
            <Text className="empty-text">
              {activeStage === 'all'
                ? '还没有添加诗词'
                : '该阶段暂无诗词'}
            </Text>
            <View className="empty-btn" onClick={() => setShowAddModal(true)}>
              添加诗词
            </View>
          </View>
        ) : (
          filteredItems.map((item) => (
            <View className="poem-card" key={item._id || item.poem_id}>
              <View className={`poem-status ${getStageClass(item)}`}>
                {item.stage >= 6 ? '✓' : item.stage > 0 ? '↻' : '○'}
              </View>
              <View className="poem-info">
                <View className="poem-title">{item.poem_title}</View>
                <View className="poem-author">
                  {item.poem_author} · {item.poem_dynasty}
                </View>
              </View>
              <View className={`poem-stage ${getStageClass(item)}`}>
                {getStageText(item.stage)}
              </View>
            </View>
          ))
        )}
      </View>

      {/* 底部操作栏 */}
      <View className="action-bar">
        <View className="action-btn secondary" onClick={() => setShowAddModal(true)}>
          + 添加诗词
        </View>
        <View
          className={`action-btn primary ${stats.learning === 0 && stats.due === 0 ? 'disabled' : ''}`}
          onClick={() => startStudy('learn')}
        >
          开始学习
        </View>
        {stats.due > 0 && (
          <View className="action-btn warning" onClick={() => startStudy('review')}>
            去复习 ({stats.due})
          </View>
        )}
      </View>

      {/* 添加诗词弹窗 */}
      {showAddModal && (
        <View className="modal-mask" onClick={() => setShowAddModal(false)}>
          <View className="modal-content" onClick={(e) => e.stopPropagation()}>
            <View className="modal-header">
              <Text className="modal-title">添加诗词</Text>
              <Text className="modal-close" onClick={() => setShowAddModal(false)}>
                ×
              </Text>
            </View>
            <View className="modal-body">
              <View className="search-box">
                <Input
                  className="search-input"
                  placeholder="搜索诗词名称或作者"
                  value={searchKeyword}
                  onInput={(e) => setSearchKeyword(e.detail.value)}
                  onConfirm={handleSearch}
                  confirmType="search"
                />
              </View>
              <View className="search-results">
                {searchResults.length === 0 && searchKeyword && !searching ? (
                  <View className="empty-state">
                    <Text className="empty-text">未找到相关诗词</Text>
                  </View>
                ) : (
                  searchResults.map((poem) => {
                    const isAdded = items.some((i) => i.poem_id === poem._id);
                    return (
                      <View className="search-item" key={poem._id}>
                        <View className="search-item-info">
                          <View className="search-item-title">{poem.title}</View>
                          <View className="search-item-author">
                            {poem.author} · {poem.dynasty}
                          </View>
                        </View>
                        <View
                          className={`search-item-btn ${isAdded || addingPoem === poem._id ? 'added' : ''}`}
                          onClick={() => !isAdded && handleAddPoem(poem)}
                        >
                          {isAdded ? '已添加' : addingPoem === poem._id ? '添加中...' : '添加'}
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 学习/复习弹窗 */}
      {showStudyModal && (
        <View className="study-modal">
          <View className="study-header">
            <View className="study-progress">
              {currentStudyIndex + 1} / {studyItems.length}
            </View>
            <Text className="study-close" onClick={() => setShowStudyModal(false)}>
              ×
            </Text>
          </View>
          <View className="study-content">
            {currentStudyItem && (
              <>
                <View className="study-poem-title">
                  {currentStudyItem.poem_title}
                </View>
                <View className="study-poem-author">
                  {currentStudyItem.poem_author} · {currentStudyItem.poem_dynasty}
                </View>
                {/* 模式切换按钮组 */}
                <View className="mode-switcher">
                  {MODE_LIST.map(mode => (
                    <View
                      key={mode.key}
                      className={`mode-btn ${hiddenMode === mode.key ? 'active' : ''}`}
                      onClick={() => setHiddenMode(mode.key)}
                    >
                      <Text className="mode-text">{mode.label}</Text>
                    </View>
                  ))}
                </View>
                <View className="poem-content">
                  {poemLoading || !poemDetail ? (
                    <View className="loading-state">
                      <Text className="loading-text">加载中...</Text>
                    </View>
                  ) : (
                    renderPoemContent()
                  )}
                </View>
              </>
            )}
          </View>
          <View className="study-actions">
            {studyMode === 'review' && (
              <Button
                className="study-btn forgot-btn"
                size="large"
                onClick={() => handleSubmitReview('forgotten')}
              >
                忘记了
              </Button>
            )}
            <Button
              className="study-btn unsure-btn"
              size="large"
              onClick={() => handleSubmitReview('unsure')}
            >
              不太熟
            </Button>
            <Button
              className="study-btn remember-btn"
              size="large"
              onClick={() => handleSubmitReview('remembered')}
            >
              记住了
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}
