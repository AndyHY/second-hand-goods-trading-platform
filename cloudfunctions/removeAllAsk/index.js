// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  var removedNum = 0;
  var result;
  await db.collection('AskPrivilege').get().then(function (res) {
    result = res;
  })
  for (let i = 0; i < result.data.length; i++) {
    await db.collection('AskPrivilege').doc(result.data[i]._id).remove().then(function (res) {
      console.log(res);
      removedNum += res.stats.removed;
    });
  }
  console.log(result)
  return removedNum;
}