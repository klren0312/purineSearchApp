//app.js
import { cacheData } from './utils/localData'
App({
  onLaunch: function () {
    // 获取当前Storage中缓存
    this.globalData.CacheData = cacheData
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
    CacheVersion: true
  }
})