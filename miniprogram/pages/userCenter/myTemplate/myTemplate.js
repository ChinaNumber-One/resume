const app = getApp()
const db = app.globalData.db
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current:0,
    list:[],
    loadSuccess:false,
    info:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    wx.hideShareMenu()
    this.getTemplate()
  },
  async getTemplate() {
    wx.showLoading({
      title: '加载中',
    })
    let res = await db.collection('user').where({
      _openid: app.globalData.openid
    }).get()
    let info = await db.collection('resumes').where({
      _openid: app.globalData.openid
    }).get()
    this.setData({
      info: info.data[0]
    })
    let myTemplateList = res.data[0].myTemplateList||[]
    if(myTemplateList.length ===0) {
      wx.hideLoading()
      this.setData({
        loadSuccess:true
      })
      return
    }
    let list = myTemplateList.map(item=>{
      return item.templateId
    })
    const _ = db.command
    let {data} = await db.collection('template').where({
      _id: _.in(list)
    })
    .skip(this.data.current * 10)
    .limit(10)
    .get()
    let arr = data.map(item=>{
      return {
        ...item,
        templateNo: item.code.split('_')[1],
        templateType: item.code.split('_')[0],
        orderByTime:new Date(myTemplateList.find(val=>val.templateId ===item._id).upDateTime).getTime(),
        peopleViewNum:myTemplateList.find(val=>val.templateId ===item._id).peopleViewNum
      }
    })
    wx.hideLoading()
    this.setData({
      list: this.data.current === 0? arr.sort((a,b)=>{return b.orderByTime-a.orderByTime}) : this.data.list.concat(arr).sort((a,b)=>{return b.orderByTime-a.orderByTime}),
      loadSuccess:true
    })
  },
  viewTemp(e) {
    wx.navigateTo({
      url: `/template${e.currentTarget.dataset.templatetype}/pages/index/index?templateNo=${e.currentTarget.dataset.templateno}&openid=${app.globalData.openid}&templateType=${e.currentTarget.dataset.templatetype}`
    })
  },
  async onPullDownRefresh () {
    this.setData({current:0})
    await this.getTemplate()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      current: this.data.current + 1
    })
    this.getTemplate()
  },
  async shareMessage(e) {
    // 防止事件捕获
  },
  onShareAppMessage(e) {
    let templateNo = e.target.dataset.templateno
    let templateType = e.target.dataset.templatetype
    console.log( `/template${templateType}/pages/index/index?openid=${app.globalData.openid}&isShare=1&templateNo=${templateNo}&templateType=${templateType}`)
    return {
      title: '姓名：' + this.data.info.baseInfo.realName + '  求职意向：'+this.data.info.baseInfo.employmentIntention,
      path: `/template${templateType}/pages/index/index?openid=${app.globalData.openid}&isShare=1&templateNo=${templateNo}&templateType=${templateType}`,
      imageUrl: this.data.info.baseInfo.headImg || `../../../../images/headImg_${this.data.info.baseInfo.gender}.png`
    }
  }
})