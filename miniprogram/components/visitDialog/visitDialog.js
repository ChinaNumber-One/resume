// components/visitDialog/visitDialog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    optionOpenId:{
      type:String,
      value:''
    },
    templateId:{
      type:String,
      value:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    visitInfo: {
      name:'',
      phone:'',
      identityType:'1',
      companyName:''
    },
    loading:false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeVisitData(e) {
      if (typeof e.detail !== 'object') {
        let value = e.detail
        e.detail = {
          value
        }
      }
      let key = e.currentTarget.dataset.key
      let value = e.detail.value
      this.data.visitInfo['error_'+key] = ''
      this.data.visitInfo[key] = value
      this.setData({
        visitInfo:this.data.visitInfo
      })
    },
    addTempViewNum() {
      wx.cloud.callFunction({
        name: 'addTempViewNum',
        data:{
          templateId:this.data.templateId,
          openid:this.data.optionOpenId
        },
        success: res => {
          if(res.result.errMsg === 'document.update:ok') {
            this.setData({
              loading:false
            })
            this.triggerEvent('submitDone')
          }
        },
        fail: err => {
          console.error('[云函数] [addTempViewNum] 调用失败: ', err)
        }
      })
    },
    addVisitRecord(param) {
      wx.cloud.callFunction({
        name: 'addVisitRecord',
        data: {
          param,
        },
        success: res => {
          if(res.result.errMsg === 'collection.add:ok') {
            this.addTempViewNum()
          } else {
            wx.showToast({
              title:'网络错误，请重试～',
              type:'icon'
            })
          }
        },
        fail: err => {
          console.error('[云函数] [addVisitRecord] 调用失败: ', err)
        }
      })
    },
    async getUserInfo(e) {
      if (e.detail.errMsg === "getUserInfo:ok") {
        let reg = /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-7|9])|(?:5[0-3|5-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1|8|9]))\d{8}$/
        if(!this.data.visitInfo.name) {
          this.data.visitInfo.error_name = '请输入您的姓名'
          return this.setData({
            visitInfo: this.data.visitInfo
          })
        }
        if(!reg.test(this.data.visitInfo.phone)) {
          this.data.visitInfo.error_phone = '请输入正确的手机号'
          return this.setData({
            visitInfo: this.data.visitInfo
          })
        }
        if(this.data.visitInfo.identityType === '1' && !this.data.visitInfo.companyName) {
          this.data.visitInfo.error_companyName = '请输入公司名'
          return this.setData({
            visitInfo: this.data.visitInfo
          })
        } 
        let param = {
          name:this.data.visitInfo.name,
          phone:this.data.visitInfo.phone,
          identityType:this.data.visitInfo.identityType,
          companyName:this.data.visitInfo.companyName,
          ...e.detail.userInfo,
          openid:this.data.optionOpenId,
          visitTime:new Date(),
          delFlag: false
        }
        this.setData({
          loading:true
        })
        this.addVisitRecord(param)
      }
    },
    
  }
})
