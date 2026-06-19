import { View, Text, Image, Navigator } from '@tarojs/components';
import './style.scss';

const PoemPlaylistCard = (props) => {
  const { playlist = {}, simple } = props;
  const { collection_name, poem_count, cover_url, id, update_time } = playlist;

  if (simple) {
    return (
      <Navigator
        className='poem-playlist-card simple'
        url={`/pages/me/collections/playlist-detail?id=${id}&name=${encodeURIComponent(collection_name)}`}
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
          <Text className='poem-count'>{poem_count || 0} 首</Text>
        </View>
        <View className='chevron-right'></View>
      </Navigator>
    );
  }

  return (
    <Navigator
      className='poem-playlist-card'
      url={`/pages/me/collections/playlist-detail?id=${id}&name=${encodeURIComponent(collection_name)}`}
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
          {update_time ? <Text className='update-time'>· {update_time}</Text> : null}
        </View>
      </View>
    </Navigator>
  );
};

export default PoemPlaylistCard;
