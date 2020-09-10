//app.js
import {
  env
} from './env'
App({
  onLaunch() {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate((res) => {
      // 请求完新版本信息的回调
      if (res.hasUpdate) {
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate()
              }
            }
          })
        })
      }
    })
    updateManager.onUpdateFailed(() => {
      wx.showModal({
        title: '新版本下载失败',
        content: '请检查网络并重启小程序再试',
        showCancel: false,
        confirmText:'知道了'
      })
    })
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
        openid: '',
        phone: ''
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