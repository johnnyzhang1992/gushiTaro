import Request from '../apis/request';

// 诗人足迹列表（仅有时间线的诗人，按热度排序）
export const fetchStoryMapPoets = (method = 'GET', data) => {
	return Request('/api/timeline/poets', data, method);
};

// 诗人故事详情（人生阶段 + 足迹时间线 + 统计）
export const fetchPoetStory = (method = 'GET', data) => {
	return Request('/api/timeline/poet', data, method);
};
