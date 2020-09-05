// templateA/pages/templateA_02/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current:0,
    title:['简历封面','个人简介','个人技能','工作经验','项目经验'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    wx.setNavigationBarTitle({
      title: this.data.title[0],
    })
  },
  changeSwiper() {

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