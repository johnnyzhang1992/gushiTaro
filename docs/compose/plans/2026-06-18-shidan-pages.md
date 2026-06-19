# 诗单功能页面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旧收藏集列表页重写为诗单页面，支持诗单列表、详情、排序、封面

**Architecture:** 基于 Taro + React + NutUI，复用现有 API (`/api/collections/*`)；保留原 `pages/me/collections.jsx` 页面路径，内部完全重写；新增诗单详情路由

**Tech Stack:** Taro 3.6.25, React 18, NutUI 3, SCSS

---

### Task 1: 诗单列表页 — 重写 collections.jsx

**Files:**
- Modify: `src/pages/me/collections.jsx` — 完全重写
- Modify: `src/pages/me/collection.scss` — 更新样式
- Modify: `src/components/CollectionSmallCard/index.jsx` — 升级为诗单卡片（支持封面图）
- Modify: `src/components/CollectionSmallCard/style.scss` — 卡片样式更新

- [ ] **Step 1: 重写诗单列表页**

`src/pages/me/collections.jsx` 替换为：

```jsx
import { View, Text, Image } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { Button } from '@nutui/nutui-react-taro';

import PoemPlaylistCard from '../../components/PoemPlaylistCard';
import { fetchCollections } from '../../services/global';

import './collection.scss';

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const queryPlaylists = async () => {
    try {
      const res = await fetchCollections('GET');
      if (res.statusCode !== 200) throw new Error('Network response was not ok');
      const apiData = res.data?.data || res.data;
      setPlaylists(apiData.list || apiData.collections || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      Taro.stopPullDownRefresh();
    }
  };

  const handleCreate = () => {
    Taro.navigateTo({ url: '/pages/me/collections/edit?type=create' });
  };

  usePullDownRefresh(() => { queryPlaylists(); });
  useEffect(() => { queryPlaylists(); }, []);

  if (isLoading) return <View className='loading'>加载中...</View>;
  if (error) return <View className='pageError'>Error: {error.message}</View>;

  return (
    <View className='page playlists-page'>
      <View className='header'>
        <View className='list-count'>诗单 {playlists.length}</View>
        <Button className='create-btn' type='primary' size='small' onClick={handleCreate}>
          + 新建诗单
        </Button>
      </View>
      {playlists.length === 0 ? (
        <View className='empty'>暂无诗单，点击右上角创建</View>
      ) : (
        playlists.map((item) => (
          <PoemPlaylistCard key={item.id} playlist={item} />
        ))
      )}
    </View>
  );
};

export default PlaylistsPage;
```

- [ ] **Step 2: 更新页面样式**

`src/pages/me/collection.scss` 替换为：

```scss
.playlists-page {
  padding: 20px;
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    .list-count {
      font-size: 28px;
      color: #8a919f;
    }
  }
  .empty {
    text-align: center;
    padding: 80px 0;
    color: #c0c4cc;
    font-size: 28px;
  }
}
```

- [ ] **Step 3: 创建 PoemPlaylistCard 组件**

Create `src/components/PoemPlaylistCard/index.jsx`:

```jsx
import { View, Text, Image, Navigator } from '@tarojs/components';
import './style.scss';

const PoemPlaylistCard = (props) => {
  const { playlist = {} } = props;
  const { collection_name, poem_count, cover_url, id, update_time } = playlist;
  return (
    <Navigator
      className='poem-playlist-card'
      url={`/pages/me/playlist-detail?id=${id}&name=${encodeURIComponent(collection_name)}`}
      hoverClass='none'
    >
      <View className='card-cover'>
        {cover_url ? (
          <Image src={cover_url} className='cover-img' mode='aspectFill' />
        ) : (
          <View className='cover-placeholder'>
            <Text className='placeholder-icon'>📖</Text>
          </View>
        )}
      </View>
      <View className='card-info'>
        <Text className='card-title'>{collection_name}</Text>
        <View className='card-meta'>
          <Text className='poem-count'>{poem_count || 0} 首</Text>
          {update_time ? <Text className='update-time'>{update_time}</Text> : null}
        </View>
      </View>
    </Navigator>
  );
};

export default PoemPlaylistCard;
```

- [ ] **Step 4: PoemPlaylistCard 样式**

`src/components/PoemPlaylistCard/style.scss`:

