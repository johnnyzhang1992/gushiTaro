import { View, Text, Navigator } from '@tarojs/components';
import Taro, { useRouter, useLoad, usePullDownRefresh } from '@tarojs/taro';
import { useState } from 'react';

import { fetchCollectionGroups, fetchCollections } from '../../services/study';

import './collection-group.scss';

const CollectionGroupPage = () => {
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
        if (groupRes && groupRes.status && groupRes.data) {
          setGroup(groupRes.data);
          setCollections(groupRes.data.collections || []);
        }
        // getGroup 已附带 collections；若为空则用 getCollections 兜底
        if (colRes && colRes.status && colRes.data) {
          const list = colRes.data?.list || [];
          if (list.length > 0 && collections.length === 0) setCollections(list);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useLoad(() => loadData());
  usePullDownRefresh(() => {
    loadData();
    Taro.stopPullDownRefresh();
  });

  // 数字转中文
const numToChinese = (n) => {
	if (n === 0 || n == null) return '零'
	const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
	n = Number(n)
	if (n < 10) return digits[n]
	if (n < 20) return '十' + (n % 10 === 0 ? '' : digits[n % 10])
	if (n < 100) {
		const t = Math.floor(n / 10)
		const o = n % 10
		return digits[t] + '十' + (o === 0 ? '' : digits[o])
	}
	return String(n)
}

// 名称处理：剥掉分组名前缀
  const displayName = (name = '') => {
    let n = name || '';
    // 先剥掉分组名前缀（可能带分隔符）
    if (groupName && n.includes(groupName)) {
      n = n.slice(n.indexOf(groupName) + groupName.length);
    }
    // 循环去除开头残留的 · / ： / : 符号及空白（兼容多层）
    n = n.replace(/^[·：:\s]+/, '');
    // 全角冒号统一为 ·
    n = n.replace(/：/g, '·');
    return n;
  };

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
              <Navigator
                key={c._id}
                className='bookCard'
                hoverClass='none'
                url={`/pages/library/collection-detail?id=${c._id}`}
              >
                <View className='bookCover'>
                  <View className='coverBody'>
                    <Text className='coverName'>
                      {displayName(c.collection_name)}
                    </Text>
                    <Text className='coverCount'>
                      {numToChinese(c.poem_count)}首
                    </Text>
                  </View>
                  <View className='coverBar' />
                </View>
              </Navigator>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default CollectionGroupPage;
