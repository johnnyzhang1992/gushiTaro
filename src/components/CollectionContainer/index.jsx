import { View, Text, Navigator, ScrollView } from '@tarojs/components';
import { useState, useEffect } from 'react';

import { fetchCollectionGroups } from '../../services/study';
import Skeleton from '../Skeleton';

import './style.scss';

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

// 竖排分列：每列 perCol 个字，列间从左到右（古籍排版）
const splitColumns = (chars, perCol = 5) => {
	const cols = []
	for (let i = 0; i < chars.length; i += perCol) {
		cols.push(chars.slice(i, i + perCol))
	}
	return cols
}

// 名称处理：剥掉分组名前缀、全角冒号转 ·
const getDisplayName = (name = '', groupName = '') => {
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

const CollectionContainer = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchCollectionGroups('GET', { with_collections: true })
      .then((res) => {
        if (res && res.status && res.data) {
          setGroups(res.data?.data || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading && groups.length === 0) {
    return (
      <View className='collectionContainer'>
        <Skeleton rows={6} />
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View className='collectionContainer'>
        <View className='emptyTip'>
          <Text>暂无诗单分组</Text>
        </View>
      </View>
    );
  }

  return (
    <View className='collectionContainer' id='collectionScrollContainer'>
      <ScrollView className='scrollContainer' scrollY enhanced showScrollbar={false} enableBackToTop>
        {groups.map((group) => (
          <View key={group._id} className='groupSection'>
            {/* 分组头部 */}
            <View className='groupHeader'>
              <Text className='groupName'>{group.group_name}</Text>
              <Navigator
                className='groupMore'
                hoverClass='none'
                url={`/pages/library/collection-group?id=${group._id}&name=${encodeURIComponent(
                  group.group_name
                )}`}
              >
                查看全部 ›
              </Navigator>
            </View>
            {/* 诗单封面横向滚动 */}
            <ScrollView className='collectionScroll' scrollX enableFlex showScrollbar={false}>
              {(group.collections || []).slice(0, 10).map((c) => (
                <Navigator
                  key={c._id}
                  className='bookCard'
                  hoverClass='none'
                  url={`/pages/library/collection-detail?id=${c._id}`}
                >
                  <View className='bookCover'>
										<View className='coverBody'>
											<Text className='coverName'>
												{getDisplayName(c.collection_name, group.group_name)}
											</Text>
											<Text className='coverCount'>
												{numToChinese(c.poem_count)}首
											</Text>
										</View>
										<View className='coverBar' />
									</View>
</Navigator>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CollectionContainer;