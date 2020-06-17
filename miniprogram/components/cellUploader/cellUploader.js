// components/cellUploader/cellUploadere.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title:{
      type:String,
      value:''
    },
    label:{
      type: String,
      value: ''
    },
    imgs:{
      type:Array,
      value:[],
      observer(){
        this.setData({
          fileList:this.data.imgs
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    fileList:[]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    afterRead(e) {
      e.detail.file.forEach(item=>{
        this.data.fileList.push({
          url:item.path
        })
      })
      this.setData({
        fileList: this.data.fileList
      })
      this.triggerEvent('change', {
        value:this.data.fileList
      })
    },
    oversize() {
      wx.showToast({
        title:"单个图片不能超过3M",
        icon:'none'
      })
    },
    delete(e) {
      this.data.fileList.splice(e.detail.index,1)
      this.setData({
        fileList: this.data.fileList
      })
      this.triggerEvent('change', {
        value:this.data.fileList
      })
    }
  }
})
