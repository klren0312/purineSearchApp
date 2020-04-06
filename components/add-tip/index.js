// components/add-tip/index.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    duration: {
      type: Number,
      value: 5
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    show: false
  },

  ready: function () {
    let cache = wx.getStorageSync('showTip')
    if (cache) return
    this.changeTip(true)
    setTimeout(() => {
      this.changeTip(false)
    }, this.data.duration * 1000)
    wx.setStorage({
      key: 'showTip',
      data: true
    })
      
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeTip (status) {
      this.setData({
        show: status
      })
    }
  }
})
