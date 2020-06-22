const app = getApp()
const db = app.globalData.db
Page({
  data: {
    current:0
  },
  onLoad (options) {
    this.getData()
  },
  async getData() {
    wx.showLoading({
      title: '加载中',
    })
    let res = await wx.cloud.callFunction({
      name:'getVersion',
      data:{
        current:this.data.current
      }
    })
    wx.hideLoading()
    res.result.data.map(item=>{
      let year = new Date(item.updateTime).getFullYear()
      let month = ('0' + (new Date(item.updateTime).getMonth() + 1)).substr(-2)
      let day = ('0' + new Date(item.updateTime).getDate()).substr(-2)
      let hour = ('0' + new Date(item.updateTime).getHours()).substr(-2)
      let minutes = ('0' + new Date(item.updateTime).getMinutes()).substr(-2)
      let second = ('0' +  new Date(item.updateTime).getSeconds()).substr(-2)
      item.updateTimeStr = year + '-' + month + '-' + day +' ' +hour +':' +minutes+':'+second
      return item
    })
    let list = this.data.current === 0?res.result.data:this.data.list.concat(res.result.data)
    this.setData({
      list
    })
  },
  async onPullDownRefresh() {
    await this.getData()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      current: this.data.current + 1
    })
    this.getData()
  },
})