import { View, Text } from '@tarojs/components'
import { useState, useCallback, useRef } from 'react'
import Taro, { useLoad, useDidShow, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { fetchPointsStats, doCheckin, fetchPointRecords } from '../../services/global'

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
  const [records, setRecords] = useState([])
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [todayStr] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  const [checking, setChecking] = useState(false)
  const [bonus, setBonus] = useState(null)
  const [recordsLoading, setRecordsLoading] = useState(false)
  const recordsPagination = useRef({ page: 1, last_page: 1, total: 0 })

  const loadStats = useCallback(async () => {
    try {
      const res = await fetchPointsStats('GET', {})
      const d = res?.data || res
      if (d && d.totalPoints !== undefined) setStats(d)
    } catch (e) {
      console.log('fetchPointsStats error', e)
    }
  }, [])

  // 加载积分记录（分页）
  const loadRecords = useCallback((reset = false) => {
    const pg = recordsPagination.current
    if (recordsLoading) return
    const nextPage = reset ? 1 : pg.page + 1
    if (!reset && nextPage > pg.last_page) return
    setRecordsLoading(true)
    fetchPointRecords('GET', { page: nextPage, size: 10 })
      .then((res) => {
        const d = res?.data || res
        if (d && d.list) {
          recordsPagination.current = {
            page: d.current_page,
            last_page: d.last_page,
            total: d.total,
          }
          setRecords((prev) => (reset ? d.list : [...prev, ...d.list]))
        }
      })
      .catch(() => {})
      .finally(() => setRecordsLoading(false))
  }, [recordsLoading])

  useLoad(() => {
    loadStats()
    loadRecords(true)
  })

  useDidShow(() => {
    loadStats()
    if (records.length === 0) loadRecords(true)
  })

  usePullDownRefresh(() => {
    Promise.all([loadStats(), loadRecords(true)]).finally(() => {
      Taro.stopPullDownRefresh()
    })
  })

  // 触底加载更多
  useReachBottom(() => {
    const pg = recordsPagination.current
    if (records.length > 0 && pg.page < pg.last_page) {
      loadRecords()
    }
  })

  const todayChecked = stats.monthlyCheckins?.includes(todayStr)

  const handleCheckin = async () => {
    if (checking || todayChecked) return
    setChecking(true)
    try {
      const res = await doCheckin('POST', {})
      const d = res?.data || res.data
      if (d && d.totalEarned !== undefined) {
        setBonus(d)
        Taro.showToast({ title: `签到成功 +${d.totalEarned}分`, icon: 'success' })
        loadStats()
        loadRecords(true)
        setTimeout(() => setBonus(null), 2000)
      } else {
        Taro.showToast({ title: res?.msg || '签到失败', icon: 'none' })
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

  // 积分记录展示文案
  const formatRecordDesc = (r) => {
    if (r.description) return r.description
    const map = { checkin: '每日签到', makeup: '补签' }
    return map[r.source] || '积分获取'
  }
  const formatRecordTime = (r) => {
    if (!r.createdAt) return ''
    const d = new Date(r.createdAt)
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <View className='page checkinPage'>
      {/* 统计头部 */}
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

      {/* 日历 */}
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

      {/* 签到按钮 */}
      <View className={`checkin-btn-wrap`}>
        <View className={`checkin-btn ${todayChecked ? 'done' : ''}`} onClick={handleCheckin}>
          <Text className='btn-text'>
            {todayChecked ? '今日已签到' : checking ? '签到中...' : bonus ? `+${bonus.totalEarned} 签到成功` : '立即签到'}
          </Text>
        </View>
      </View>

      {/* 积分获取列表 */}
      <View className='records-section'>
        <View className='records-title'>
          <Text className='title-text'>积分获取记录</Text>
          <Text className='total-text'>共 {recordsPagination.current.total} 条</Text>
        </View>
        {records.length === 0 && !recordsLoading ? (
          <View className='records-empty'>
            <Text className='empty-text'>暂无积分记录</Text>
          </View>
        ) : (
          records.map((r, i) => (
            <View key={r._id || i} className='record-item'>
              <View className='record-left'>
                <Text className='record-desc'>{formatRecordDesc(r)}</Text>
                <Text className='record-time'>{formatRecordTime(r)}</Text>
              </View>
              <Text className='record-pts'>+{r.points}</Text>
            </View>
          ))
        )}
        {recordsLoading ? (
          <View className='records-loading'>
            <Text className='loading-text'>加载中...</Text>
          </View>
        ) : null}
        {!recordsLoading && records.length > 0 && recordsPagination.current.page >= recordsPagination.current.last_page ? (
          <View className='records-end'>
            <Text className='end-text'>没有更多了</Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}

export default CheckinPage