let _cached = null

export function isSkyline() {
  if (_cached !== null) return _cached
  try {
    _cached = wx.getRenderer?.() === 'skyline'
  } catch {
    _cached = false
  }
  return _cached
}
