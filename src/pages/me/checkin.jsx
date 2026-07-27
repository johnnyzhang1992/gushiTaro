import { View, Text } from '@tarojs/components'
import { useState, useCallback } from 'react'
import Taro, { useLoad, useDidShow } from '@tarojs/taro'
import { fetchPointsStats, doCheckin } from '../../services/global'

import './checkin.scss'

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

const CheckinPage = () => {
  const [stats, setStats] = useState({
    totalPoints: 0,
    availablePoints: 0,
    checkinDays: 0,
    checkinStreak: 0,
    lastCheckinDate: '',
    makeupCardCount: 0,
    monthlyCheckins: [],
  })
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [todayStr] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  const [checking, setChecking] = useState(false)
  const [bonus, setBonus] = useState(null)

  const loadStats = useCallback(async () => {
    try {
      const res = await fetchPointsStats('GET', {})
      const d = res.data?.data || res.data
      if (d && d.totalPoints !== undefined) setStats(d)
    } catch (e) {
      console.log('fetchPointsStats error', e)
    }
  }, [])

  useLoad(() => { loadStats() })
  useDidShow(() => { loadStats() })

  const todayChecked = stats.monthlyCheckins?.includes(todayStr)

  const handleCheckin = async () => {
    if (checking || todayChecked) return
    setChecking(true)
    try {
      const res = await doCheckin('POST', {})
      const d = res.data?.data || res.data
      if (d && d.totalEarned !== undefined) {
        setBonus(d)
        Taro.showToast({ title: `签到成功 +${d.totalEarned}分`, icon: 'success' })
        loadStats()
        setTimeout(() => setBonus(null), 2000)
      } else {
        Taro.showToast({ title: res.data?.msg || '签到失败', icon: 'none' })
      }
    } catch (e) {
      Taro.showToast({ title: '签到失败', icon: 'none' })
    }
    setChecking(false)
  }

  // 日历网格
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDay = new Date(year, month - 1, 1).getDay()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, dateStr: ds, checked: stats.monthlyCheckins?.includes(ds), isToday: ds === todayStr })
  }

  return (
    <View className='page checkinPage'>
      <View className='header'>
        <View className='streak'>
          <Text className='num'>{stats.checkinStreak || 0}</Text>
          <Text className='label'>连续签到(天)</Text>
        </View>
        <View className='total'>
          <Text className='num'>{stats.totalPoints || 0}</Text>
          <Text className='label'>总积分</Text>
        </View>
        <View className='makeup'>
          <Text className='num'>{stats.makeupCardCount || 0}</Text>
          <Text className='label'>补签卡</Text>
        </View>
      </View>

      <View className='calendar'>
        <View className='month-nav'>
          <Text className='arrow' onClick={() => {
            if (month === 1) { setYear(y => y - 1); setMonth(12) }
            else setMonth(m => m - 1)
          }}>‹</Text>
          <Text className='title'>{year}年{month}月</Text>
          <Text className='arrow' onClick={() => {
            const now = new Date()
            if (year >= now.getFullYear() && month >= now.getMonth() + 1) return
            if (month === 12) { setYear(y => y + 1); setMonth(1) }
            else setMonth(m => m + 1)
          }}>›</Text>
        </View>
        <View className='weekdays'>
          {WEEK_DAYS.map(w => <Text key={w} className='wd'>{w}</Text>)}
        </View>
        <View className='grid'>
          {cells.map((cell, i) =>
            cell ? (
              <View key={i} className={`day ${cell.checked ? 'checked' : ''} ${cell.isToday ? 'today' : ''}`}>
                <Text className='num'>{cell.day}</Text>
                {cell.checked && <Text className='dot'>✓</Text>}
              </View>
            ) : (
              <View key={i} className='day empty' />
            )
          )}
        </View>
      </View>

      <View className={`checkin-btn ${todayChecked ? 'done' : ''}`} onClick={handleCheckin}>
        <Text>{todayChecked ? '今日已签到' : bonus ? `+${bonus.totalEarned}` : '签到'}</Text>
      </View>

      {bonus && bonus.bonuses?.length > 0 && (
        <View className='bonus-list'>
          {bonus.bonuses.map((b, i) => (
            <View key={i} className='bonus-item'>
              <Text className='desc'>{b.description}</Text>
              <Text className='pts'>+{b.points}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

export default CheckinPage
