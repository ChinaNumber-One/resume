const app = getApp()
const db = app.globalData.db

const login = ()=> {
  return new Promise(async function (resolve, reject) {
    let res = await wx.cloud.callFunction({
      name: 'login',
    })
    if (res.result.openid) {
      app.globalData.openid = res.result.openid
      resolve(true)
      checkUser()
    } else {
      wx.showModal({
        message: '登录失败',
      })
      reject(false)
    }
  })
}

async function checkUser() {
  let res = await db.collection('user').where({
    _openid: app.globalData.openid
  }).get()
  if (res.data.length === 0) {
    db.collection('user').add({
      data: {
        createTime: new Date(),
        lastLoginTime: new Date(),
      }
    })
  } else {
    let data = res.data[0]
    app.globalData.phone = data.phone || ''
    db.collection('user').doc(data._id).update({
      data: {
        lastLoginTime: new Date()
      }
    })
  }
}

export {login}