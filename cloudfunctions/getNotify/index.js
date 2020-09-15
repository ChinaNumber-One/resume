// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  const _ = db.command
  let res = await db.collection('notify').where(_.and([
    {
      startDate: _.lte(new Date())
    },
    {
      endDate: _.gte(new Date())
    }
  ])).get()
  return res
}