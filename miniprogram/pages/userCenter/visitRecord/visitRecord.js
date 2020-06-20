const app = getApp()
const db = app.globalData.db
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current:0,
    list:'',
    loadSuccess: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData()
  },
  async getData() {
    wx.showLoading({
      title:'加载中'
    })
    let {data} = await db.collection('visitRecord').where({
      openid: app.globalData.openid,
      delFlag: false
    }).skip(this.data.current * 10).limit(10).get()
    data.map(item=>{
      let year = new Date(item.visitTime).getFullYear()
      let month = ('0' + (new Date(item.visitTime).getMonth() + 1)).substr(-2)
      let day = ('0' + new Date(item.visitTime).getDate()).substr(-2)
      let hour = ('0' + new Date(item.visitTime).getHours()).substr(-2)
      let minutes = ('0' + new Date(item.visitTime).getMinutes()).substr(-2)
      let second = ('0' +  new Date(item.visitTime).getSeconds()).substr(-2)
      item.visitTimeStr = year + '-' + month + '-' + day +' ' +hour +':' +minutes+':'+second
      item.visitTimeNum = new Date(item.visitTime)
      return item
    })
    let arr = data.sort((a,b)=>{
      return b.visitTimeNum - a.visitTimeNum
    })
    this.setData({
      list: this.data.current === 0?data:this.data.list.concat(arr),
      loadSuccess: true
    })
    wx.hideLoading()
  },
  async onPullDownRefresh () {
    this.setData({current:0})
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
  callPhone (e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone
    })
  },
  onClose(event) {
    let that = this
    const { position, instance, name } = event.detail;
    console.log(name)
    switch (position) {
      case 'cell':
        instance.close();
        break;
      case 'right':
        wx.showModal({
          title: '提示',
          content: '确定要删除？',
          async success (res) {
            if (res.confirm) {
              wx.cloud.callFunction({
                name: 'deleteVisitRecord',
                data:{
                  _id:name
                },
                success: res => {
                  console.log(res)
                  if(res.result.errMsg === 'document.update:ok') {
                    instance.close();
                    that.getData()
                  }
                },
                fail: err => {
                  instance.close();
                  console.error('[云函数] [deleteVisitRecord] 调用失败: ', err)
                }
              })
            } else if (res.cancel) {
              instance.close();
            }
          }
        })
        break;
    }
  },
})