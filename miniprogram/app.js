//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    this.globalData = {
      db: wx.cloud.database({
        throwOnNotFound: false
      }),
      openid:'ohgEq45MVPEOkGw42NhwCl4nE7fg',
      phone:'15555555555'
    }
  }
})
