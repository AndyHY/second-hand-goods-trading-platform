// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
// 每次加载最多从数据库中获取20个记录
const MAX_LIMIT = 20
// 云函数入口函数
exports.main = async (event, context) => {

  var res1
  var res2
  var success1 = false
  var success2 = false
  var success3 = false

  await db.collection('Post').get().then((res) => {
    success1 = true
    res1 = res
  }, (err) => {
    console.log(err)
  })

  if (success1) {
    var length = res1.data.length  //length是帖子的数量
    var postUserInformation = []
    var postData = []
    // 如果记录数大于等于 MAX_LIMIT
    if (length >= MAX_LIMIT) {
      for (let i = length - 1; i >= length - MAX_LIMIT; i--) {  //遍历最新的 MAX_LIMIT个帖子，找到对应的楼主信息
        await db.collection('UserInformation').where({
          _openid: res1.data[i]._openid
        }).get().then((res) => {
          success2 = true
          postUserInformation[i] = res.data[0]  //找到每个帖子的楼主信息
        }, (err) => {
          console.log(err)
        })
      }
      // 为最新的MAX_LIMIT个postData赋值
      for (let i = 0; i < MAX_LIMIT; i++) {
        postData.push(res1.data[length - 1 - i])
        postData[i].postNickName = postUserInformation[length - 1 - i].nickName
        postData[i].postHeadPortrait = postUserInformation[length - 1 - i].icon
      }
    } else {
      for (let i = length - 1; i >= 0; i--) {  //遍历最新的20个帖子，找到对应的楼主信息
        await db.collection('UserInformation').where({
          _openid: res1.data[i]._openid
        }).get().then((res) => {
          success2 = true
          postUserInformation[i] = res.data[0]  //找到每个帖子的楼主信息
        }, (err) => {
          console.log(err)
        })
      }
      // 为最新的postData赋值
      for (let i = 0; i < length; i++) {
        postData.push(res1.data[length - 1 - i])
        postData[i].postNickName = postUserInformation[length - 1 - i].nickName
        postData[i].postHeadPortrait = postUserInformation[length - 1 - i].icon
      }
    }
  }

  if (success2) {
    await db.collection('LittleMessage').where({
      name:"topPost"
    }).get().then((res) => {
      res2 = res
      success3 = true
    }, (err) => {
      console.log(err)
    })
  }
 
  if (success3) {
    var topPostData = []
    var topPostID = res2.data[0].topPostID
    for (let i = 0; i < topPostID.length; i++) {
      await db.collection('Post').where({
        _id: topPostID[i]
      }).get().then((res) => {
        topPostData[i] = res.data[0]
      }, (err) => {
        console.log(err)
      })
    }

  }



  return {postData, topPostData, length}

}