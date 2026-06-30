// pages/history/index.js v1.0.0
Page({
  data: {
    list: [],
    total: 0,
    hasMore: false,
    pageSize: 20,
    currentPage: 0
  },

  onLoad() {
    this.loadHistory()
  },

  async loadHistory(append = false) {
    const page = append ? this.data.currentPage + 1 : 1
    wx.showNavigationBarLoading()

    try {
      const db = wx.cloud.database()
      const res = await db.collection('readings')
        .orderBy('created_at', 'desc')
        .skip((page - 1) * this.data.pageSize)
        .limit(this.data.pageSize)
        .get()

      wx.hideNavigationBarLoading()

      const items = (res.data || []).map(item => ({
        ...item,
        createdAtStr: this.formatTime(item.created_at),
        preview: this.truncatePreview(item.interpretation || item.result || '')
      }))

      const newList = append ? [...this.data.list, ...items] : items
      const total = (res.data || []).length
      this.setData({
        list: newList,
        total: append ? this.data.total + total : total,
        currentPage: page,
        hasMore: total >= this.data.pageSize
      })
    } catch (err) {
      wx.hideNavigationBarLoading()
      console.error('[loadHistory]', err)
      if (!append) {
        this.setData({ list: [], total: 0, hasMore: false })
      }
    }
  },

  loadMore() {
    if (!this.data.hasMore) return
    this.loadHistory(true)
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/result/index?id=${id}`
    })
  },

  formatTime(ts) {
    if (!ts) return ''
    const d = new Date(ts)
    const now = new Date()
    const diff = now - d

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`

    const y = d.getFullYear()
    const m = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    const h = d.getHours().toString().padStart(2, '0')
    const min = d.getMinutes().toString().padStart(2, '0')
    return `${y}-${m}-${day} ${h}:${min}`
  },

  truncatePreview(text) {
    if (!text) return '暂无解读预览'
    if (typeof text !== 'string') {
      try { text = JSON.stringify(text) } catch (e) { return '暂无解读预览' }
    }
    return text.length > 50 ? text.slice(0, 50) + '...' : text
  }
})