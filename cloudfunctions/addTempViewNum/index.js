// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  let _openid = event.openid
  let {data} = await db.collection('user').where({
    _openid
  }).get()
  if(data.length) {
    let _id = data[0]._id
    let updata = data[0].myTemplateList.map(item=>{
      if(item.templateId === event.templateId) {
        item.peopleViewNum = item.peopleViewNum + 1
      }
      return item
    })
    let res = await db.collection('user').doc(_id).update({
      data:{
        myTemplateList:updata
      }
    })
    return res
  }
}