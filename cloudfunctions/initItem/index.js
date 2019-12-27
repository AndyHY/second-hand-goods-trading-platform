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
  var success4 = false

  var postData = {}
  var amount = event.amount
  var result = []
  var floorUserInformation = []
  var length
  var starClick = false

  await db.collection('Post').doc(event.id).get().then((res) => {
    console.log(1)
    success1 = true
    res1 = res
  }, (err) => {
    console.log(err)
  })

  var fileList = []
  if (res1.data.postImageCloudID != null) {
    fileList = res1.data.postImageCloudID
    result = await cloud.getTempFileURL({
      fileList,
    })  
  }
  
  

  if (success1) {
    console.log(2)
    length = res1.data.floorContent == null ? 0 : res1.data.floorContent.length
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
    postData = res1.data
    postData.postHeadPortrait = res2.data[0].icon //楼主头像
    postData.postNickName = res2.data[0].nickName //楼主昵称
    for (let i = 0; i < length; i++) {
      await db.collection('UserInformation').where({
        _openid: res1.data.floorContent[i].floorOpenid
      }).get().then((res) => {
        console.log(5)
        floorUserInformation.push(res.data[0])
        if (floorUserInformation.length == length) {
          success3 = true
          for (let i = 0; i < length; i++) {
            postData.floorContent[i].floorHeadPortrait = floorUserInformation[i].icon
            postData.floorContent[i].floorNickName = floorUserInformation[i].nickName
          }
        }
      }, (err) => {
        console.log(err)
      })
    }
  }

  if (success3) {
    console.log(6)
    await db.collection('Floor').where({
      postId: res1.data._id
    }).get().then((res) => {
      console.log(7)
      var length = res.data.length
      for (let i = 0; i < length; i++) {
        if (res.data[i].floorFloorContent != null)
          amount[i] = res.data[i].floorFloorContent.length
      }
    }, (err) => {
      console.log(err)
    })
  }


  await db.collection('MyCollection').where({
    _openid: event.myOpenid
  }).get().then((res) => {
    if (res.data[0].myCollection.indexOf(event.id) != -1) {
      starClick = true
    } else {
      starClick = false
    } 
    console.log('starClick');
    console.log(starClick);
  }, (err) => {
    console.log(err)
  })

  return { postData, amount, result, starClick}

}