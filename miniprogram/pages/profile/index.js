// pages/profile/index.js v0.6.0
const app = getApp()

Page({
  data: {
    userInfo: null,
    subscription: null,
    subscriberText: '未订阅',
    planLabel: '',
    expireText: '',
    isSubscribed: false,
    loading: true
  },

  onLoad() {
    this.loadProfile()
  },

  onShow() {
    this.loadSubscription()
  },

  async loadProfile() {
    try {
      const res = await wx.cloud.callFunction({ name: 'getUserProfile' })
      if (res.result && res.result.code === 0) {
        const data = res.result.data || {}
        this.setData({
          userInfo: {
            nickname: data.nickname || '玄机用户',
            avatar: data.avatar || '/assets/default-avatar.png'
          }
        })
      }
    } catch (err) {
      console.error('[getUserProfile]', err)
    }
    this.loadSubscription()
  },

  async loadSubscription() {
    this.setData({ loading: true })
    try {
      const res = await wx.cloud.callFunction({ name: 'getUserProfile' })
      if (res.result && res.result.code === 0) {
        const sub = res.result.subscription
        if (sub && sub.status === 'active') {
          const endDate = new Date(sub.end_at)
          const now = new Date()
          const isActive = endDate > now
          this.setData({
            subscription: sub,
            isSubscribed: isActive,
            subscriberText: isActive ? '已订阅' : '已过期',
            planLabel: sub.plan === 'yearly' ? '年度订阅' : '月度订阅',
            expireText: `到期时间：${this.formatDate(endDate)}`,
            loading: false
          })
          return
        }
      }
    } catch (err) {
      console.error('[loadSubscription]', err)
    }
    this.setData({ loading: false })
  },

  formatDate(date) {
    const y = date.getFullYear()
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const d = date.getDate().toString().padStart(2, '0')
    return `${y}-${m}-${d}`
  },

  async onSubscribe(e) {
    const plan = e.currentTarget.dataset.plan
    wx.showLoading({ title: '创建订单...' })
    try {
      const res = await wx.cloud.callFunction({ name: 'subscribe', data: { plan } })
      wx.hideLoading()
      if (res.result.code === 0) {
        const payment = res.result.data
        wx.requestPayment({
          timeStamp: payment.timeStamp,
          nonceStr: payment.nonceStr,
          package: payment.package,
          signType: payment.signType || 'MD5',
          paySign: payment.paySign,
          success: () => {
            wx.showToast({ title: '订阅成功', icon: 'success' })
            setTimeout(() => this.loadSubscription(), 1500)
          },
          fail: (err) => {
            if (err.errMsg.indexOf('cancel') === -1) {
              wx.showToast({ title: '支付失败', icon: 'none' })
            }
          }
        })
      } else {
        wx.showToast({ title: res.result.msg || '创建订单失败', icon: 'none' })
      }
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '网络异常', icon: 'none' })
    }
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/history/index' })
  }
})
