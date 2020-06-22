//app.js
import {env} from './env'
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
        env
      })
      this.globalData = {
        db: wx.cloud.database({
          throwOnNotFound: false,
          env
        }),
        openid:'',
        phone:''
      }
      this.getOpenId()
    }
  },
  async getOpenId() {
    if (!wx.getStorageSync('OPENID')) {
      let res = await wx.cloud.callFunction({
        name: 'login',
      })
      if (res.result.openid) {
       this.globalData.openid = res.result.openid
        wx.setStorage({
          data: res.result.openid,
          key: 'OPENID',
        })
      }
    } else {
     this.globalData.openid = wx.getStorageSync('OPENID')
    }
  },
})
