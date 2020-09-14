const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 0,
    list: '',
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
      title: '加载中'
    })
    let {
      data
    } = await app.cloudFunction({
      name: 'getVisitRecord',
      data: {
        openid: app.globalData.openid,
        current: this.data.current
      }
    })
    data.map(item => {
      let year = new Date(item.visitTime).getFullYear()
      let month = ('0' + (new Date(item.visitTime).getMonth() + 1)).substr(-2)
      let day = ('0' + new Date(item.visitTime).getDate()).substr(-2)
      let hour = ('0' + new Date(item.visitTime).getHours()).substr(-2)
      let minutes = ('0' + new Date(item.visitTime).getMinutes()).substr(-2)
      let second = ('0' + new Date(item.visitTime).getSeconds()).substr(-2)
      item.visitTimeStr = year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + second
      return item
    })
    this.setData({
      list: this.data.current === 0 ? data : this.data.list.concat(data),
      loadSuccess: true
    })
    wx.hideLoading()
  },
  async onPullDownRefresh() {
    this.setData({
      current: 0
    })
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
  callPhone(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone
    })
  },
  onClose(event) {
    let that = this
    const {
      position,
      instance,
      name
    } = event.detail;
    console.log(name)
    switch (position) {
      case 'cell':
        instance.close();
        break;
      case 'right':
        wx.showModal({
          title: '提示',
          content: '确定要删除？',
          async success(res) {
            if (res.confirm) {
              wx.showLoading({
                title: 'Loading...',
              })
              const result = await app.cloudFunction({
                name: 'deleteVisitRecord',
                data: {
                  _id: name
                },
              })
              wx.hideLoading()
              instance.close();
              if (result.errMsg === 'document.update:ok') {
                that.getData()
              }
            } else if (res.cancel) {
              instance.close();
            }
          }
        })
        break;
    }
  },
})