const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current:0,
    list:[],
    total:0,
    loadSuccess:false,
    showSheet:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    this.getData()
  },
  async getData() {
    wx.showLoading({
      title: '加载中',
    })
    let result = await app.cloudFunction({
      name:'getUsers',
      data: {
        current: this.data.current
      }
    })
    wx.hideLoading()
    let list = result.data
    let total = result.total
    list.map(item=>{
      let year = new Date(item.lastLoginTime).getFullYear()
      let month = ('0' + (new Date(item.lastLoginTime).getMonth() + 1)).substr(-2)
      let day = ('0' + new Date(item.lastLoginTime).getDate()).substr(-2)
      let hour = ('0' + new Date(item.lastLoginTime).getHours()).substr(-2)
      let minutes = ('0' + new Date(item.lastLoginTime).getMinutes()).substr(-2)
      let second = ('0' +  new Date(item.lastLoginTime).getSeconds()).substr(-2)
      item.lastLoginTimeStr = year + '-' + month + '-' + day +' ' +hour +':' +minutes+':'+second

      let year_ = new Date(item.createTime).getFullYear()
      let month_ = ('0' + (new Date(item.createTime).getMonth() + 1)).substr(-2)
      let day_ = ('0' + new Date(item.createTime).getDate()).substr(-2)
      let hour_ = ('0' + new Date(item.createTime).getHours()).substr(-2)
      let minutes_ = ('0' + new Date(item.createTime).getMinutes()).substr(-2)
      let second_ = ('0' +  new Date(item.createTime).getSeconds()).substr(-2)
      item.createTimeStr = year_ + '-' + month_ + '-' + day_ +' ' +hour_ +':' +minutes_+':'+second_
      return item
    })
    this.setData({
      loadSuccess: true,
      total,
      list: this.data.current === 0 ? list: this.data.list.concat(list)
    })
  },
  callPhone (e) {
    if(!e.currentTarget.dataset.phone) {
      return wx.showModal({
        title: '提示',
        content:'该用户未填写手机号',
        showCancel: false
      })
    }
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone
    })
  },
  async onPullDownRefresh () {
    this.setData({
      current: 0
    })
    await this.getData()
    wx.stopPullDownRefresh()
  },
  onReachBottom () {
    if(this.data.list >= this.data.total) return
    this.setData({
      current: this.data.current + 1
    })
    this.getData()
  },
})