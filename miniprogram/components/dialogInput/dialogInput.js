// components/datePicker.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    value: {
      type: String,
      value: ''
    },
    title: {
      type:String,
      value:''
    },
    maxlength: {
      type:Number|String,
      value: 32
    },
    type: {
      type:String,
      value:'text'
    },
    placeholder: {
      type:String,
      value:'请输入'
    },
    rightIcon: {
      type: String,
      value:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    visible:false,
    inputValue:'',
    autosize: {
      minHeight:80
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    openDialog() {
      this.setData({
        visible:true,
        inputValue:this.data.value
      })
    },
    closeDialog() {
      this.setData({
        visible:false,
      })
    },
    changeInput(e) {
      this.setData({
        inputValue: e.detail
      })
    },
    confirm(e) {
      this.triggerEvent('change', {
        value:this.data.inputValue
      })
      this.closeDialog()
    },
    rightIconClick() {
      this.triggerEvent('clickRightIcon', {
        value:this.data.inputValue
      })
    }
  }
})
