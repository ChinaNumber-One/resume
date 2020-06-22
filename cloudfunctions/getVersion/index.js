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
  let res = await db.collection('version').where({
    updateTime:_.lt(new Date)
  }).limit(10).skip(current * 10).orderBy('updateTime',"desc").get()
  return res
}