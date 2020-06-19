// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  let res = await db.collection('template').where({
    _id:event._id
  }).get()
  if(event.type === 'view') {
    db.collection('template').doc(res.data[0]._id).update({
      data: {
        viewNum:res.data[0].viewNum + 1
      }
    })
    return {
      type:event.type,
      state: "success"
    }
  } else if(event.type === 'use') {
    db.collection('template').doc(res.data[0]._id).update({
      data: {
        useNum:res.data[0].useNum + 1
      }
    })
    return {
      type:event.type,
      state: "success"
    }
  }
}