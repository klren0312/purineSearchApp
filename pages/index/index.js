//index.js
//获取应用实例
const app = getApp()

// 在页面中定义激励视频广告
let videoAd = null
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    ScreenHeight: app.globalData.ScreenHeight,
    loading: false,
    totalNum: 0,
    showModel: false,
    isCache: false,
    cacheData: [],
    isOnline: true,
    renderBlock: false,
    startTouchY: 0,
    windowHeight: 0,
    windowWidth: 200,
    topTop: 0,
    motto: 'Hello World',
    showTest: false,  // 是否显示公测功能
    isOpen: false,
    showCamera: false,
    pullDowntip: '食物嘌呤识别公测',
    testCount: 0, // 公测使用次数
    userId: '', // 用户id
    hasDoAd: false, // 是否做过广告
    logText: '' // 日志
  },
  onLoad: function (options) {
    this.initCameraBlock()
    wx.onNetworkStatusChange(res => {
      this.setData({
        isOnline: res.isConnected
      })
    })
    this.setData({
      isCache: !!app.globalData.CacheVersion,
      cacheData: app.globalData.CacheData
    })
    if (options.hasOwnProperty('name')) {
      wx.navigateTo({
        url: '/pages/search/search?name=' + options.name
      })
    } else if (options.hasOwnProperty('level')) {
      wx.navigateTo({
        url: '/pages/search/search?level=' + options.level
      })
    } else {
      this.getTotalFoodNum()
    }
  },
  toSearch: function () {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },
  /**
   * 获取总数
   */
  getTotalFoodNum: function () {
    // 判断若存在缓存, 则用缓存
    if (this.data.isCache) {
      this.setData({
        totalNum: this.data.cacheData.length
      })
    }
  },
  levelHandle: function (e) {
    wx.navigateTo({
      url: '/pages/search/search?level=' + e.currentTarget.dataset['level']
    })
  },
  openModel: function () {
    this.setData({
      showModel: true
    })
  },
  closeModel: function () {
    this.setData({
      showModel: false
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '食物嘌呤含量',
      path: '/pages/index/index'
    }
  },
  /**
   * 分享到朋友圈
   */
  onShareTimeline () {
    return {
      title: '快来查查食物的嘌呤含量!'
    }
  },
  initCameraBlock() {
    const system = wx.getSystemInfoSync()
    this.setData({
      windowHeight: system.windowHeight,
      windowWidth: system.windowWidth,
      topTop: -system.windowHeight
    })
    setTimeout(() => {
      this.setData({
        renderBlock: true
      })
    }, 800)
  },
  closeBlock() {
    this.setData({
      isOpen: false,
      topTop: -this.data.windowHeight,
      showCamera: false
    })
  },
  /**
   * 开启激励广告
   */
  openAd() {
    // 用户触发广告后，显示激励视频广告
    if (videoAd && !this.data.hasDoAd) {
      videoAd.show().catch(() => {
        // 失败重试
        videoAd.load()
          .then(() => videoAd.show())
          .catch(err => {
            console.log('激励视频 广告显示失败')
          })
      })
    }
  }
})
