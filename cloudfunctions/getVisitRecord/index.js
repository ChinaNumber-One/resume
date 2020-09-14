// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  let res = await db.collection('visitRecord').where({
    openid: event.openid,
    delFlag: false
  }).orderBy('visitTime', 'desc').skip(event.current * 10).limit(10).get()
  return res
}