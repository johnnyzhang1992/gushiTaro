import Request from '../apis/request';

// ======== 学习计划 ========

// 获取学习计划列表
export const fetchStudyPlans = (method = 'GET', data) => {
  return Request('/api/study-plans', data, method);
};

// 获取学习计划详情
export const fetchStudyPlanDetail = (method = 'GET', data) => {
  return Request(`/api/study-plans/${data.id}`, data, method);
};

// 创建学习计划
export const createStudyPlan = (method = 'POST', data) => {
  return Request('/api/study-plans', data, method);
};

// 更新学习计划
export const updateStudyPlan = (method = 'PUT', data) => {
  return Request(`/api/study-plans/${data.id}`, data, method);
};

// 删除学习计划
export const deleteStudyPlan = (method = 'DELETE', data) => {
  return Request(`/api/study-plans/${data.id}`, data, method);
};

// 获取计划内的诗词列表
export const fetchStudyPlanItems = (method = 'GET', data) => {
  return Request(`/api/study-plans/${data.id}/items`, data, method);
};

// 添加诗词到计划
export const addPoemsToStudyPlan = (method = 'POST', data) => {
  return Request(`/api/study-plans/${data.id}/items`, { poem_ids: data.poem_ids }, method);
};

// 从计划移除诗词
export const removePoemFromStudyPlan = (method = 'DELETE', data) => {
  return Request(`/api/study-plans/${data.id}/items/${data.poem_id}`, data, method);
};

// 提交复习结果（使用学习条目 _id）
export const submitReview = (method = 'POST', data) => {
  return Request(`/api/study-plans/${data.id}/review/${data.item_id}`, { result: data.result }, method);
};

// 获取今日待复习项
export const fetchDueToday = (method = 'GET', data) => {
  return Request('/api/study-plans/due-today', data, method);
};

// 获取计划统计
export const fetchStudyPlanStats = (method = 'GET', data) => {
  return Request('/api/study-plans/stats', data, method);
};

// ======== 搜索诗词 ========

// 搜索诗词（用于添加到计划）
export const searchPoems = (method = 'GET', data) => {
  return Request('/api/search', data, method);
};

// ======== 推荐计划（诗单/诗单） ========

// 获取诗单分组列表
export const fetchCollectionGroups = (method = 'GET', data) => {
  return Request('/api/collection-groups', data, method);
};

// 获取分组下的诗单列表
export const fetchCollections = (method = 'GET', data) => {
  return Request('/api/collections', data, method);
};

// 从诗单创建学习计划
export const createStudyPlanFromCollection = (method = 'POST', data) => {
  return Request('/api/study-plans', data, method);
};
