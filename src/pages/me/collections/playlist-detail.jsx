import { View, Text } from '@tarojs/components';
import { useState, useRef } from 'react';
import Taro, { useLoad, usePullDownRefresh } from '@tarojs/taro';
import { Button } from '@nutui/nutui-react-taro';

import PoemSmallCard from '../../../components/PoemSmallCard';
import { fetchCollections } from '../../../services/global';

import './playlist-detail.scss';

const PlaylistDetail = () => {
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playlistName, setPlaylistName] = useState('');
  const idRef = useRef(null);

  useLoad((options) => {
    idRef.current = options.id;
    setPlaylistName(options.name || '诗单详情');
    Taro.setNavigationBarTitle({ title: options.name || '诗单详情' });
    fetchDetail(options.id);
  });

  usePullDownRefresh(() => {
    if (idRef.current) fetchDetail(idRef.current);
    Taro.stopPullDownRefresh();
  });

  const fetchDetail = async (id) => {
    setLoading(true);
    const res = await fetchCollections('GET', { id });
    if (res && (res.status || res.statusCode === 200)) {
      const apiData = res.data?.data || res.data;
      setPoems(apiData.poems || []);
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
        poems.map((poem, index) => (
          <View
            key={poem.id || poem._id}
            className='poem-item'
            style={index < poems.length - 1 ? { borderBottom: '1px solid rgba(228,230,235,0.5)' } : {}}
          >
            <PoemSmallCard {...poem} hideBorder showBorder={false} />
          </View>
        ))
      )}
    </View>
  );
};

export default PlaylistDetail;
