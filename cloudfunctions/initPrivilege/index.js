// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  var answer = '用户'
  var empty = false
  var add = false
  await db.collection('Privilege').where({
    _openid: event.openid,
  }).get().then(
    function (res) {
      console.log(res)
      if (res.data.length == 0) {
        empty = true
      }
      else {
        answer = res.data[0].privilege;
        console.log('get!!')
        console.log(res.data)
      }
    },
    function (err) {
    }
  )
  if (empty) {
    console.log('add!!!');
    await db.collection('Privilege').add({
      data: {
        privilege: '用户',
        _openid: event.openid
      }
    }).then(
      function (res) {
        add = true
      },
      function (err) {

      }
    )
  }
  if (add) {
    await db.collection('Privilege').where({
      _openid: event.openid,
    }).get().then(
      function (res) {
        console.log(res)
        answer = res.data[0].privilege;
        console.log('get!!')
        console.log(res.data)
      },
      function (err) {
      }
    )
  }
  console.log(answer)
  return answer;
}