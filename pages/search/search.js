// pages/search/search.js
const app = getApp()
const plugin = requirePlugin('WechatSI')
const manager = plugin.getRecordRecognitionManager()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    totalData: app.globalData.CacheData, // 所有数据
    CustomBar: app.globalData.CustomBar,
    ScreenHeight: app.globalData.ScreenHeight,
    searchValue: '',
    searchLevel: '',
    results: [],
    startClass: 'unactive',
    levelColor: {
      0: '#67C23A',
      1: '#E6A23C',
      2: '#F56C6C'
    },
    page: 0,
    isBottom: false,
    isOnline: true
  },

  inputHandler: function (e) {
    this.setData({
      searchValue: e.detail.value
    })
  },

  confirmSearch: function (e) {
    this.getDatas(e.detail.value)
  },

  search: function () {
    this.getDatas(this.data.searchValue)
  },

  getDatas: async function (name) {
    if (name === '') {
      wx.showToast({
        title: '请输入食材名称',
        icon: 'none',
        duration: 1500,
        mask: false
      })
      return
    }
    this.setData({
      searchLevel: '',
      page: 0,
      isBottom: true
    })
    wx.showLoading({
      title: '查询中...',
    })
    // 存在缓存则使用缓存数据查询, 反之请求数据库
    if (this.data.totalData.length !== 0) {
      const results = this.data.totalData.filter(item => item.name.indexOf(name) !== -1)
      this.setData({
        results: results
      })
      wx.hideLoading()
    } else if (!this.data.isOnline) {
      wx.hideLoading()
      wx.showToast({
        icon: 'none',
        title: '请联网后使用'
      })
    }
  },
  showDetails: function (e) {
    const index = 'results[' + e.currentTarget.dataset.id + '].show'
    this.setData({
      [index]: !this.data.results[parseInt(e.currentTarget.dataset.id)].show
    })
  },
  addHistory: async function (name) {
    wx.reportAnalytics('search_food', {
      food: name,
    })
  },

  /**
   * 按住按钮开始语音识别
   */
  streamRecord: function(e) {
    wx.stopBackgroundAudio()
    wx.showToast({
      icon: 'none',
      title: '长按按钮, 到出现录音开始的提示后说话',
    })
    manager.start({
      duration: 5000
    })
  },


  /**
   * 松开按钮结束语音识别
   */
  endStreamRecord: function(e) {
    wx.showLoading({
      title: '查询中...',
    })
    manager.stop()
  },

  recognizeVoice () {
    manager.onRecognize = function(res) {
      console.log("current result", res.result)
    }
    manager.onStart = (res) => {
      wx.showToast({
        icon: 'none',
        title: '录音开始, 请开始说话'
      })
      this.setData({
        startClass: 'active'
      })
    }
    manager.onStop = (res) => {
      this.setData({
        startClass: 'unactive'
      })
      console.log("识别结果", res.result.replace(/(。|，)/g, ''))
      // ironName = res.result.replace(/(。|，)/g, '')
      this.setData({
        searchValue: res.result.replace(/(。|，)/g, '')
      })

      this.getDatas(this.data.searchValue)

      wx.showToast({
        icon: 'none',
        title: '录音结束'
      })
    }
    manager.onError = function(res) {
      console.error("error msg", res)
    }
  },

  /**
   * 通过嘌呤等级获取食材
   * @param {number} level 
   */
  getDatasByLevel: async function () {
    wx.showLoading({
      title: '查询中...',
    })
    // 存在缓存则使用缓存数据查询, 反之请求数据库
    if (this.data.totalData.length > 0) {
      const res = this.data.totalData.filter(v => {
        return v.level === this.data.searchLevel
      })
      this.setData({
        results: res
      })
      wx.hideLoading()
    } else if (!this.data.isOnline) {
      wx.hideLoading()
      wx.showToast({
        icon: 'none',
        title: '请联网后使用'
      })
    }
  },

  /**
   * 滚动加载
   */
  listScrollBottom: function() {
    if (this.data.searchLevel && !this.data.isBottom) {
      this.getDatasByLevel()
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取网络状态
    wx.onNetworkStatusChange(res => {
      this.setData({
        isOnline: res.isConnected
      })
    })

    if (options.hasOwnProperty('name')) {
      this.setData({
        searchValue: options.name
      })
      this.getDatas(options.name)
    } else if (options.hasOwnProperty('level')) {
      this.setData({
        searchLevel: options.level
      })
      this.getDatasByLevel()
    }
    this.recognizeVoice()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    if (this.data.searchValue) {
      return {
        title: this.data.searchValue + '的嘌呤含量查询',
        path: `/pages/index/index?name=${this.data.searchValue}&level=${this.data.searchLevel}`
      }
    } else {
      return {
        title: '嘌呤含量',
        path: `/pages/index/index?level=${this.data.searchLevel}`
      }
    }

  },
  /**
   * 分享到朋友圈
   */
  onShareTimeline: function () {
    let title = '快来查查食物的嘌呤含量!'
    if (this.data.searchValue) {
      title = '点击查看' + this.data.searchValue + '的嘌呤含量'
    }
    return {
      title: title,
      query: {
        name: this.data.searchValue
      }
    }
  }
})