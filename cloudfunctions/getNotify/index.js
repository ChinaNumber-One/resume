// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
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
  if(res.data && res.data.length) {
    return {
      state: 200,
      data: res.data
    }
  } else {
    return {
      state: 0,
      data:[]
    }
  }
}