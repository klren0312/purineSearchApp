//app.js
App({
  onLaunch: function () {
    this.checkUpdate()
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'market-f4hh5',
        traceUser: true,
      })
      const openid = wx.getStorageSync('openid')
      if (!openid) {
        // 获取用户openid
        wx.cloud.callFunction({
          name: 'getOpenId',
          complete: res => {
            const { openid } = res
            this.globalData.OpenId = openid
            this.getCacheData()
          }
        })
      } else {
        this.globalData.OpenId = openid
      }
    }
    this.getSystemInfo()
  },
  // 获取系统状态栏信息
  getSystemInfo() {
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
    wx.cloud.callFunction({
      name: 'getOpenId',
      complete: res => {
        console.log('callFunction test result: ', res)
      }
    })
  },
  // 获取缓存数据和版本
  getCacheData() {
    // 获取当前Storage中缓存
    const cacheVersion = wx.getStorageSync('CacheVersion')
    const cacheData = wx.getStorageSync('CacheData')
    if (cacheVersion && cacheData) {
      this.globalData.CacheVersion = cacheVersion
      this.globalData.CacheData = cacheData
    }
  },
  // 版本检查
  checkUpdate() {
    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      // console.log(res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
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