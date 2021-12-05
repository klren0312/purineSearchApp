//app.js
App({
  onLaunch: function () {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'market-f4hh5',
        traceUser: true,
      })
      // 获取当前Storage中缓存
      const cacheVersion = wx.getStorageSync('CacheVersion')
      const cacheData = wx.getStorageSync('CacheData')
      if (cacheVersion && cacheData) {
        this.globalData.CacheVersion = cacheVersion
        this.globalData.CacheData = cacheData
      }
    }
    // 获取系统状态栏信息
    wx.getSystemInfo({
      success: e => {
        this.globalData.ScreenHeight = e.screenHeight
        this.globalData.StatusBar = e.statusBarHeight;
        let capsule = wx.getMenuButtonBoundingClientRect();
        if (capsule) {
         	this.globalData.Custom = capsule;
        	this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
        } else {
        	this.globalData.CustomBar = e.statusBarHeight + 50;
        }
      }
    })
  },
  globalData: {
    Custom: '',
    CustomBar: '',
    StatusBar: '',
    ScreenHeight: '',
    OpenId: '',
    CacheData: [],
    CacheVersion: ''
  }
})