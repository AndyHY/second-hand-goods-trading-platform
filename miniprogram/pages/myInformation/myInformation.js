var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickName: '',
    icon:'',
    previewIcon: false,
    sex: '隐藏',
    sexChoice: ['男', '女', '隐藏'],
    sexSelect: false,
    selectOpen: false,
    selectShow: false,
    selectIcon: '../../images/selectDisplay.png',
    IconSelectedFlag: false,
    privilege: '用户',
  },
  /**
   * 用户昵称输入
   */
  nickNameHandle: function(e) {
    this.setData({
      nickName: e.detail.value
    });
  },

  /**
   * 用户头像点击
   */
  iconHandle: function(e) {
    this.setData({
      previewIcon: !this.data.previewIcon
    });
  },
  /**
   * 用户头像设置
   */
  resetIcon: function() {
    console.log(1)
    this.data.IconSelectedFlag = true;
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths)
        that.setData({
          icon: tempFilePaths[0]
        });
      }
    })
  },
  /**
   * 图片预览返回
   */
  returnIcon: function() {
    this.setData({
      previewIcon: false
    });
  },
  /**
   * 用户性别选择点击
   */
  sexHandle: function() {
    this.setData({
      selectShow: !this.data.selectShow,
      selectOpen: !this.data.selectOpen,
      selectIcon: '../../images/selectClose.png',
    })
  },
  /**
   * 用户性别选择
   */
  sexChoiceHandle: function(e) {
    this.setData({
      sex: this.data.sexChoice[e.target.dataset.index],
      selectShow: !this.data.selectShow,
      selectOpen: !this.data.selectOpen,
      selectIcon: '../../images/selectDisplay.png',
    })
  },
  /**
   * 保存
   */
  save: function() {
    var that = this;
    const db = wx.cloud.database();
    var icon = this.data.icon;
    //若重传了照片
    if (this.data.IconSelectedFlag) {
      if (this.data.icon != '../../images/mine.png') {
        wx.cloud.deleteFile({
          fileList: [this.data.cloudIcon],
          success: res => {
            // handle success
            console.log(res.fileList)
          },
          fail: err => {
            console.log('fail-delect')
          }
        })
      }
      wx.cloud.uploadFile({
        cloudPath: 'userIcon/' + app.globalData.myOpenid + Math.floor(Math.random() * 10000) + this.data.icon.match(/\.[^.]+?$/),
        filePath: this.data.icon,
        success(res) {
          var upres = res;
          db.collection('UserInformation').where({
            _openid: app.globalData.myOpenid
          }).get({
            success(res) {
              console.log(upres);
              //没有记录则添加
              if (res.data.length == 0) {
                db.collection('UserInformation').add({
                  data: {
                    nickName: that.data.nickName,
                    sex: that.data.sex,
                    icon: upres.fileID,
                  }
                })
              }
              //有记录则修改
              else {
                db.collection('UserInformation').doc(res.data[0]._id).update({
                  data: {
                    nickName: that.data.nickName,
                    sex: that.data.sex,
                    icon: upres.fileID
                  }
                })
              }
              //保存到缓存中
              wx.setStorage({
                key: 'userInformation',
                data: {
                  icon: icon,
                }
              })
              //上传成功即返回
              wx.showToast({
                title: '保存成功',
                icon: 'none',
                duration: 2000,
              })
              wx.navigateBack({
                delta: 1
              })
            }
          })
        },
        fail(res) {
          console.log('fail to upload userIcon')
        }
      })
    } else {
      //没有重传照片
      db.collection('UserInformation').where({
        _openid: app.globalData.myOpenid
      }).get({
        success(res) {
          console.log(res);
          //没有记录则添加
          if (res.data.length == 0) {
            db.collection('UserInformation').add({
              data: {
                nickName: that.data.nickName,
                sex: that.data.sex,
                icon: '../../images/mine.png'
              }
            })
          }
          //有记录则修改
          else {
            db.collection('UserInformation').doc(res.data[0]._id).update({
              data: {
                nickName: that.data.nickName,
                sex: that.data.sex,
              }
            })
          }
          wx.showToast({
            title: '保存成功',
            icon: 'none',
            duration: 2000,
          })
          wx.navigateBack({
            delta: 1
          })
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      icon: options.icon,
      nickName: options.nickName,
      sex: options.sex,
      cloudIcon: options.cloudIcon,
      privilege: app.globalData.myPrivilege
    })
  },
  // 请求权限
  askPrivilege: function() {
    var that = this;
    var result = '';
    if (this.data.privilege == '用户') {
      wx.cloud.callFunction({
        name: 'askPrivilege', //provePrivilege
        data: {
          openid: app.globalData.myOpenid
        },
        complete: res => {
          console.log('myInformation.js-function-askPrivilegeres**用户获取管理员权限返回情况**')
          console.log(res)
          that.askPrivilegeTosat(res.result);
          console.log('myInformation.js-function-askPrivilegeres**用户获取管理员权限返回情况**')
        }
      })
    } else if (this.data.privilege == '管理员') {
      wx.cloud.callFunction({
        name: 'abandonPrivilege', //setPrivilege
        data: {
          openid: app.globalData.myOpenid
        },
        complete: res => {
          this.setData({
              privilege: '用户'
            }),
            app.globalData.myPrivilege = '用户'
          wx.showToast({
            title: '放弃成功',
            icon: 'none',
            duration: 2000
          })
        }
      });
    } else if (this.data.privilege == '开发者') {
      wx.navigateTo({
        url: '../setPrivilege/setPrivilege'
      })
    }
  },
  // 权限请求回调显示
  askPrivilegeTosat: function(result) {
    var title = '';
    if (result == 'success')
      title = '请求成功'
    else if (result == 'repeat')
      title = '重复请求'
    else if (result == 'fail')
      title = '管理员人数已满'
    else if (result == 'error')
      title = '请求失败'
    wx.showToast({
      title: title,
      icon: 'none',
      duration: 2000
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    console.log('pullDown');
    wx.showNavigationBarLoading();
    wx.cloud.callFunction({
      name: 'initPrivilege',
      data: {
        openid: app.globalData.myOpenid
      },
      complete: res => {
        app.globalData.myPrivilege = res.result;
        this.setData({
          privilege: app.globalData.myPrivilege
        })
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  /**
   * 不做任何事情，消除冒泡
   */
  nothingToDo: function() {

  }
})