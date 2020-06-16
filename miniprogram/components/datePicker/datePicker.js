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
      value:'时间选择'
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    visible:false,
    maxDate: new Date().getTime(),
    minDate: new Date('1900/01/01').getTime(),
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
  },

  /**
   * 组件的方法列表
   */
  methods: {
    openPicker() {
      this.setData({
        visible:true
      })
    },
    closePicker() {
      this.setData({
        visible:false
      })
    },
    confirm(e) {
      let date = new Date(e.detail)
      let year = date.getFullYear()
      let month = '0' + (date.getMonth() + 1)
      let day = '0' + date.getDate()
      let str = year + '-' + month.substr(-2) + '-' + day.substr(-2)
      this.setData({
        value:str
      })
      this.triggerEvent('change', {
        value:str
      })
      this.closePicker()
    }
  }
})
