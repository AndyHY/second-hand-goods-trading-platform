// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  var post = await db.collection('Post').doc(event.postId).get()
  var floorContent = post.data.floorContent
  var floorId = post.data.floorId
  floorContent.splice(event.floorIndex, 1)
  floorId.splice(event.floorIndex, 1)
  
  await db.collection('Post').doc(event.postId).update({
    data: {
      floorContent: floorContent,
      floorId: floorId,
    }
  })

  var floor = await db.collection('Floor').doc(event.floorId).get()
  var floorFloorLength = floor.data.floorFloorId == null ? 0 : floor.data.floorFloorId.length

  for (let i = 0; i < floorFloorLength; i++) {
    await db.collection('FloorFloor').doc(floor.data.floorFloorId[i]).remove()
  }
  await db.collection('Floor').doc(event.floorId).remove()

}