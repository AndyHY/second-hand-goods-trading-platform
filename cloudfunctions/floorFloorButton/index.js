// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  
  var res1
  var success1 = false
  var success2 = false
  var floorFloorOpenid = event.floorFloorOpenid
  var floorFloorContent = event.floorFloorContent
  var floorFloorIndex = event.floorFloorIndex
  var floorFloorContentArray = event.floorFloorContentArray
  var floorFloorIndex = event.floorFloorIndex

  await db.collection('FloorFloor').add({
    data: {
      floorFloorContent: event.floorFloorContent,
      floorId: event.floorId,
      floorFloorIndex: event.floorFloorIndex,
      _openid: event.floorFloorOpenid,
      time: event.time,
      timeStamp: event.timeStamp
    }
  }).then(() => {
    console.log(1)
    success1 = true
  }, (err) => {
    console.log(err)
  })

  if (success1) {
    console.log(2)
    await db.collection('FloorFloor').where({ floorId: event.floorId }).get()
      .then((res) => {
        success2 = true
        res1 = res
      }, (err) => {
        console.log(err)
      })
  }

  if (success2) {
    console.log(3)
    var floorFloorId = []
    var length = res1.data.length
    for (let i = 0; i < length; i++) {
      floorFloorId.push(res1.data[i]._id)
      if (i == event.floorFloorClickIndex) {
        var replyOpenid = res1.data[i]._openid
        floorFloorContentArray[floorFloorIndex] = { floorFloorOpenid, floorFloorContent, replyOpenid, floorFloorIndex }
      }
    }
    await db.collection('Floor').doc(event.floorId).update({
      data: {
        floorFloorContent: floorFloorContentArray,
        floorFloorId: floorFloorId
      }
    })
  }

}