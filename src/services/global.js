import Request from '../apis/request';

// ======== 首页 ========

// 每日一诗词
export const fetchRandomSentence = (method, data) => {
	return Request(`/api/sentences/random`, data, method);
};

// ======== 收藏/点赞 ========

// 获取我的收藏
export const fetchUserCollect = (method, data) => {
	return Request(`/api/favorites`, data, method);
};

// 切换收藏
export const updateUserCollect = (method, data) => {
	return Request(`/api/favorites/toggle`, data, method);
};

// 切换点赞
export const updateUserLike = (method, data) => {
	return Request(`/api/likes/toggle`, data, method);
};

// ======== 收藏集/诗单 ========

// 获取收藏集列表
export const fetchCollections = (method, data) => {
	return Request(`/api/collections`, data, method);
};

// 创建收藏集
export const createCollection = (method = 'POST', data) => {
	return Request(`/api/collections/create`, data, method);
};

// 更新收藏集
export const updateCollection = (method = 'POST', data) => {
	return Request(`/api/collections/update`, data, method);
};

// 获取收藏集详情（含诗词列表）
export const fetchCollectionDetail = (method = 'GET', data) => {
	return Request(`/api/collections/${data.id}`, data, method);
};

// 删除收藏集
export const deleteCollection = (method = 'DELETE', data) => {
	return Request(`/api/collections/${data.id}`, data, method);
};

// 向收藏集添加诗词
export const addPoemsToCollection = (method = 'POST', data) => {
	return Request(`/api/collections/${data.id}/poems`, { poem_ids: data.poem_ids }, method);
};

// 从收藏集移除诗词
export const removePoemFromCollection = (method = 'DELETE', data) => {
	return Request(`/api/collections/${data.id}/poems/${data.poem_id}`, data, method);
};

// 复制收藏集
export const copyCollection = (method = 'POST', data) => {
	return Request(`/api/collections/${data.id}/copy`, data, method);
};

// ======== 收藏集分组 ========

// 获取分组列表
export const fetchCollectionGroups = (method = 'GET', data) => {
	return Request(`/api/collection-groups`, data, method);
};

// 获取分组详情
export const fetchCollectionGroupDetail = (method = 'GET', data) => {
	return Request(`/api/collection-groups/${data.id}`, data, method);
};

// 创建分组
export const createCollectionGroup = (method = 'POST', data) => {
	return Request(`/api/collection-groups`, data, method);
};

// 更新分组
export const updateCollectionGroup = (method = 'PUT', data) => {
	return Request(`/api/collection-groups/${data.id}`, data, method);
};

// 删除分组
export const deleteCollectionGroup = (method = 'DELETE', data) => {
	return Request(`/api/collection-groups/${data.id}`, data, method);
};

// ======== 日历/农历 ========

// 获取今日农历信息
export const fetchCalendarToday = (method = 'GET', data) => {
	return Request(`/api/calendar/today`, data, method);
};

// ======== 每日诗词 ========

// 获取每日诗词（当天全用户同诗）
export const fetchDailyPoem = (method = 'GET', data) => {
	return Request(`/api/poems/daily`, data, method);
};

// ======== 签到/积分 ========

// 获取积分统计
export const fetchPointsStats = (method = 'GET', data) => {
	return Request(`/api/points/stats`, data, method);
};

// 获取指定月份签到日期
export const fetchMonthlyCheckins = (method = 'GET', data) => {
	return Request(`/api/points/checkins`, data, method);
};

// 每日签到
export const doCheckin = (method = 'POST', data) => {
	return Request(`/api/points/checkin`, data, method);
};

// 补签
export const doMakeup = (method = 'POST', data) => {
	return Request(`/api/points/makeup`, data, method);
};

// 积分获取记录（分页）
export const fetchPointRecords = (method = 'GET', data) => {
	return Request(`/api/points/records`, data, method);
};

// ======== 拼音 ========

// 获取诗词拼音
export const fetchPoemPinyin = (method, data) => {
	return Request(`/api/pinyin/poem`, data, method);
};

// ======== 用户 ========

// 获取用户信息
export const fetchUserInfo = (method, data = {}) => {
	return Request(`/api/user/userInfo`, data, method);
};

// 创建用户
export const createUser = (method, data) => {
	return Request('/api/user/create', data, method);
};

// 更新用户信息
export const updateUserInfo = (method, data) => {
	return Request(`/api/user/updateInfo`, data, method);
};

// ======== 学习计划 ========

// 获取学习计划列表
export const fetchSchedules = (method = 'GET', data) => {
	return Request(`/api/study-plans`, data, method);
};

// 创建学习计划
export const createSchedule = (method = 'POST', data) => {
	return Request(`/api/study-plans`, data, method);
};

// 更新学习计划
export const updateSchedule = (method = 'POST', data) => {
	return Request(`/api/study-plans/${data.id}`, data, method);
};

// 删除计划
export const deleteSchedule = (method = 'POST', data) => {
	return Request(`/api/study-plans/${data.id}`, data, method);
};

// 获取计划详情
export const fetchScheduleDetail = (method = 'GET', data) => {
	return Request(`/api/study-plans/${data.id}`, data, method);
};

// 获取计划概况
export const fetchScheduleStats = (method = 'GET', data) => {
	return Request(`/api/study-plans/stats`, data, method);
};

// 向计划中添加诗词
export const addPoemToSchedule = (method = 'POST', data) => {
	return Request(`/api/study-plans/${data.schedule_id || data.id}/poems`, data, method);
};

// 变更计划中诗词状态
export const addPoemToScheduleAgain = (method = 'POST', data) => {
	return Request(`/api/study-plans/${data.schedule_id || data.id}/poems/relearn`, data, method);
};

// 从计划中移除诗词
export const removePoemToSchedule = (method = 'POST', data) => {
	return Request(`/api/study-plans/${data.schedule_id || data.id}/poems/${data.poem_id || data.poemId}`, data, method);
};

// 诗词打卡
export const checkInPoemToSchedule = (method = 'POST', data) => {
	return Request(`/api/study-plans/${data.schedule_id || data.id}/checkin`, data, method);
};

// ======== 分类 ========

// 获取分类列表
export const fetchCatalogList = (method = 'GET', data) => {
	return Request(`/api/catalog/list`, data, method);
};

// 获取分类详情
export const fetchCatalogDetail = (method = 'GET', data) => {
	return Request(`/api/catalog/detail`, data, method);
};

// ======== 日志 ========

// 分享上报
export const shareReport = (method = 'POST', data) => {
	return Request(`/api/log/share_report`, data, method);
};
