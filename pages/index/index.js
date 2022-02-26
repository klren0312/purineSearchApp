//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    ScreenHeight: app.globalData.ScreenHeight,
    loading: false,
    totalNum: 0,
    showModel: false,
    isCache: app.globalData.CacheVersion,
    cacheData: app.globalData.CacheData,
    isOnline: true,
    renderBlock: false,
    startTouchY: 0,
    windowHeight: 0,
    windowWidth: 200,
    topTop: 0,
    motto: 'Hello World',
    isOpen: false,
    showCamera: false,
    pullDowntip: '食物嘌呤识别公测'
  },
  onLoad: function (options) {
    this.initCameraBlock()
    wx.onNetworkStatusChange(res => {
      this.setData({
        isOnline: res.isConnected
      })
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
    } else {
      const db = wx.cloud.database()
      db.collection('food_new').count().then(res => {
        if (res.total) {
          this.setData({
            totalNum: res.total
          })
        }
      })
    }
  },
  levelHandle: function (e) {
    wx.navigateTo({
      url: '/pages/search/search?level=' + e.currentTarget.dataset['level']
    })
  },
  cacheChange: function (e) {
    if (e.detail.value) {
      this.setData({
        loading: true
      })
      const db = wx.cloud.database()
      db.collection('version').get().then(res => {
        if (res.data[0].version !== app.globalData.CacheVersion) {
          wx.cloud.downloadFile({
            fileID: res.data[0].file, // 文件 ID
            success: fileInfo => {
              // 返回临时文件路径
              const path = fileInfo.tempFilePath
              // 读取文件
              const fs = wx.getFileSystemManager()
              const result = fs.readFileSync(path, 'utf-8')
              const formatRes = JSON.parse(result)
              this.setData({
                cacheData: formatRes,
                isCache: true,
                loading: false
              })
              wx.setStorage({
                key: 'CacheData',
                data: formatRes
              })
              wx.setStorage({
                key: 'CacheVersion',
                data: res.data[0].version
              })
            },
            fail: console.error
          })
        }
      })
    }
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
  takePhoto() {
    wx.getUserProfile({
      desc: '用于用户头像昵称展示',
    })
  },
  closeBlock() {
    this.setData({
      isOpen: false,
      topTop: -this.data.windowHeight,
      showCamera: false
    })
  },
  touchStart(e) {
    if (this.data.isOpen) {
      return
    }
    this.setData({
      startTouchY: e.touches[0].pageY
    })
  },
  touchMove(e) {
    if (this.data.isOpen) {
      return
    }
    const movePageY = e.touches[0].pageY
    const diffPageY = movePageY - this.data.startTouchY
    if (diffPageY < 0) {
      return
    }
    this.setData({
      pullDowntip: '继续下拉',
      topTop: -this.data.windowHeight + diffPageY,
      showCamera: false
    })
    // if (diffPageY > this.data.windowHeight / 2) {
    //   this.setData({
    //     pullDowntip: '食物嘌呤识别公测',
    //     topTop: 0,
    //     isOpen: true,
    //     showCamera: true
    //   })
    // } else {
    //   this.setData({
    //     pullDowntip: '继续下拉',
    //     topTop: -this.data.windowHeight + diffPageY,
    //     showCamera: false
    //   })
    // }
  },
  touchEnd(e) {
    if (this.data.isOpen) {
      return
    }
    const endPageY = e.changedTouches[0].pageY
    const diffPageY = endPageY - this.data.startTouchY
    if (diffPageY > this.data.windowHeight / 1.5) {
      this.setData({
        pullDowntip: '食物嘌呤识别公测',
        topTop: 0,
        isOpen: true,
        showCamera: true
      })
    } else {
      this.setData({
        topTop: -this.data.windowHeight,
        showCamera: false
      })
    }
  }
})
