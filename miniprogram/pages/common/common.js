// 生成当前时间
function buildTimes(date) {  
    var dateTime;
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString();
    var day = (date.getDate()).toString();
    var hour = (date.getHours()).toString();
    var minute = (date.getMinutes()).toString();
    var second = (date.getSeconds()).toString();
    if (month.length == 1) {
        month = "0" + month;
    }
    if (day.length == 1) {
        day = "0" + day;
    }
    if (hour.length == 1) {
        hour = "0" + hour;
    }
    if (minute.length == 1) {
        minute = "0" + minute;
    }
    if (second.length == 1) {
        second = "0" + second;
    }
    return dateTime = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}
// 生成当前时间戳
function buildTimeStamp(date) {
    var timeStamp = Date.parse(date)
    return timeStamp
}
// 生成时间差值
function buildDifftime(data, currentTimeStamp, timeStamp) {
    var tmpData = data
    if (tmpData.length == null) {
        console.log(1)
        timeStamp = tmpData.timeStamp
        var tmp = (currentTimeStamp - timeStamp) / 1000
        if (tmp < 60) {
          tmpData.difftime = tmp + "秒前"
        } else if (60 <= tmp && tmp < 3600) {
          tmpData.difftime = Math.round(tmp/60) + "分钟前"
        } else if (3600 <= tmp && tmp < 86400) {
          tmpData.difftime = Math.round(tmp/3600) + "小时前"
        } else if (86400 <= tmp && tmp < 604800) {
          tmpData.difftime = Math.round(tmp/86400) + "天前"
        } else {
          tmpData.difftime = tmpData.time
        }        
    } else {
        for (let i = 0; i < tmpData.length; i++) {
            timeStamp[i] = tmpData[i].timeStamp
        }
        for (let i = 0; i < tmpData.length; i++) {
            var tmp = (currentTimeStamp - timeStamp[i]) / 1000
            if (tmp < 60) {
              tmpData[i].difftime = tmp + "秒前"
            } else if (60 <= tmp && tmp < 3600) {
              tmpData[i].difftime = Math.round(tmp/60) + "分钟前"
            } else if (3600 <= tmp && tmp < 86400) {
              tmpData[i].difftime = Math.round(tmp/3600) + "小时前"
            } else if (86400 <= tmp && tmp < 604800) {
              tmpData[i].difftime = Math.round(tmp/86400) + "天前"
            } else {
              tmpData[i].difftime = tmpData[i].time
            }
        }
    }
    console.log("转换后的日期数组")
    console.log(tmpData)
    console.log("转换后的日期数组")
    return tmpData
}
// 将权限转换为权限等级
function privilegeLevel(globalPrivilege) {
  console.log(globalPrivilege)
  var myPrivilege
  if (globalPrivilege == "用户") {
    myPrivilege = 1
  } else if (globalPrivilege == "管理员") {
    myPrivilege = 2
  } else if (globalPrivilege == "开发者") {
    myPrivilege = 3
  }
  return myPrivilege
}
// 显示帖子已被删除的消息提示框
function showToastPostDeleted() {
  wx.showToast({
    title: '帖子已被删除',
    icon: 'none',
    duration: 2000,
    success: res => {
      setTimeout(() => {
        wx.reLaunch({
          url: '../index/index'
        })
      }, 1000)
    },
    fail: err => {
      console.log(err)
    }
  })
}
// 第一种显示楼层已被删除的消息提示框
function showToastFloorDeleted1(page) {
  wx.showToast({
    title: '楼层已被删除',
    icon: 'none',
    duration: 2000,
    success: res => {
      setTimeout(() => {
        page.onPullDownRefresh()
      }, 1000)
    },
    fail: err => {
      console.log(err)
    }
  })
}
// 第二种显示楼层已被删除的消息提示框
function showToastFloorDeleted2(floorId) {
  wx.showToast({
    title: '楼层已被删除',
    icon: 'none',
    duration: 2000,
    success: res => {
      setTimeout(() => {
        wx.reLaunch({
          url: '../item/item?id=' + floorId
        })
      }, 1000)
    },
    fail: err => {
      console.log(err)
    }
  })
}
// 显示楼中楼已被删除的消息提示框
function showToastFloorFloorDeleted(page) {
  wx.showToast({
    title: '楼中楼已被删除',
    icon: 'none',
    duration: 2000,
    success: res => {
      setTimeout(() => {
        page.onPullDownRefresh()
      }, 1000)
    },
    fail: err => {
      console.log(err)
    }
  })
}
// 节流函数
function throttle(fn, gapTime) {
  // 默认gaptime为1500
  if (gapTime == null || gapTime == undefined) {
    gapTime = 1500
  }

  let _lastTime = null

  // 返回新的函数
  return function () {
    let _nowTime = + new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      fn.apply(this, arguments)   //将this和参数传给原函数
      _lastTime = _nowTime
    }
  }
}
module.exports = {
    buildTimes: buildTimes,
    buildTimeStamp: buildTimeStamp,
    buildDifftime: buildDifftime,
    privilegeLevel: privilegeLevel,
    showToastPostDeleted: showToastPostDeleted,
    showToastFloorDeleted1: showToastFloorDeleted1,
    showToastFloorDeleted2: showToastFloorDeleted2,
    showToastFloorFloorDeleted: showToastFloorFloorDeleted,
    throttle: throttle    
}