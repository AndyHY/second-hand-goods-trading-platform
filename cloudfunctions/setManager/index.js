// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  var manager = 0;
  var managerOpenid = [];
  await db.collection('LittleMessage').where({
    name: "privilegeMessage"
  }).get().then(
    function (res) {
      manager = res.data[0].manager;
      managerOpenid = res.data[0].managerOpenid;
    },
    function (err) {

    }
  )
  if (manager < 5) {

    await db.collection('Privilege').where({
      _openid: event.openid,
    }).update({
      data: {
        privilege: '管理员'
      }
    });

    await db.collection('AskPrivilege').where({
      _openid: event.openid,
    }).remove();

    managerOpenid.push(event.openid);
    await db.collection('LittleMessage').where({
      name: "privilegeMessage"
    }).update({
      data: {
        manager: manager + 1,
        managerOpenid: managerOpenid
      }
    })
  }
  return manager < 5 ? "success" : "fail"
}