// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  var floor = await db.collection('Floor').doc(event.floorId).get()
  var floorFloorContent = floor.data.floorFloorContent
  var floorFloorId = floor.data.floorFloorId
  floorFloorContent.splice(event.floorFloorIndex, 1)
  floorFloorId.splice(event.floorFloorIndex, 1)

  await db.collection('Floor').doc(event.floorId).update({
    data: {
      floorFloorContent: floorFloorContent,
      floorFloorId: floorFloorId,
    }
  })
  await db.collection('FloorFloor').doc(event.floorFloorId).remove()

}