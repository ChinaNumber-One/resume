const app = getApp()
const db = app.globalData.db
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone:'',
    _id:'',
    hasPhone:null,
    canSubmit:false,
    showSetNewPhone:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    let res = await db.collection('user').where({
      _openid: app.globalData.openid
    }).get()
    if(res.data[0].phone) {
      this.setData({
        encryption:res.data[0].phone.substr(0,3)+'****'+res.data[0].phone.substr(-4),
        phone:res.data[0].phone,
        hasPhone:true
      })
    } else {
      this.setData({
        hasPhone:false
      })
    }
    this.data._id = res.data[0]._id
  },
  checkPhone(e) {
    if(e.detail.value.length === 11) {
      if(e.detail.value === this.data.phone) {
        this.setData({
          showSetNewPhone:true
        })
      } else {
        wx.showToast({
          title: '原手机号填写错误！',
          icon: 'none'
        })
        this.setData({
          showSetNewPhone:false
        })
      }
    }
  },
  changePhone(e) {
    if(e.detail.value.length === 11) {
      this.setData({
        canSubmit:true,
        phone: e.detail.value
      })
    } else {
      this.setData({
        canSubmit:false
      })
    }
  },
  submit() {
    let reg = /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-7|9])|(?:5[0-3|5-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1|8|9]))\d{8}$/
    if(!this.data.canSubmit) {
      return
    } else {
      if(!reg.test(this.data.phone)) {
        wx.showToast({
          title: '手机号码格式有误！',
          icon:"none"
        })
      } else {
        this.upDateUserInfo()
      }
    }
  },
  async upDateUserInfo() {
    wx.showLoading({
      mask: true,
      title:'提交中'
    })
    let res = await db.collection('user').doc(this.data._id).update({
      data: {
        phone: this.data.phone
      }
    })
    wx.hideLoading()
    if(res.errMsg === 'document.update:ok') {
      wx.showToast({
        title: !this.data.hasPhone?'绑定成功':'换绑成功',
        duration:2000
      })
      setTimeout(()=>{
        wx.navigateBack()
      },2000)
    } else {
      wx.showToast({
        title: '绑定失败，请重试～',
        icon:'fail'
      })
    }
  },

})