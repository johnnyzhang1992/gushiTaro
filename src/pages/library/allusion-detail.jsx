import { useState } from 'react';
import Taro, { useRouter, useLoad, usePullDownRefresh } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';

import Request from '../../apis/request';
import LikeButton from '../../components/LikeButton';
import CollectButton from '../../components/CollectButton';

import './allusion-detail.scss';

const AllusionDetail = () => {
  const router = useRouter();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDetail = (id) => {
    if (!id) return;
    setLoading(true);
    Taro.showLoading({ title: '加载中' });

    Request(`/api/allusions/${id}`, {}, 'GET')
      .then((res) => {
        if (res && res.status && res.data) {
          setDetail(res.data);
          Taro.setNavigationBarTitle({ title: res.data.name || '典故详情' });
        }
      })
      .catch((err) => {
        console.log(err);
        Taro.showToast({ title: '加载失败', icon: 'none' });
      })
      .finally(() => {
        setLoading(false);
        Taro.hideLoading();
      });
  };

  useLoad((options) => {
    fetchDetail(options.id);
  });

  usePullDownRefresh(() => {
    fetchDetail(router.params.id);
    Taro.stopPullDownRefresh();
  });

  if (!detail) return null;

  return (
    <View className='page allusionDetail'>
      {/* 典故名称 + 点赞收藏 */}
      <View className='allusionHeader'>
        <View className='headerTop'>
          <Text className='allusionName'>{detail.name}</Text>
          <View className='actionBtns'>
            <LikeButton
              type='allusion'
              id={detail._id}
              count={detail.like_count}
              status={detail.isLiked}
              showText={false}
            />
            <CollectButton
              type='allusion'
              id={detail._id}
              count={detail.collect_count}
              status={detail.isFavorited}
              showText={false}
            />
          </View>
        </View>
        {detail.aliases && detail.aliases.length > 0 ? (
          <View className='allusionAliases'>
            <Text className='label'>别称：</Text>
            <Text>{detail.aliases.join('、')}</Text>
          </View>
        ) : null}
      </View>

      {/* 相关人物 */}
      {detail.relatedPeople && detail.relatedPeople.length > 0 ? (
        <View className='section'>
          <Text className='sectionTitle'>相关人物</Text>
          <View className='tagList'>
            {detail.relatedPeople.map((person, index) => (
              <Text key={index} className='tag'>{person}</Text>
            ))}
          </View>
        </View>
      ) : null}

      {/* 出处 */}
      {detail.sourceBooks && detail.sourceBooks.length > 0 ? (
        <View className='section'>
          <Text className='sectionTitle'>出处典籍</Text>
          {detail.sourceBooks.map((book, index) => (
            <View key={index} className='sourceItem'>
              <Text className='sourceTitle'>{book.title}</Text>
              {book.content ? (
                <Text className='sourceContent'>{book.content}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {/* 摘要 */}
      {detail.summary ? (
        <View className='section'>
          <Text className='sectionTitle'>释义</Text>
          <Text className='summary'>{detail.summary}</Text>
        </View>
      ) : null}

      {/* 诗词引用 */}
      {detail.examples && detail.examples.length > 0 ? (
        <View className='section'>
          <Text className='sectionTitle'>诗词用例</Text>
          {detail.examples.map((example, index) => (
            <View key={index} className='exampleItem'>
              <Text className='verse'>{example.verse}</Text>
              <Text className='poemInfo'>—— {example.author}《{example.poemTitle}》</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default AllusionDetail;
