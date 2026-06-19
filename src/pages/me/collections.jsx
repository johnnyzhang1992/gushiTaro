import { View, Text } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { Button } from '@nutui/nutui-react-taro';

import PoemPlaylistCard from '../../components/PoemPlaylistCard';
import { fetchCollections, createCollection } from '../../services/global';
import CollectionModal from '../../components/CollectionModal';

import './collection.scss';

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

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
    setShowCreate(true);
  };

  usePullDownRefresh(() => {
    queryPlaylists();
  });

  useEffect(() => {
    queryPlaylists();
  }, []);

  if (isLoading) {
    return (
      <View className='page playlists-page'>
        <View className='loading'>加载中...</View>
      </View>
    );
  }

  if (error) {
    return (
      <View className='page playlists-page'>
        <View className='pageError'>Error: {error.message}</View>
      </View>
    );
  }

  return (
    <View className='page playlists-page'>
      <View className='header'>
        <View className='list-count'>诗单 {playlists.length}</View>
        <Button
          className='create-btn'
          type='primary'
          size='small'
          onClick={handleCreate}
        >
          + 新建诗单
        </Button>
      </View>

      {playlists.length === 0 ? (
        <View className='empty'>
          <Text>暂无诗单，点击右上角创建</Text>
        </View>
      ) : (
        <View className='playlist-list'>
          {playlists.map((item) => (
            <PoemPlaylistCard key={item.id} playlist={item} />
          ))}
        </View>
      )}

      <CollectionModal
        show={showCreate}
        initType='create_collection'
        onSuccess={() => {
          setShowCreate(false);
          queryPlaylists();
        }}
        onClose={() => setShowCreate(false)}
      />
    </View>
  );
};

export default PlaylistsPage;
