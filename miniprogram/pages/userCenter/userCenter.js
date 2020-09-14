const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow (options) {
    this.getUserData()
  },
  async getUserInfo(e) {
    if (e.detail.errMsg === "getUserInfo:ok") {
      await app.cloudFunction({
        name: 'updateUserInfo',
        data: {
          openid: app.globalData.openid,
          detail
        }
      })
      this.getUserData()
    } else {
      Dialog.alert({
        message: '授权获取用户信息失败！',
      })
    }
  },
  async getUserData() {
    const res = await app.cloudFunction({
      name: 'getUserInfo',
      data: {
        openid: app.globalData.openid
      }
    })
    if(res.data.length) {
      this.setData({
        info: Object.assign(this.data.info,res.data[0]),
      })
    } 
  },
  jumpPage(e) {
    let url = e.currentTarget.dataset.url
    wx.navigateTo({
      url
    })
  },
  invitationCode() {
    wx.showModal({
      title:'什么是邀请码？',
      content:'为了保护用户的信息安全，您可以设置邀请码，他人在访问您的简历前必须输入邀请码才能看到您的简历。',
      showCancel:false,
      confirmText:'知道了'
    })
  }
})