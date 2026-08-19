import { View, Text } from '@tarojs/components';
import { useState } from 'react';
import './swipe-action.scss';

export default function SwipeAction({ children, onDelete }) {
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isOpened, setIsOpened] = useState(false);

  const DELETE_BTN_WIDTH = 62; // 删除按钮实际显示宽度 px

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    
    // 向左滑动
    if (diff < 0) {
      const newOffset = Math.max(diff, -DELETE_BTN_WIDTH);
      setOffsetX(newOffset);
      setIsOpened(newOffset <= -DELETE_BTN_WIDTH / 2);
    } else if (isOpened) {
      // 向右滑动且已展开，关闭
      setOffsetX(0);
      setIsOpened(false);
    }
  };

  const handleTouchEnd = () => {
    if (isOpened) {
      setOffsetX(-DELETE_BTN_WIDTH);
    } else {
      setOffsetX(0);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
    setOffsetX(0);
    setIsOpened(false);
  };

  return (
    <View className="swipe-container">
      <View
        className="swipe-wrapper"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <View className="swipe-content">
          {children}
        </View>
        <View className="swipe-actions">
          <View className="swipe-btn-delete" onClick={handleDelete}>
            <Text className="swipe-btn-text">删除</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
