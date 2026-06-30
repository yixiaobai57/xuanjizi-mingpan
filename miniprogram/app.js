// miniprogram/app.js v1.0.0
App({
  onLaunch() {
    // 仅当配置了真实 appid 时才初始化云开发（无 appid 时 cloud.init 会报不可捕获错误）
    if (wx.cloud && this._hasAppId()) {
      wx.cloud.init({ traceUser: true })
    }
  },

  _hasAppId() {
    try {
      const info = wx.getAccountInfoSync ? wx.getAccountInfoSync() : null;
      return !!(info && info.miniProgram && info.miniProgram.appId);
    } catch (e) {
      return false;
    }
  },
  globalData: {
    userInfo: null,
    freeUsed: false,
    subscription: null
  }
})
