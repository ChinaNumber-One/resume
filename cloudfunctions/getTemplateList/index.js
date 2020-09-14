// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  const {param,sort} = event
  let res = await db.collection('template').where(param).orderBy(sort, 'desc')
  .get()
  return res
}