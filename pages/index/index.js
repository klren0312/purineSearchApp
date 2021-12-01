//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    ScreenHeight: app.globalData.ScreenHeight,
    isShow: false,
    totalNum: 0,
    showModel: false,
    isCache: false
  },
  onLoad: function (options) {
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
    const db = wx.cloud.database()
    db.collection('food_new').count().then(res => {
      if (res.total) {
        this.setData({
          totalNum: res.total
        })
      }
    })
  },
  levelHandle: function (e) {
    wx.navigateTo({
      url: '/pages/search/search?level=' + e.currentTarget.dataset['level']
    })
  },
  cacheChange: function (e) {
    this.setData({
      isCache: e.detail.value
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
  }
})
