// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  console.log("openid:",openid)
  let res = await db.collection('user').where({
    _openid: openid
  }).get()
  if (res.data.length === 0) {
    await db.collection('user').add({
      data: {
        createTime: new Date(),
        lastLoginTime: new Date(),
      }
    })
  } else {
    let data = res.data[0]
    await db.collection('user').doc(data._id).update({
      data: {
        lastLoginTime: new Date()
      }
    })
  }
  let result =  await db.collection('user').where({
    _openid: openid
  }).get()
  return result
}