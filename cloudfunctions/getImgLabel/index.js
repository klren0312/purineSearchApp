// 云函数入口文件
const cloud = require('wx-server-sdk')
const tencentcloud = require('tencentcloud-sdk-nodejs')
cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})


const TiiaClient = tencentcloud.tiia.v20190529.Client
const clientConfig = {
  credential: {
    secretId: 'AKIDFJ7euue8HAn8CzWnoY2FAoBKErDKAj01',
    secretKey: 'nKaYGhrnZ5KI0SdWBZgV3LM6ZlgKtBDy',
  },
  region: 'ap-shanghai',
  profile: {
    httpProfile: {
      endpoint: 'tiia.tencentcloudapi.com',
    },
  },
}

const client = new TiiaClient(clientConfig)

// 云函数入口函数
exports.main = async (event, context) => {
    const params = {
        'ImageUrl': event.imgUrl,
        'Scenes': [
            'CAMERA'
        ]
    }
    const data = await client.DetectLabel(params)

    return {
        data
    }
}