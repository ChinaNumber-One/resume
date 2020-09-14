const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    templateList: [],
    noData: false,
    current: 0,
    option1: [{
        text: '全部商品',
        value: '0'
      },
      {
        text: '免费商品',
        value: '1'
      },
      {
        text: '活动商品',
        value: '2'
      },
      {
        text: '会员专属',
        value: '3'
      },
    ],
    option2: [
      // { text: '默认排序', value: '0' },
      {
        text: '浏览量排序',
        value: 'viewNum'
      },
      {
        text: '使用量排序',
        value: 'useNum'
      },
    ],
    type: '0',
    sort: 'viewNum',
    loadSuccess: false,
    notifyList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    await app.login()
    this.getNotice()
    this.getTemplateList()
  },
  changeType(e) {
    this.setData({
      type: e.detail
    })
    this.getTemplateList()
  },
  changeSort(e) {
    this.setData({
      sort: e.detail
    })
    this.getTemplateList()
  },

  async getTemplateList() {
    this.setData({
      loadSuccess: false
    })
    let param = {}
    let sort;
    if (this.data.type !== '0') {
      param.type = this.data.type
    }
    if (this.data.sort !== '0') {
      sort = this.data.sort
    } else {
      sort = 'createTime'
    }
    const res = await app.cloudFunction({
      name: 'getTemplateList',
      data: {
        param,
        sort
      }
    })
    this.setData({
      loadSuccess: true
    })
    if (res && res.data) {
      res.data.forEach(item => {
        item.templateType = item.code.split('_')[0]
        item.templateNo = item.code.split('_')[1]
      })
      this.setData({
        templateList: res.data
      })
    } else {
      this.setData({
        noData: true
      })
    }
  },
  async getUserInfo(e) {
    if (e.detail.errMsg === "getUserInfo:ok") {
      this.upDateUserInfo(e.detail.userInfo)
      this.changeTemplateViewNumOrUseNum(e.target.dataset.type, e.target.dataset.id)
      if (e.target.dataset.type === 'view') {
        wx.navigateTo({
          url: `/template${e.target.dataset.templatetype}/pages/index/index?templateNo=${e.target.dataset.templateno}&templateType=${e.target.dataset.templatetype}`
        })
      } else {
        // 检查手机号，不存在的话 录入，存在的话进入表单填写页面
        if (!app.globalData.phone) {
          wx.navigateTo({
            url: '../userCenter/bindPhone/bindPage',
          })
        } else {
          let result = await app.cloudFunction({
            name: 'hasResumes',
            data: {
              openid: app.globalData.openid
            }
          })
          if (result.data.length === 0) {
            wx.showModal({
              title: '提示',
              content: '您还未完善简历信息，是否需要完善？',
              confirmText: '去完善',
              success(res) {
                if (res.confirm) {
                  return wx.navigateTo({
                    url: '../userCenter/myResume/myResume',
                  })
                } else {
                  return false
                }
              }
            })
          } else {
            wx.showLoading({
              title: '请稍后',
            })
           const res =  await app.cloudFunction({
              name: 'bindTemplateWithUser',
              data: {
                openid: app.globalData.openid,
                id: e.target.dataset.id,
                type: e.target.dataset.type
              }
            })
            wx.hideLoading()
            if(!res) {
              wx.navigateTo({
                url: `/template${e.target.dataset.templatetype}/pages/index/index?templateNo=${e.target.dataset.templateno}&openid=${app.globalData.openid}&templateType=${e.target.dataset.templatetype}`
              })
            } else {
              wx.showModal({
                title: '提示',
                content: '网络错误，请重试～',
                showCancel: false,
              })
            }
          }
        }
      }
    } else {
      wx.showModal({
        title: '',
        content: "获取用户信息失败！",
        showCancel: false,
      })
    }
  },
  async changeTemplateViewNumOrUseNum(type, id) {
    const result = await app.cloudFunction({
      name: 'changeTemplateViewNumOrUseNum',
      data: {
        type,
        _id: id
      }
    })
    if (result.errMsg === 'document.update:ok') {
      this.data.templateList.map(item => {
        if (item._id === id) {
          if (type === 'view') {
            item.viewNum = item.viewNum + 1
          }
          if (type === 'use') {
            item.useNum = item.useNum + 1
          }
        }
        return item
      })
      this.setData({
        templateList: this.data.templateList
      })
    }
  },
  async upDateUserInfo(detail) {
    await app.cloudFunction({
      name: 'updateUserInfo',
      data: {
        openid: app.globalData.openid,
        detail
      }
    })
  },
  async getNotice() {
    const result = await app.cloudFunction({
      name: 'getNotify'
    })
    if (result.data) {
      this.setData({
        notifyList: result.data
      })
    }
  },
  async onPullDownRefresh() {
    await this.getTemplateList()
    await this.getNotice()
    wx.stopPullDownRefresh()
  },
  onShareAppMessage: function () {

  }
})