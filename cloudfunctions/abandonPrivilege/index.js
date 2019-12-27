// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database();
// 云函数入口函数
exports.main = async(event, context) => {
  var manager = 0;
  var managerOpenid = [];

  await db.collection('Privilege').where({
    _openid: event.openid,
  }).update({
    data: {
      privilege: '用户'
    }
  });
  console.log(1);
  await db.collection('LittleMessage').where({
    name: 'privilegeMessage'
  }).get().then(
    function(res) {
      manager = res.data[0].manager;
      managerOpenid = res.data[0].managerOpenid;
    },
    function(err) {

    }
  );
  console.log(2);
  var index = 0;
  index = managerOpenid.indexOf(event.openid);
  if (index > -1) {
    managerOpenid.splice(index, 1);
  }
  console.log(managerOpenid);
  await db.collection('LittleMessage').where({
    name: 'privilegeMessage'
  }).update({
    data: {
      manager: manager - 1,
      managerOpenid: managerOpenid
    }
  })
  console.log(3);
}