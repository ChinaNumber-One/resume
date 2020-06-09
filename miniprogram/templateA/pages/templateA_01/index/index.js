const app = getApp()
const db = app.globalData.db
Page({
  /**
   * 页面的初始数据
   */
  data: {
    info:{},
    current:3,
    activeName: 1,
    color:['#FF1493','#00CED1','#FFA500','#32CD32','#FF4500','#FFD700'],
    title:['简历封面','个人简介','个人技能','工作经验','项目经验'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    wx.setNavigationBarTitle({
      title: this.data.title[0],
    })
    let param = {}
    if(options.openid) {
      param._openid = options.openid,
      param.real = true
    } else {
      param.real = false
    }
    let { data } = await db.collection('resumes').where(param).get()
    if(data[0].skills.length) {
      data[0].skills.map((item,index)=>{
        if(index<this.data.color.length) {
          item.bg = this.data.color[index]
        } else {
          item.bg = this.data.color[index-Math.floor(index/this.data.color.length)*this.data.color.length]
        }
        item.delay = `animate__delay-${Math.floor(index/10)+1}-${(index%10)+1}s` 
        return item
      })
    }
    app.globalData.resume = data[0]
    this.setData({
      info: data[0]
    })
  },
  changeSwiper(e) {
    this.setData({
      current:e.detail.current
    })
    wx.setNavigationBarTitle({
      title: this.data.title[e.detail.current],
    })
  },
  onChange(event) {
    this.setData({
      activeName: event.detail,
    });
  },
  copyUrl(e) {
    let url = e.currentTarget.dataset.data
    wx.setClipboardData({
      data: url,
    })
  },
  viewQrcodeImg(e) {
    let url = e.currentTarget.dataset.url
    wx.previewImage({
      urls: [url],
    })
  },
  onShareAppMessage() {}
})