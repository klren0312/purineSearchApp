// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const db = cloud.database()
    const res = await db.collection('user')
      .where({
        openId: wxContext.OPENID
      })
      .field({
        _id: true
      })
      .get()
    if (res.data.length === 0) {
      db.collection('user').add({
        data: {
          openId: wxContext.OPENID,
          cache: false,
          loginCount: 1,
          testCount: 5, // 公测次数
          healthData: [] // 健康数据
        }
      })
    }
    return {
      event,
      openid: wxContext.OPENID,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID,
    }
}