// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  let param = event.param
  let res = await db.collection('visitRecord').add({
    data: param
  })
  return res
}