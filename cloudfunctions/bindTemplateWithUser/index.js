// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  // 添加模版 id 与 user 关联
  let res = await db.collection('user').where({
    _openid: event.openid
  }).get()
  let myTemplateList = res.data[0].myTemplateList && res.data[0].myTemplateList.length ? res.data[0].myTemplateList : []
  let isHas = false
  myTemplateList.forEach(item => {
    if (item.templateId === event.id) {
      isHas = true
      return
    }
  })
  let result = false
  if (!isHas) {
    myTemplateList.push({
      upDateTime: new Date(),
      templateId: event.id,
      peopleViewNum: 0
    })
    result = await db.collection('user').doc(res.data[0]._id).update({
      data: {
        myTemplateList
      }
    })
  }
  return result
}