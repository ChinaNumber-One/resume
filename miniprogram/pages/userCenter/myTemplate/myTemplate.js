const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
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
    let res = await app.cloudFunction({
      name: 'getUserInfo',
      data: {
        openid: app.globalData.openid
      }
    })
    let myTemplateList = res.data[0].myTemplateList||[]
    if(myTemplateList.length ===0) {
      this.setData({
        loadSuccess:true
      })
      wx.hideLoading()
      return
    }
    let info = await app.cloudFunction({
      name: 'getResumeDetail',
      data: {
        param: {
          _openid: app.globalData.openid
        }
      }
    })
    this.setData({
      info: info.data[0]
    })
    let list = myTemplateList.map(item=>{
      return item.templateId
    })
    const getMyTemplate = await app.cloudFunction({
      name: 'getMyTemplate',
      data: {
        list
      }
    })
    let arr = getMyTemplate.data.map(item=>{
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
      list:  arr.sort((a,b)=>{return b.orderByTime-a.orderByTime}),
      loadSuccess:true
    })
  },
  viewTemp(e) {
    wx.navigateTo({
      url: `/template${e.currentTarget.dataset.templatetype}/pages/index/index?templateNo=${e.currentTarget.dataset.templateno}&openid=${app.globalData.openid}&templateType=${e.currentTarget.dataset.templatetype}&templateId=${e.currentTarget.dataset.templateid}`
    })
  },
  async onPullDownRefresh () {
    await this.getTemplate()
    wx.stopPullDownRefresh()
  },
  async shareMessage(e) {
    // 防止事件捕获
  },
  onShareAppMessage(e) {
    console.log(e.target.dataset)
    let templateNo = e.target.dataset.templateno
    let templateType = e.target.dataset.templatetype
    let templateId = e.target.dataset.templateid
    return {
      title: '姓名：' + this.data.info.baseInfo.realName + '  求职意向：'+this.data.info.baseInfo.employmentIntention,
      path: `/template${templateType}/pages/index/index?openid=${app.globalData.openid}&isShare=1&templateNo=${templateNo}&templateType=${templateType}&templateId=${templateId}`,
      imageUrl: this.data.info.baseInfo.headImg || `../../../../images/headImg_${this.data.info.baseInfo.gender}.png`
    }
  }
})