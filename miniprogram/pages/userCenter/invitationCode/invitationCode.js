const app = getApp()
const db = app.globalData.db
Page({

  /**
   * 页面的初始数据
   */
  data: {
    code:'',
    focus:true,
    closeFlag:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    let {data} = await db.collection('invitationCode').where({
      _openid:app.globalData.openid
    }).get()
    this.setData({
      data,
      code:data.length?data[0].code:'',
      closeFlag:data.length?data[0].closeFlag:false,
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
      let res = await db.collection('invitationCode').add({
        data:{
          code:this.data.code,
          closeFlag:this.data.closeFlag
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
      let _id = this.data.data[0]._id
      let res = await db.collection('invitationCode').doc(_id).update({
        data:{
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