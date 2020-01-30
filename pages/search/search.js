// pages/search/search.js
const app = getApp()
const plugin = requirePlugin('WechatSI')
const manager = plugin.getRecordRecognitionManager()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    ScreenHeight: app.globalData.ScreenHeight,
    searchValue: '',
    results: [],
    startClass: 'unactive'
  },

  inputHandler: function (e) {
    this.setData({
      searchValue: e.detail.value
    })
  },

  confirmSearch: function (e) {
    console.log(e.detail)
  },

  search: function () {
    this.getDatas(this.data.searchValue)
  },

  getDatas: async function (name) {
    wx.showLoading({
      title: '查询中...',
    })
    const db = wx.cloud.database()
    db.collection('food')
      .where({
        name: db.RegExp({
          regexp: name,
          options: 'i'
        })
      })
      .field({
        name: true,
        value: true,
      })
      .get()
      .then(res => {
        this.setData({
          results: res.data
        })
        if (res.data.length !== 0) {
          this.addHistory(this.data.searchValue)
        }
        wx.hideLoading()
      })
      .catch(() => {
        wx.hideLoading()
      })
  },

  addHistory: async function (name) {
    const db = wx.cloud.database()
    db.collection('history').add({
      data: {
        name: name,
        createdAt: db.serverDate() 
      }
    })
    .then(res => {
      console.log(res)
    })
    .catch(console.error)
  },

  /**
   * 按住按钮开始语音识别
   */
  streamRecord: function(e) {
    wx.stopBackgroundAudio()
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.hasOwnProperty('name')) {
      this.setData({
        searchValue: options.name
      })
      this.getDatas(options.name)
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
    return {
      title: this.data.searchValue + '嘌呤含量查询',
      path: '/page/search?name=' + this.data.searchValue
    }
  }
})