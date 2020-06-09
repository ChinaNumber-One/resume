const app = getApp()
const db = app.globalData.db
import Dialog from '@vant/weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    templateList:[],
    noData:[],
    current:0,
    option1: [
      { text: '全部商品', value: '0' },
      { text: '免费商品', value: '1' },
      { text: '活动商品', value: '2' },
      { text: '会员专属', value: '3' },
    ],
    option2: [
      { text: '默认排序', value: '0' },
      { text: '浏览量排序', value: 'viewNum' },
      { text: '使用量排序', value: 'useNum' },
    ],
    type: '0',
    sort: '0',
    loadSuccess: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    await this.getOpenId()
    await this.checkUser()
    await this.getTemplateList()
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
  getOpenId() {
    if(!wx.getStorageSync('OPENID')) {
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          if (res.result.openid) {
            app.globalData.openid = res.result.openid
            wx.setStorage({
              data: res.result.openid,
              key: 'OPENID',
            })
          }
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败: ', err)
        }
      })
    } else {
      app.globalData.openid = wx.getStorageSync('OPENID')
    }
  },
  async checkUser(){
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
      db.collection('user').doc(res.data[0]._id).update({
        data: {
          lastLoginTime: new Date()
        }
      })
    }
  },
  async getTemplateList() {
    let sort = 'viewNum'
    this.setData({
      loadSuccess:false
    })
    let param = {}
    if(this.data.type !=='0') {
      param.type = this.data.type
    }
    if(this.data.sort !== '0') {
      sort = this.data.sort
    }
    let res = await db.collection('template').where(param).orderBy(sort, 'desc')
    .skip(this.data.current * 10)
    .limit(10)
    .get()
    this.setData({
      loadSuccess:true
    })
    if(res&&res.data) {
      this.setData({
        templateList:res.data
      })
    } else {
      this.setData({
        noData:true
      })
    }
  },
  async getUserInfo(e) {
    if (e.detail.errMsg === "getUserInfo:ok") {
      await this.upDateUserInfo(e.detail.userInfo)
      await this.changeTemplateViewNumOrUseNum(e.target.dataset.type,e.target.dataset.code)
      if(e.target.dataset.type === 'view') {
        wx.navigateTo({
          url: e.target.dataset.url,
        })
      } else {
        // 检查手机号，不存在的话 录入，存在的话进入表单填写页面
      }
    } else {
      Dialog.alert({
        message: '授权获取用户信息失败！',
      })
    }
  },
  async addTemplateViewNum(code) {
    let res = await db.collection('template').where({
      code
    }).get()
    db.collection('template').doc(res.data[0]._id).update({
      data: {
        viewNum:res.data[0].viewNum + 1
      }
    })
  },
  changeTemplateViewNumOrUseNum(type,code) {
    wx.cloud.callFunction({
      name: 'changeTemplateViewNumOrUseNum',
      data: {
        type,
        code
      },
      success: res => {
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
  async onPullDownRefresh () {
    await this.getTemplateList()
    wx.stopPullDownRefresh()
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