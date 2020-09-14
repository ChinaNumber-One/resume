const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    code:'',
    focus:false,
    closeFlag:false,
    data: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    wx.showLoading({
      title: '加载中',
    })
    let res = await app.cloudFunction({
      name:'getInvitationCode',
      data: {
        param: {
          _openid: app.globalData.openid
        }
      }
    })
    wx.hideLoading()
    this.setData({
      data: res.data,
      code:res.data.length?res.data[0].code:'',
      closeFlag:res.data.length?res.data[0].closeFlag:false,
    })
  },
  changeInput(e) {
    this.setData({
      code: e.detail.value
    })
    if(e.detail.value.length === 6) {
      this.setData({
        focus:false
      })
    }
  },
  onChange({detail}) {
    this.setData({ closeFlag: !detail });
  },
  getFocus() {
    if(this.data.closeFlag) return
    this.setData({
      focus:true
    })
  },
  async submit() {
    if(this.data.code.length !== 6) return
    if(this.data.data.length === 0) {
      let res = await app.cloudFunction({
        name: 'addInvitationCode',
        data: {
          param :{
            code:this.data.code,
            closeFlag:this.data.closeFlag
          }
        }
      })
      if(res.errMsg === 'collection.add:ok') {
        wx.showToast({
          title: '保存成功',
        })
      } else {
        wx.showModal({
          content: '保存失败',
        })
      }
    } else {
      let res = await app.cloudFunction({
        name: 'updateInvitationCode',
        data: {
          id:this.data.data[0]._id,
          code: this.data.code,
          closeFlag:this.data.closeFlag
        }
      })
      if(res.errMsg === 'document.update:ok') {
        wx.showToast({
          title: '修改成功',
        })
      } else {
        wx.showModal({
          content: '修改失败',
        })
      }
    }
  }
})