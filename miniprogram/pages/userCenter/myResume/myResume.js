const app = getApp()
const db = app.globalData.db
Page({

  /**
   * 页面的初始数据
   */
  data: {
    birthPicker: false,
    eduPicker: false,
    active: 0,
    resume: {
      baseInfo: {},
      skills: [],
      workExperience: [],
      projectExperience: []
    },
    _id: '',
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      } else if (type === 'month') {
        return `${value}月`;
      } else if (type === 'day') {
        return `${value}日`;
      }
      return value;
    },
    headImgUploadpath: '',
    maxDate: new Date().getTime(),
    minDate: new Date('1900/01/01').getTime(),
    eduOptions: ['博士', '硕士', '研究生', '本科', '高中'],
    eduIndex: 0
  },
  openPicker(e) {
    let pickerKey = e.currentTarget.dataset.picker
    this.setData({
      [pickerKey]: true
    })
  },
  closePicker(e) {
    let pickerKey = e.currentTarget.dataset.picker
    this.setData({
      [pickerKey]: false
    })
  },
  addWorkExperienceTips(e) {
    let index = e.currentTarget.dataset.index
    this.data.resume.workExperience[index].tips.push("")
    this.setData({
      resume: this.data.resume
    })
  },
  addProjectExperienceTips(e) {
    let index = e.currentTarget.dataset.index
    this.data.resume.projectExperience[index].tips.push("")
    this.setData({
      resume: this.data.resume
    })
  },
  delWorkExperienceTips(e) {
    wx.showModal({
      title: '提示',
      content: '确定要删除？',
      success: (res) => {
        if (res.confirm) {
          let index = e.currentTarget.dataset.index
          let tapindex = e.currentTarget.dataset.tapindex
          this.data.resume.workExperience[index].tips.splice(tapindex, 1)
          this.setData({
            resume: this.data.resume
          })
        }
      }
    })
  },
  delProjectExperienceTips(e) {
    wx.showModal({
      title: '提示',
      content: '确定要删除？',
      success: (res) => {
        if (res.confirm) {
          let index = e.currentTarget.dataset.index
          let tapindex = e.currentTarget.dataset.tapindex
          this.data.resume.projectExperience[index].tips.splice(tapindex, 1)
          this.setData({
            resume: this.data.resume
          })
        }
      }
    })
  },
  changeData(e) {
    if (typeof e.detail !== 'object') {
      let value = e.detail
      e.detail = {
        value
      }
    }
    let key = e.currentTarget.dataset.key
    let node = e.currentTarget.dataset.node
    let value = e.detail.value
    let pickerKey = e.currentTarget.dataset.picker || ''
    let index = e.currentTarget.dataset.index || 0
    let tapindex = e.currentTarget.dataset.tapindex
    if (node === 'baseInfo') {
      this.data.resume[node][key] = value
    }
    if (node === 'skills') {
      this.data.resume[node][index][key] = value
    }
    if (node === 'workExperience') {
      if (tapindex !== undefined) {
        this.data.resume[node][index][key][tapindex] = value
      } else {
        this.data.resume[node][index][key] = value
      }
    }
    if (node === 'projectExperience') {
      if (tapindex !== undefined) {
        this.data.resume[node][index][key][tapindex] = value
      } else {
        this.data.resume[node][index][key] = value
      }
    }
    this.setData({
      resume: this.data.resume
    })
    if (pickerKey) {
      this.setData({
        [pickerKey]: false
      })
    }
  },
  uploadHeadImg() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          headImgUploadpath: res.tempFilePaths[0]
        })
      }
    })
  },
  async upDateResumeData(e) {
    wx.showLoading({
      mask: true,
      title: '保存中',
    })
    const key = e.currentTarget.dataset.key
    const data = {
      [key]: this.data.resume[key]
    }
    if (key === 'baseInfo' && this.data.headImgUploadpath) {
      let res = await wx.cloud.uploadFile({
        cloudPath: app.globalData.openid + '/headImg' + this.data.headImgUploadpath.match(/\.[^.]+?$/)[0],
        filePath: this.data.headImgUploadpath,
      })
      if (res.errMsg === 'cloud.uploadFile:ok' && res.fileID) {
        data.baseInfo.headImg = res.fileID
        this.saveData(data)
      } else {
        wx.showToast({
          title: '图片上传失败',
          icon: 'none'
        })
      }
    } else if (key === 'projectExperience') {
      let imgList = []
      this.data.resume.projectExperience.forEach((item,index)=>{
        if(item.projectQrcode.length) {
          item.projectQrcode.forEach((qrImg,qrIndex)=>{
            imgList.push({
              pindex:index,
              url:qrImg.url,
              index:qrIndex,
              key:'projectQrcode'
            })
          })
        }
        if(item.projectImgs.length) {
          item.projectImgs.forEach((img,imgIndex)=>{
            imgList.push({
              pindex:index,
              url:img.url,
              index:imgIndex,
              key:'projectImgs'
            })
          })
        }
      })
      if(imgList.length) {
        let param = {
          i:0,
          list:imgList
        }
        this.upLoadProjectQrcodeRecursion(param);
      } else {
        this.saveData(data)
      }
    }  else {
      this.saveData(data)
    }
  },
  // 递归上传 二维码 （多图）
  upLoadProjectQrcodeRecursion(data) {
    let {i,list} = data
    // 已上传的图片 跳过上传
    if(list[i].url.indexOf('cloud://') !== -1 && list[i].url.indexOf(app.globalData.openid) !== -1){
      i++
      if(i === list.length) {
        return this.saveData({
          projectExperience: this.data.resume.projectExperience
        })
      } else {
        data.i = i;
        return this.upLoadProjectQrcodeRecursion(data);
      }
    }
    wx.cloud.uploadFile({
      cloudPath: app.globalData.openid + '/projectExperience/'+list[i].key+'/' + list[i].key+'_'+list[i].pindex+'_'+list[i].index+ list[i].url.match(/\.[^.]+?$/)[0],
      filePath: list[i].url,
      success: (res)=>{
        this.data.resume.projectExperience[list[i].pindex][list[i].key][list[i].index].url = res.fileID
      },
      complete: (res) =>{
        i++
        if(i === list.length) {
          this.saveData({
            projectExperience: this.data.resume.projectExperience
          })
        } else {
          data.i = i;
          this.upLoadProjectQrcodeRecursion(data);
        }
      }
    })
  },
  async saveData(data) {
    let res = await db.collection('resumes').doc(this.data._id).update({
      data
    })
    wx.hideLoading()
    if (res.errMsg === 'document.update:ok') {
      wx.showToast({
        title: '保存成功',
      })
    } else {
      wx.showToast({
        title: '保存失败，请重试～',
        icon: 'none'
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    this.init()
  },
  async init() {
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    let res = await db.collection('resumes').where({
      _openid: app.globalData.openid,
      real: true
    }).get()
    if (res.data[0]) {
      res.data[0].baseInfo.phone = app.globalData.phone
      this.setData({
        resume: res.data[0],
        eduIndex: this.data.eduOptions.findIndex(item => item === res.data[0].baseInfo.education)
      })
      this.data._id = res.data[0]._id
      wx.hideLoading()
    } else {
      let res = await db.collection('resumes').add({
        data: {
          createTime: new Date(),
          real: true,
          baseInfo: {
            phone: app.globalData.phone || ''
          },
          skills: [],
          workExperience: [],
          projectExperience: [],
        }
      })
      if (res.errMsg === 'collection.add:ok' && res._id) {
        this.data._id = res._id
        this.data.resume.baseInfo.phone = app.globalData.phone || ''
        this.setData({
          resume: this.data.resume
        })
      }
      wx.hideLoading()
    }
    if (this.data.resume.skills.length === 0) {
      this.addSkill()
    }
    if (this.data.resume.workExperience.length === 0) {
      this.addWorkExperience()
    }
    if (this.data.resume.projectExperience.length === 0) {
      this.addProjectExperience()
    }
  },
  addSkill() {
    this.data.resume.skills.push({
      name: '',
      value: '',
      desc: ''
    })
    this.setData({
      resume: this.data.resume
    })
  },
  addWorkExperience() {
    this.data.resume.workExperience.push({
      companyName: '',
      beginDate: '',
      endDate: '',
      tips: ['']
    })
    this.setData({
      resume: this.data.resume
    })
  },
  addProjectExperience() {
    this.data.resume.projectExperience.push({
      projectName: '',
      beginDate: '',
      endDate: '',
      projectUrl: '',
      projectQrcode: '',
      projectImgs: '',
      tips: ['']
    })
    this.setData({
      resume: this.data.resume
    })
  },
  delSkill(e) {
    wx.showModal({
      title: '提示',
      content: '确定要删除？',
      success: (res) => {
        if (res.confirm) {
          const index = e.currentTarget.dataset.index
          this.data.resume.skills.splice(index, 1)
          this.setData({
            resume: this.data.resume
          })
        }
      }
    })
  },
  delWorkExperience(e) {
    wx.showModal({
      title: '提示',
      content: '确定要删除？',
      success: (res) => {
        if (res.confirm) {
          const index = e.currentTarget.dataset.index
          this.data.resume.workExperience.splice(index, 1)
          this.setData({
            resume: this.data.resume
          })
        }
      }
    })
  },
  delProjectExperience(e) {
    wx.showModal({
      title: '提示',
      content: '确定要删除？',
      success: (res) => {
        if (res.confirm) {
          const index = e.currentTarget.dataset.index
          this.data.resume.projectExperience.splice(index, 1)
          this.setData({
            resume: this.data.resume
          })
        }
      }
    })
  },
  async onPullDownRefresh() {
    await this.init()
    wx.stopPullDownRefresh()
  }
})