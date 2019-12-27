// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  var topPostID = []
  var success = false
  var post = await db.collection('Post').doc(event.postId).get()
  var floorLength = post.data.floorId == null ? 0 : post.data.floorId.length
  const fileIDs = post.data.postImageCloudID == null ? null : post.data.postImageCloudID
  console.log(post.data)
  
  if (fileIDs != null) {
    await cloud.deleteFile({
      fileList: fileIDs,
    })
  }
  
  for (let i = 0; i < floorLength; i++) {
    var floor =  await db.collection('Floor').doc(post.data.floorId[i]).get()
    var floorFloorLength = floor.data.floorFloorId == null ? 0 : floor.data.floorFloorId.length
    for (let j = 0; j < floorFloorLength; j++) {
      await db.collection('FloorFloor').doc(floor.data.floorFloorId[j]).remove()
    }
    await db.collection('Floor').doc(post.data.floorId[i]).remove()
  }
  await db.collection('Post').doc(event.postId).remove()
  
  await db.collection('LittleMessage').get().then((res) => {
    topPostID = res.data[0].topPostID
    for (let i = 0; i < topPostID.length; i++) {
      if (topPostID[i] == event.postId) {
        topPostID.splice(i, 1)
      }
    }
    success = true
  }, (err) => {
    console.log(err)
  })
  
  if (success) {
    await db.collection('LittleMessage').update({
      data: {
        topPostID: topPostID
      }
    })
  }
  
}