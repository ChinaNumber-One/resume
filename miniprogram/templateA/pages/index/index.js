const app = getApp()
const db = app.globalData.db
Page({
  /**
   * 页面的初始数据
   */
  data: {
    info:{},
    current:0,
    color:['#FF1493','#00CED1','#FFA500','#32CD32','#FF4500','#FFD700'],
    title:['简历封面','个人简介','个人技能','工作经验','项目经验'],
    sumbitInfoDone:false,
    visitDialog:false,
    optionOpenId:'',
    templateId:'',
    templateNo: '',
    templateType: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    let param = {}
    this.setData({
      templateNo: options.templateNo,
      templateType: options.templateType
    })
    console.log(options)
    if(options.openid) {
      param._openid = options.openid,
      param.real = true
      this.setData({
        optionOpenId:options.openid
      })
    } else {
      param.real = false
      wx.hideShareMenu();
    }
    this.setData({
      param
    })
    if(options.isShare === '1' && options.openid === app.globalData.openid) {
      wx.setNavigationBarTitle({
        title: '访问登记',
      })
      wx.hideHomeButton()
      this.setData({
        visitDialog:true
      })
    } else {
      wx.setNavigationBarTitle({
        title: this.data.title[0],
      })
      await this.getData(param)
      this.setData({sumbitInfoDone:true})
    }
  },
  async submit() {
    this.setData({
      visitDialog:false,
    })
    wx.setNavigationBarTitle({
      title: this.data.title[0],
    })
    await this.getData(this.data.param)
    this.setData({sumbitInfoDone:true})
  },
  async getData(param) {
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
  copyUrl(e) {
    let url = e.currentTarget.dataset.data
    wx.setClipboardData({
      data: url,
    })
  },
  viewQrcodeImg(e) {
    let urls = e.currentTarget.dataset.urls.map(item=>{
      return item.url
    })

    wx.previewImage({
      urls,
    })
  },
  viewImgs(e) {
    let index = e.currentTarget.dataset.index
    let cuttentimgindex = e.currentTarget.dataset.cuttentimgindex
    wx.previewImage({
      current:this.data.info.projectExperience[index].projectImgs[cuttentimgindex].url,
      urls: this.data.info.projectExperience[index].projectImgs.map(item=>{
        return item.url
      }),
    })
  },
  onShareAppMessage() {
    return {
      title: '姓名：' + this.data.info.baseInfo.realName + '    求职意向：'+this.data.info.baseInfo.employmentIntention,
      path: `/template${this.data.templateType}/pages/index/index?openid=${this.data.optionOpenId}&isShare=1&templateNo=${this.data.templateNo}&templateType=${this.data.templateType}`,
      imageUrl: this.data.info.baseInfo.headImg || `../../../../images/headImg_${this.data.info.baseInfo.gender}.png`
    }
  },
})