```scss
.poem-playlist-card {
  display: flex;
  padding: 24px 0;
  border-bottom: 1px solid rgba(228, 230, 235, 0.5);
  .card-cover {
    width: 120px;
    height: 120px;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
    margin-right: 20px;
    .cover-img {
      width: 100%;
      height: 100%;
    }
    .cover-placeholder {
      width: 100%;
      height: 100%;
      background: #f2f3f5;
      display: flex;
      align-items: center;
      justify-content: center;
      .placeholder-icon {
        font-size: 40px;
      }
    }
  }
  .card-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .card-title {
      font-size: 32px;
      font-weight: 500;
      color: #252933;
      margin-bottom: 12px;
    }
    .card-meta {
      display: flex;
      align-items: center;
      font-size: 24px;
      color: #8a919f;
      .update-time {
        margin-left: 16px;
      }
    }
  }
}
```

- [ ] **Step 5: 更新 app.config.js 添加新路由**

`src/app.config.js` — 在 pages 数组中新增：
```
'pages/me/playlist-detail',
```

---

### Task 2: 诗单详情页 — 新增页面

**Files:**
- Create: `src/pages/me/playlist-detail.jsx`
- Create: `src/pages/me/playlist-detail.scss`
- Modify: `src/services/global.js` — 添加 fetchCollectionDetail / 更新/删除接口

- [ ] **Step 6: 创建诗单详情页**

`src/pages/me/playlist-detail.jsx`:

```jsx
import { View, Text } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro, { useLoad, usePullDownRefresh } from '@tarojs/taro';
import { Button, Dialog } from '@nutui/nutui-react-taro';
import { fetchCollections, updateCollection } from '../../services/global';
import PoemSmallCard from '../../components/PoemSmallCard';
import './playlist-detail.scss';

const PlaylistDetail = () => {
  const [playlist, setPlaylist] = useState(null);
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deletePoemId, setDeletePoemId] = useState(null);
  const playlistIdRef = { current: null };

  useLoad((options) => {
    playlistIdRef.current = options.id;
    Taro.setNavigationBarTitle({ title: options.name || '诗单详情' });
    fetchDetail(options.id);
  });

  usePullDownRefresh(() => {
    fetchDetail(playlistIdRef.current);
    Taro.stopPullDownRefresh();
  });

  const fetchDetail = async (id) => {
    setLoading(true);
    const res = await fetchCollections('GET', { id });
    if (res && res.statusCode === 200) {
      const apiData = res.data?.data || res.data;
      setPlaylist(apiData);
      setPoems(apiData.poems || []);
    }
    setLoading(false);
  };

  const handleRemovePoem = (poemId) => {
    setDeletePoemId(poemId);
    setShowDelete(true);
  };

  const confirmRemove = async () => {
    await updateCollection('POST', {
      id: playlistIdRef.current,
      poem_id: deletePoemId,
      action: 'remove',
    });
    setShowDelete(false);
    fetchDetail(playlistIdRef.current);
  };

  const getItemStyle = (index) => ({
    padding: '20px 0',
    borderBottom: index < poems.length - 1 ? '1px solid rgba(228,230,235,0.5)' : 'none',
  });

  if (loading) return <View className='loading'>加载中...</View>;

  return (
    <View className='page playlist-detail'>
      <View className='header-info'>
        <Text className='count'>共 {poems.length} 首</Text>
      </View>
      {poems.map((poem, index) => (
        <View key={poem.id || poem._id} style={getItemStyle(index)}>
          <PoemSmallCard {...poem} />
        </View>
      ))}
      <Dialog
        visible={showDelete}
        title='确认删除'
        content='确定从诗单中移除该作品？'
        onConfirm={confirmRemove}
        onCancel={() => setShowDelete(false)}
      />
    </View>
  );
};

export default PlaylistDetail;
```

- [ ] **Step 7: 详情页样式**

`src/pages/me/playlist-detail.scss`:

```scss
.playlist-detail {
  padding: 20px;
  .header-info {
    padding: 16px 0;
    .count {
      font-size: 26px;
      color: #8a919f;
    }
  }
}
```

---

### Task 3: 页面入口和导航更新

- [ ] **Step 8: 更新"我"的页面**

`src/pages/me/index.jsx` — 将"收藏集"导航改为"诗单"，链接到新页面：

Edit line 292:
```
url='/pages/me/collections'  // unchanged — our rewrite keeps this path
```

- [ ] **Step 9: 构建验证**

Run: `npx taro build --type weapp 2>&1 | grep -E "Compiled successfully|Error: ∥✖ Errors"`
Expected: Build succeeds
