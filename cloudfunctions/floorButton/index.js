// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {

  var res1
  var success1 = false
  var success2 = false

  await db.collection('Floor').add({
    data: {
      floorContent: event.floorContent,
      postId: event.postId,
      floorIndex: event.floorIndex,
      _openid: event.floorOpenid,
      time: event.time,
      timeStamp: event.timeStamp
    }
  }).then((res) => {
    console.log(1)
    res1 = res
    success1 = true
  }, (err) => {
    console.log(err)
  })

  if (success1) {
    console.log(2)
    await db.collection('Floor').where({ postId: event.postId }).get()
      .then((res) => {
        success2 = true
        res1 = res
        console.log(res.data)
      }, (err) => {
        console.log(err)
      })
  }

  if (success2) {
    console.log(3)
    var floorId = []
    var length = res1.data.length
    for (let i = 0; i < length; i++) {
      floorId.push(res1.data[i]._id)
    }
    await db.collection('Post').doc(event.postId).update({
      data: {
        floorContent: event.floorContentArray,
        floorId: floorId
      }
    })
  }

}


