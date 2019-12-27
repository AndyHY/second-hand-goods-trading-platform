// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  var success1 = false
  var res1
  await db.collection('LittleMessage').get().then((res) => {
    success1 = true
    res1 = res
  }, (err) => {
    console.log(err)
  })
  if (success1) {
    console.log(res1.data[0])
    var topPostID = res1.data[0].topPostID
    //最多置顶三个帖子,用队列存储
    console.log(topPostID)
    if (topPostID.length < 3) {
      topPostID.push(event.postID)
    } else if (topPostID.length == 3) {
      delete topPostID[0]
      topPostID[0] = topPostID[1]
      topPostID[1] = topPostID[2]
      topPostID[2] = event.postID
    }
    await db.collection('LittleMessage').update({
      data: {
        topPostID: topPostID
      }
    })
  }
 

}