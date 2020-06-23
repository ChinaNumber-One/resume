// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  let current = event.current
  const _ = db.command
  let {data} = await db.collection('user').where({}).get()
  let res = await db.collection('user').where({}).limit(20).skip(current * 20).orderBy('lastLoginTime',"desc").get()
  return {
    total: data.length,
    data: res.data
  }
}