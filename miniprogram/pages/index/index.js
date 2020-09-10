const app = getApp()
const db = app.globalData.db
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
    await this.getOpenId()
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
  async getOpenId() {
    if (!wx.getStorageSync('OPENID')) {
      let res = await wx.cloud.callFunction({
        name: 'login',
      })
      if (res.result.openid) {
        app.globalData.openid = res.result.openid
        wx.setStorage({
          data: res.result.openid,
          key: 'OPENID',
        })
      }
      this.checkUser()
    } else {
      app.globalData.openid = wx.getStorageSync('OPENID')
      this.checkUser()
    }
  },
  async checkUser() {
    let res = await db.collection('user').where({
      _openid: app.globalData.openid
    }).get()
    if (res.data.length === 0) {
      db.collection('user').add({
        data: {
          createTime: new Date(),
          lastLoginTime: new Date(),
        }
      })
    } else {
      let data = res.data[0]
      app.globalData.phone = data.phone || ''
      db.collection('user').doc(data._id).update({
        data: {
          lastLoginTime: new Date()
        }
      })
    }
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
    let res = await db.collection('template').where(param).orderBy(sort, 'desc')
      .skip(this.data.current * 10)
      .limit(10)
      .get()
    this.setData({
      loadSuccess: true
    })
    if (res && res.data) {
      res.data.forEach(item=>{
        item.templateType = item.code.split('_')[0]
        item.templateNo = item.code.split('_')[1]
      })
      this.setData({
        templateList: this.data.current === 0 ? res.data : this.data.templateList.concat(res.data)
      })
    } else {
      this.setData({
        noData: true
      })
    }
  },
  async getUserInfo(e) {
    if (e.detail.errMsg === "getUserInfo:ok") {
      await this.upDateUserInfo(e.detail.userInfo)
      if (e.target.dataset.type === 'view') {
        await this.changeTemplateViewNumOrUseNum(e.target.dataset.type, e.target.dataset.id)
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
          let result = await db.collection('resumes').where({
            _openid: app.globalData.openid
          }).get()
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
            // 添加模版 id 与 user 关联
            let res = await db.collection('user').where({
              _openid: app.globalData.openid
            }).get()
            let myTemplateList = res.data[0].myTemplateList && res.data[0].myTemplateList.length ? res.data[0].myTemplateList : []
            let isHas = false
            myTemplateList.forEach(item => {
              if (item.templateId === e.target.dataset.id) {
                isHas = true
                return
              }
            })
            if (!isHas) {
              await this.changeTemplateViewNumOrUseNum(e.target.dataset.type, e.target.dataset.id)
              myTemplateList.push({
                upDateTime: new Date(),
                templateId: e.target.dataset.id,
                peopleViewNum: 0
              })
              await db.collection('user').doc(res.data[0]._id).update({
                data: {
                  myTemplateList
                }
              })
            }
            wx.hideLoading()
            wx.navigateTo({
              url: `/template${e.target.dataset.templatetype}/pages/index/index?templateNo=${e.target.dataset.templateno}&openid=${app.globalData.openid}&templateType=${e.target.dataset.templatetype}`
            })
          }
        }
      }
    } else {
      wx.showModal({
        title:'',
        content:"获取用户信息失败！",
        showCancel:false,
      })
    }
  },
  async addTemplateViewNum(code) {
    let res = await db.collection('template').where({
      code
    }).get()
    db.collection('template').doc(res.data[0]._id).update({
      data: {
        viewNum: res.data[0].viewNum + 1
      }
    })
  },
  changeTemplateViewNumOrUseNum(type, id) {
    wx.cloud.callFunction({
      name: 'changeTemplateViewNumOrUseNum',
      data: {
        type,
        _id: id
      },
      success: res => {
        this.data.templateList.map(item => {
          if (item._id === id) {
            if (type === 'view') {
              item.viewNum = item.viewNum + 1
            }
            if (type === 'use') {
              item.viewNum = item.useNum + 1
            }
          }
          return item
        })
        this.setData({
          templateList: this.data.templateList
        })
      },
      fail: err => {
        console.error('[云函数] [changeTemplateViewNumOrUseNum] 调用失败: ', err)
      }
    })
  },
  async upDateUserInfo(detail) {
    let res = await db.collection('user').where({
      _openid: app.globalData.openid
    }).get()
    db.collection('user').doc(res.data[0]._id).update({
      data: {
        avatarUrl: detail.avatarUrl,
        nickName: detail.nickName,
        gender: detail.gender
      }
    })
  },
  async getNotice() {
    wx.cloud.callFunction({
      name: 'getNotify',
      success: res => {
        this.setData({
          notifyList: res.result.data
        })
      },
      fail: err => {
        console.error('[云函数] [getNotify] 调用失败: ', err)
      }
    })
  },
  async onPullDownRefresh() {
    this.setData({
      current: 0
    })
    await this.getTemplateList()
    await this.getNotice()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      current: this.data.current + 1
    })
    this.getTemplateList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})