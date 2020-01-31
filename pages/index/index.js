//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    ScreenHeight: app.globalData.ScreenHeight,
    isShow: false
  },
  onLoad: function () { 
  },
  toSearch: function () {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  }
})
