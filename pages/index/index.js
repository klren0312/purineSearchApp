//index.js
//获取应用实例
const app = getApp()

// 在页面中定义激励视频广告
let videoAd = null
console.log(app.globalData.CacheVersion)
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

    // 检查公测
    this.checkTestFeature()

    // 在页面onLoad回调事件中创建激励视频广告实例
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-455bb0714c980661'
      })
      videoAd.onLoad(() => {})
      videoAd.onError((err) => {})
      videoAd.onClose((res) => {
        console.log(res.isEnded)
        if (res.isEnded) {
          const db = wx.cloud.database()
          db.collection('user')
            .where({
              openId: app.globalData.OpenId
            })
            .update({
              data: {
                cache: this.data.isCache,
                testCount: this.data.testCount + 2
              }
            })
          this.setData({
            hasDoAd: true,
            testCount: this.data.testCount + 2
          })
        }
      })
    } 
  },
  toSearch: function () {
    const db = wx.cloud.database()
    db.collection('user')
      .where({
        openId: app.globalData.OpenId
      })
      .field({
        _id: true,
        loginCount: true
      })
      .get()
      .then(res => {
        if (res.data.length !== 0) {
          db.collection('user')
            .where({
              openId: app.globalData.OpenId
            })
            .update({
              data: {
                cache: this.data.isCache,
                loginCount: res.data[0].loginCount + 1
              }
            })
        }
      })
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
  checkTestFeature: function () {
    const db = wx.cloud.database()
    db.collection('version').field({
      imgTestEnable: true
    })
    .get()
    .then(res => {
      this.setData({
        showTest: res.data[0].imgTestEnable
      })
    })
  },
  cacheChange: function (e) {
    if (e.detail.value) {
      this.setData({
        loading: true
      })
      const db = wx.cloud.database()
      db.collection('version').get().then(res => {
        this.setData({
          showTest: res.data[0].imgTestEnable || false,
        })
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
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'medium',
      success: (res) => {
        const db = wx.cloud.database()
        db.collection('user')
          .where({
            openId: app.globalData.OpenId
          })
          .update({
            data: {
              cache: this.data.isCache,
              testCount: this.data.testCount - 1
            }
          })
        this.setData({
          testCount: this.data.testCount - 1
        })
        wx.showLoading({
          title: '检测中...',
          mask: true
        })
        wx.cloud.callFunction({
          name: 'getImgLabel',
          data: {
            imgUrl: wx.cloud.CDN({
              type: 'filePath',
              filePath: res.tempImagePath,
            })
          },
          complete: res => {
            wx.hideLoading()
            this.setData({
              logText: JSON.stringify(res)
            })
            if (res.errMsg === 'cloud.callFunction:ok') {
              if (res.result.data.CameraLabels && res.result.data.CameraLabels.length > 0) {
                const result = res.result.data.CameraLabels[0]
                console.log(result.Name)
                this.closeBlock()
                wx.navigateTo({
                  url: '/pages/search/search?name=' + result.Name
                })
              }
            }
          }
        })
      }
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
    if (this.data.isOpen || !this.data.showTest) {
      return
    }
    this.setData({
      startTouchY: e.touches[0].pageY
    })
  },
  touchMove(e) {
    if (this.data.isOpen || !this.data.showTest) {
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
  },
  async touchEnd(e) {
    if (this.data.isOpen || !this.data.showTest) {
      return
    }
    const endPageY = e.changedTouches[0].pageY
    const diffPageY = endPageY - this.data.startTouchY
    if (diffPageY > this.data.windowHeight / 3) {
      if (!this.data.userId) {
        const db = wx.cloud.database()
        const res = await db.collection('user')
          .field({
            _id: true,
            testCount: true
          })
          .get()
        if (res.data.length > 0) {
          const user = res.data[0]
          this.setData({
            userId: user._id,
            testCount: user.testCount
          })
        }
      }
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
