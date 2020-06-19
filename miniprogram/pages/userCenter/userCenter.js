const app = getApp()
const db = app.globalData.db
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
  onLoad: function (options) {
    this.getUserData()
  },
  async getUserInfo(e) {
    if (e.detail.errMsg === "getUserInfo:ok") {
      let detail = e.detail.userInfo
      let res = await db.collection('user').where({
        _openid: app.globalData.openid
      }).get()
      await db.collection('user').doc(res.data[0]._id).update({
        data: {
          avatarUrl: detail.avatarUrl,
          nickName: detail.nickName,
          gender: detail.gender
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
    let res = await db.collection('user').where({
      _openid: app.globalData.openid
    }).get()
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
})