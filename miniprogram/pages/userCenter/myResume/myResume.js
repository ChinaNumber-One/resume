const app = getApp()
const db = app.globalData.db
Page({

  /**
   * 页面的初始数据
   */
  data: {
    birthPicker: false,
    eduPicker: false,
    active: 2,
    resume: {
      baseInfo: {},
      skills: [],
      workExperience: [],
      projectExperience: []
    },
    phone: '',
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
  delWorkExperienceTips(e) {
    console.log(e)
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
      console.log(tapindex)
      if (tapindex !== undefined) {
        console.log(this.data.resume.workExperience)
        this.data.resume[node][index]['tips'][tapindex] = value
        console.log(this.data.resume.workExperience)
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
        wx.showLoading({
          title: '上传中',
        })
        const filePath = res.tempFilePaths[0]
        const cloudPath = app.globalData.openid + '/headImg' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          complete: (e) => {
            wx.hideLoading()
            if (e.errMsg === 'cloud.uploadFile:ok' && e.fileID) {
              this.data.resume.baseInfo.headImg = e.fileID
              this.setData({
                resume: this.data.resume
              })
              wx.showToast({
                title: '上传成功'
              })
            } else {
              wx.showToast({
                title: '上传失败',
                icon: 'none'
              })
            }
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },
  async upDateResumeData(e) {
    wx.showLoading({
      title: '保存中',
    })
    const key = e.currentTarget.dataset.key
    const data = {
      [key]: this.data.resume[key]
    }
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
      title: '加载中'
    })
    let res = await db.collection('resumes').where({
      _openid: app.globalData.openid,
      real: true
    }).get()
    wx.hideLoading()
    if (res.data[0]) {
      this.setData({
        resume: res.data[0],
        eduIndex: this.data.eduOptions.findIndex(item => item === res.data[0].baseInfo.education)
      })
      this.data._id = res.data[0]._id
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
    }
    if (this.data.resume.skills.length === 0) {
      this.addSkill()
    }
    if (this.data.resume.workExperience.length === 0) {
      this.addWorkExperience()
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
  async onPullDownRefresh() {
    await this.init()
    wx.stopPullDownRefresh()
  }
})