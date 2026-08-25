import { View, Text } from '@tarojs/components';
import { useState, useRef } from 'react';
import Taro, { useLoad, usePullDownRefresh } from '@tarojs/taro';
import { Button } from '@nutui/nutui-react-taro';

import PoemSmallCard from '../../../components/PoemSmallCard';
import Request from '../../../apis/request';

import './playlist-detail.scss';

const PlaylistDetail = () => {
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playlistName, setPlaylistName] = useState('');
  const idRef = useRef(null);

  useLoad((options) => {
    idRef.current = options.id;
    const name = decodeURIComponent(options.name || '诗单详情');
    setPlaylistName(name);
    Taro.setNavigationBarTitle({ title: name });
    fetchDetail(options.id);
  });

  usePullDownRefresh(() => {
    if (idRef.current) fetchDetail(idRef.current);
    Taro.stopPullDownRefresh();
  });

  const fetchDetail = async (id) => {
    setLoading(true);
    try {
      const res = await Request(`/api/collections/${id}`, {}, 'GET');
      if (res && res.status && res.data) {
        setPoems(res.data.poems || []);
        // 如果 URL 没有传 name，从接口获取
        if (!idRef.current || !playlistName) {
          setPlaylistName(res.data.collection_name || '诗单详情');
          Taro.setNavigationBarTitle({ title: res.data.collection_name || '诗单详情' });
        }
      }
    } catch (err) {
      console.error('加载失败:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View className='page playlist-detail-page'>
        <View className='loading'>加载中...</View>
      </View>
    );
  }

  return (
    <View className='page playlist-detail-page'>
      <View className='header-info'>
        <Text className='count'>共 {poems.length} 首 · {playlistName}</Text>
      </View>
      {poems.length === 0 ? (
        <View className='empty'>诗单还没有作品，去首页逛逛吧</View>
      ) : (
        poems.map((item, index) => {
          const poem = item.poem || item;
          return (
            <View
              key={poem._id || poem.id || index}
              className='poem-item'
              style={index < poems.length - 1 ? { borderBottom: '1px solid rgba(228,230,235,0.5)' } : {}}
            >
              <PoemSmallCard {...poem} hideBorder showBorder={false} />
            </View>
          );
        })
      )}
    </View>
  );
};

export default PlaylistDetail;
