const app = getApp()
const db = app.globalData.db
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    loadSuccess:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    this.getTemplate()
  },
  async getTemplate() {
    wx.showLoading({
      title: '加载中',
    })
    let res = await db.collection('user').where({
      _openid: app.globalData.openid
    }).get()
    let myTemplateList = res.data[0].myTemplateList||[]
    let list = myTemplateList.map(item=>{
      return item.templateId
    })
    const _ = db.command
    let {data} = await db.collection('template').where({
      _id: _.in(list)
    }).get()
    let arr = data.map(item=>{
      return {
        ...item,
        orderByTime:new Date(myTemplateList.find(val=>val.templateId ===item._id).upDateTime).getTime(),
        peopleViewNum:myTemplateList.find(val=>val.templateId ===item._id).peopleViewNum
      }
    })
    wx.hideLoading()
    this.setData({
      list: arr.sort((a,b)=>{return b.orderByTime-a.orderByTime}),
      loadSuccess:true
    })
  },
  viewTemp(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url+'?openid=' + app.globalData.openid+'&templateId='+e.target.dataset.id,
    })
  },
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
})