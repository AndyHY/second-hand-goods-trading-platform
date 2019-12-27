// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {

  var res1, res2
  var success1 = false
  var success2 = false
  var success3 = false
  var fail = '楼层已被删除'

  var floorData = {}
  var floorFloorUserInformation = []
  var replyUserInformation = []
  var length

  await db.collection('Floor').doc(event.floorId).get().then((res) => {
    console.log(1)
    success1 = true
    res1 = res
  }, (err) => {
    console.log(err)
    return fail
  })

  if (success1) {
    console.log(2)
    length = res1.data.floorFloorContent == null ? 0 : res1.data.floorFloorContent.length
    await db.collection('UserInformation').where({
      _openid: res1.data._openid
    }).get().then((res) => {
      console.log(3)
      success2 = true
      res2 = res
    }, (err) => {
      console.log(err)
    })
  }

  if (success2) {
    console.log(4)
    floorData = res1.data
    floorData.floorHeadPortrait = res2.data[0].icon
    floorData.floorNickName = res2.data[0].nickName
    for (let i = 0; i < length; i++) {
      await db.collection('UserInformation').where({
        _openid: res1.data.floorFloorContent[i].floorFloorOpenid
      }).get().then((res) => {
        console.log(5)
        floorFloorUserInformation.push(res.data[0])
        if (floorFloorUserInformation.length == length) {
          success3 = true
        }
      }, (err) => {
        console.log(err)
      })
    }
  }

  if (success3) {
    console.log(6)
    for (let i = 0; i < length; i++) {
      await db.collection('UserInformation').where({
        _openid: res1.data.floorFloorContent[i].replyOpenid == undefined ? 'default' : res1.data.floorFloorContent[i].replyOpenid
      }).get().then((res) => {
        console.log(7)
        if (res.data.length == 0) {
          floorData.floorFloorContent[i].floorFloorHeadPortrait = floorFloorUserInformation[i].icon
          floorData.floorFloorContent[i].floorFloorNickName = floorFloorUserInformation[i].nickName
        } else {
          replyUserInformation[i] = res.data[0]
          floorData.floorFloorContent[i].replyNickName = replyUserInformation[i].nickName
          floorData.floorFloorContent[i].floorFloorHeadPortrait = floorFloorUserInformation[i].icon
          floorData.floorFloorContent[i].floorFloorNickName = floorFloorUserInformation[i].nickName
        }
      }, (err) => {
        console.log(err)
      })
    }
  }

  return {floorData}

}