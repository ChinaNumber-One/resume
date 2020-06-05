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
    if(wx.getStorageSync('HEADIMG')&&wx.getStorageSync('HEADIMG')) {
      this.data.info.avatarUrl = wx.getStorageSync('HEADIMG')
      this.data.info.nickName = wx.getStorageSync('NICKNAME')
      this.setData({
        info:this.data.info
      })
    } else {
      this.getUserData()
    }
  },
  async getUserInfo(e) {
    if (e.detail.errMsg === "getUserInfo:ok") {
      let detail = e.detail.userInfo
      let res = await db.collection('user').where({
        _openid: app.globalData.openid
      }).get()
      wx.setStorageSync('HEADIMG', detail.avatarUrl)
      wx.setStorageSync('NICKNAME', detail.nickName)
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

  }
})