// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
// 每次加载最多从数据库中获取20个记录
const MAX_LIMIT = 20
// 云函数入口函数
exports.main = async (event, context) => {

  var res1
  var success1 = false

  await db.collection('Post').get().then((res) => {
    success1 = true
    res1 = res
  }, (err) => {
    console.log(err)
  })

  if (success1) {
    var length = event.length  //length是上次刷新时帖子的数量
    var postUserInformation = []
    var postData = event.postData
    var visitTimes = event.visitTimes
    // 数据库中剩余的记录数大于MAX_LIMIT
    if (length - MAX_LIMIT * (visitTimes + 1) >= 0) {
      console.log(1)
      // 每次向前遍历MAX_LIMIT个记录
      for (let i = length - MAX_LIMIT * visitTimes - 1; i >= length - MAX_LIMIT * (visitTimes + 1); i--) {
        await db.collection('UserInformation').where({
          _openid: res1.data[i]._openid
        }).get().then((res) => {
          postUserInformation[i] = res.data[0]  //找到每个帖子的楼主信息
        }, (err) => {
          console.log(err)
        })
      }
      // 为postData赋值
      for (let i = 0; i < MAX_LIMIT; i++) {
        postData.push(res1.data[length - MAX_LIMIT * visitTimes - 1 - i])
        postData[i + MAX_LIMIT * visitTimes].postHeadPortrait = postUserInformation[length - MAX_LIMIT * visitTimes - 1 - i].icon
        postData[i + MAX_LIMIT * visitTimes].postNickName = postUserInformation[length - MAX_LIMIT * visitTimes - 1 - i].nickName
      }
      visitTimes += 1
    } else {
      console.log(2)
      // 每次向前遍历剩余记录
      for (let i = length - MAX_LIMIT * visitTimes - 1; i >= 0; i--) {
        await db.collection('UserInformation').where({
          _openid: res1.data[i]._openid
        }).get().then((res) => {
          postUserInformation[i] = res.data[0]  //找到每个帖子的楼主信息
        }, (err) => {
          console.log(err)
        })
      }
      // 为postData赋值
      for (let i = 0; i < length - MAX_LIMIT * visitTimes; i++) {
        postData.push(res1.data[length - MAX_LIMIT * visitTimes - 1 - i])
        postData[i + MAX_LIMIT * visitTimes].postHeadPortrait = postUserInformation[length - MAX_LIMIT * visitTimes - 1 - i].icon
        postData[i + MAX_LIMIT * visitTimes].postNickName = postUserInformation[length - MAX_LIMIT * visitTimes - 1 - i].nickName
      }
      visitTimes += 1
    }

    return { postData, visitTimes }
  }

}