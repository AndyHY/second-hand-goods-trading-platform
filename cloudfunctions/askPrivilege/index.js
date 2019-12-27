// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async(event, context) => {
  var answer = 'error';
  var result;
  var success = true;
  await db.collection('LittleMessage').where({
    name: "privilegeMessage"
  }).get().then(
    function(res) {
      console.log(res)
      if (res.data.length == 0) {
        success = false;
      } else {
        result = res;
      }
    },
    function(err) {

    })

  if (!success) {
    console.log('add!!');
    await db.collection('LittleMessage').add({
      data: {
        name: "privilegeMessage",
        manager: 0,
        engineer: 0,
        managerOpenid: []
      }
    })
  }
  //获取成功
  if (success) {
    let num = result.data[0].manager;
    if (num >= 5) {
      answer = 'fail'
    } else {
      var success2 = true;
      var supres2;
      await db.collection('AskPrivilege').where({
        _openid: event.openid
      }).get().then(
        function(res) {
          supres2 = res;
        },
        function(err) {
          console.log('there is no collection like askprivilege')
          success2 = false;
        })
      if (success2) {
        //已经发送请求
        if (supres2.data.length != 0) {
          answer = 'repeat'
        }
        //未发送请求
        else {
          console.log('_openid:' + event.openid);
          await db.collection('AskPrivilege').add({
            data: {
              _openid: event.openid,
            }
          }).then(
            function(res) {
              console.log('add success')
              answer = 'success'
            },
            function(err) {
              console.log('add failure')
            })
        }
      }
    }
  }
  return answer;
}