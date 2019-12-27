App({
  globalData: {
    myHeadPortrait: '',
    myNickName: '',
    myOpenid: '',
    myPrivilege: ''
  },
  privilegeReadyCallback,
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    this.getOpenid()
  },
  //得到当前用户的openid
  getOpenid: function () {
    wx.cloud.callFunction({
      name: 'login',
      complete: res => {
        this.globalData.myOpenid = res.result.openid
        console.log('我的openid是' + this.globalData.myOpenid)
        this.initUserInformation();
      }
    })
  },
  //初始化用户信息
  initUserInformation: function () {
    const db = wx.cloud.database();
    var that = this;
    db.collection('UserInformation').where({
      _openid: this.globalData.myOpenid
    }).get({
      success(res) {
        if (res.data.length == 0) {
          db.collection('UserInformation').add({
            data: {
              nickName: '',
              sex: '隐藏',
              icon: '../../images/mine.png',
            }
          })
        }
        that.initprivilege();
      },
      fail(err) {
        console.log(err)
      }
    })
    db.collection('MyPost').where({
      _openid: this.globalData.myOpenid
    }).get({
      success(res) {
        if(res.data.length == 0) {
          db.collection('MyPost').add({
            data:{
              myPost:[],
            }
          })
        }
      },
      fail(err) {
        console.log(err)
      }
    })
    db.collection('MyCollection').where({
      _openid: this.globalData.myOpenid
    }).get({
      success(res) {
        if(res.data.length == 0) {
          db.collection('MyCollection').add({
            data:{
              myCollection:[]
            }
          })
        }
      },
      fail(err) {
        console.log(err)
      }
    })
  },
  //初始化用户权限
  initprivilege: function () {
    var that = this;
    wx.cloud.callFunction({
      name: 'initPrivilege',
      data: {
        openid: that.globalData.myOpenid,
      },
      complete: res => {
        that.globalData.myPrivilege = res.result
        if (that.privilegeReadyCallback) {
          that.privilegeReadyCallback(res.result)
        }
      }
    })
  }
})
