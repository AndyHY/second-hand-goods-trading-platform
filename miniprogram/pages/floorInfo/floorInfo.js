var common = require('../common/common.js')
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    floorData: {},
    postId: '',
    floorId: '',
    floorFloorContent: '',
    floorFloorClickIndex: -1,
    myOpenid: '',
    myPrivilege: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    var that = this
    // 让页面在app.js得到权限字符串之后再将其转换为权限等级
    if (app.globalData.myPrivilege) {
      that.setData({
        myPrivilege: common.privilegeLevel(app.globalData.myPrivilege),
        myOpenid: app.globalData.myOpenid,
        floorId: e.floorId,
        postId: e.postId
      })
    } else {
      app.privilegeReadyCallback = res => {
        that.setData({
          myPrivilege: common.privilegeLevel(res),
          myOpenid: app.globalData.myOpenid,
          floorId: e.floorId,
          postId: e.postId
        })
      }
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'initFloor',
      data: {
        floorId: that.data.floorId,
      },
      success: res => {
        console.log("楼层首次加载成功")
        that.setData({
          floorData: res.result.floorData,
        })
        console.log(that.data.floorData)
        var myPrivilege = common.privilegeLevel(app.globalData.myPrivilege)
        var date = new Date()
        var currentTimeStamp = common.buildTimeStamp(date)
        var floorTimeStamp = ''
        var floorFloorTimeStampArray = []
        var floorData = that.data.floorData
        if (floorData.floorFloorContent == null) {
          var tmpData = common.buildDifftime(floorData, currentTimeStamp, floorTimeStamp)
          that.setData({
            floorData: tmpData,
            myOpenid: app.globalData.myOpenid,
            myPrivilege: myPrivilege
          })
        } else {
          var tmpData1 = common.buildDifftime(floorData.floorFloorContent, currentTimeStamp, floorFloorTimeStampArray)
          floorData.floorFloorContent = tmpData1
          var tmpData2 = common.buildDifftime(floorData, currentTimeStamp, floorTimeStamp)
          that.setData({
            floorData: tmpData2,
            myOpenid: app.globalData.myOpenid,
            myPrivilege: myPrivilege
          })
        }
        wx.hideLoading()
      },
      fail: err => {
        console.log(err)
      }
    })

    that.setData({
      myOpenid: app.globalData.myOpenid,
      myPrivilege: app.globalData.myPrivilege
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this
    var postId = this.data.postId
    var floorId = this.data.floorId
    db.collection('Post').where({
      _id: postId
    }).get({
      success: res => {
        if (res.data.length == 0) {
          common.showToastPostDeleted()
        } else {
          db.collection('Floor').where({
            _id: floorId
          }).get({
            success: res => {
              if (res.data.length == 0) {
                common.showToastFloorDeleted2(floorId)
              } else {
                wx.showNavigationBarLoading();
                wx.showLoading({
                  title: '加载中',
                  mask: true
                })
                wx.cloud.callFunction({
                  name: 'initFloor',
                  data: {
                    floorId: that.data.floorId,
                  },
                  success: res => {
                    console.log("楼层刷新成功")
                    that.setData({
                      floorData: res.result.floorData,
                      floorFloorClickIndex: -1
                    })
                    var date = new Date()
                    var currentTimeStamp = common.buildTimeStamp(date)
                    var floorTimeStamp = ''
                    var floorFloorTimeStampArray = []
                    var floorData = that.data.floorData
                    if (floorData.floorFloorContent == null) {
                      var tmpData = common.buildDifftime(floorData, currentTimeStamp, floorTimeStamp)
                      that.setData({
                        floorData: tmpData
                      })
                    } else {
                      var tmpData1 = common.buildDifftime(floorData.floorFloorContent, currentTimeStamp, floorFloorTimeStampArray)
                      floorData.floorFloorContent = tmpData1
                      var tmpData2 = common.buildDifftime(floorData, currentTimeStamp, floorTimeStamp)
                      that.setData({
                        floorData: tmpData2
                      })
                    }
                    wx.hideNavigationBarLoading();
                    wx.hideLoading()
                    wx.stopPullDownRefresh();
                  },
                  fail: err => {
                    console.log(err)
                  }
                })
              }
            },
            fail: err => {
              console.log(err)
            }
          })
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  replyHandle: function (e) {
    this.setData({
      floorFloorClickIndex: e.currentTarget.dataset.floorfloorindex
    })
  },
  // 输入框
  floorFloorInput: function (e) {
    this.data.floorFloorContent = e.detail.value
    this.setData({
      floorFloorContent: this.data.floorFloorContent
    })
  },
  // 按下回复按钮
  floorFloorButton: common.throttle(function () {
    var that = this
    // 首先需要得到回复的时间和时间戳
    var date = new Date()
    var time = common.buildTimes(date)
    var timeStamp = common.buildTimeStamp(date)
    var floorFloorContent = this.data.floorFloorContent //回复的内容
    var postId = this.data.postId
    var floorId = this.data.floorId
    if (this.data.floorFloorClickIndex != -1) {
      var floorFloorId = this.data.floorData.floorFloorId[this.data.floorFloorClickIndex]
    }
    db.collection('Post').where({
      _id: postId
    }).get({
      success: res => {
        if (res.data.length == 0) {
          common.showToastPostDeleted()
        } else {
          db.collection('Floor').where({
            _id: floorId
          }).get({
            success: res => {
              if (res.data.length == 0) {
                common.showToastFloorDeleted2(floorId)
              } else {
                db.collection('FloorFloor').where({
                  _id: floorFloorId
                }).get({
                  success: res => {
                    if (res.data.lentgh != 0 || this.data.floorFloorClickIndex == -1) {
                      if (floorFloorContent == '') {
                        wx.showToast({
                          title: '输入内容不能为空',
                          icon: 'none',
                          duration: 2000
                        })
                      } else {
                        if (this.data.floorData.floorFloorContent == null) {
                          var floorFloorContentArray = []
                        } else {
                          var floorFloorContentArray = this.data.floorData.floorFloorContent
                        }
                        var floorFloorOpenid = app.globalData.myOpenid
                        floorFloorContentArray.push({ floorFloorOpenid, floorFloorContent, time, timeStamp })
                        var floorFloorIndex = floorFloorContentArray.length - 1
                        floorFloorContentArray[floorFloorIndex] = { floorFloorOpenid, floorFloorContent, time, timeStamp, floorFloorIndex }
                        //调用云函数
                        wx.cloud.callFunction({
                          name: 'floorFloorButton',
                          data: {
                            floorFloorOpenid: floorFloorOpenid,
                            floorFloorContent: floorFloorContent,
                            floorFloorContentArray: floorFloorContentArray,
                            floorFloorIndex: floorFloorIndex,
                            floorFloorClickIndex: that.data.floorFloorClickIndex,
                            floorId: that.data.floorData._id,
                            time: time,
                            timeStamp: timeStamp
                          },
                          success: res => {
                            console.log("success")
                            that.setData({
                              floorFloorClickIndex: -1,
                              floorFloorContent: ''
                            })
                            that.onPullDownRefresh()
                          },
                          fail: err => {
                            console.log(err)
                          }
                        })
                      }
                    } else {
                      common.showToastFloorFloorDeleted(that)
                    }
                  },
                  fail: err => {
                    console.log(err)
                  }
                })
              }
            },
            fail: err => {
              console.log(err)
            }
          })
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  }, 3000),
  //删除楼中楼
  //需要传递当前楼中楼的id
  deleteFloorFloor: function (e) {
    var that = this
    var postId = this.data.postId
    var floorId = this.data.floorId
    var floorFloorIndex = e.currentTarget.dataset.floorfloorindex
    var floorFloorId = that.data.floorData.floorFloorId[floorFloorIndex]
    db.collection('Post').where({
      _id: postId
    }).get({
      success: res => {
        if (res.data.length == 0) {
          common.showToastPostDeleted()
        } else {
          db.collection('Floor').where({
            _id: floorId
          }).get({
            success: res => {
              if (res.data.length == 0) {
                common.showToastFloorDeleted2(floorId)
              } else {
                db.collection('FloorFloor').where({
                  _id: floorFloorId
                }).get({
                  success: res => {
                    if (res.data.length == 0) {
                      common.showToastFloorFloorDeleted(that)
                    } else {
                      wx.showModal({
                        title: '删除',
                        content: '确认删除该楼层？',
                        success(res) {
                          if (res.confirm) {
                            wx.cloud.callFunction({
                              name: 'deleteFloorFloor',
                              data: {
                                floorId: that.data.floorData._id,
                                floorFloorId: floorFloorId,
                                floorFloorIndex: floorFloorIndex,
                              },
                              success: res => {
                                that.onPullDownRefresh()
                              },
                              fail: err => {
                                console.log(err)
                              }
                            })
                          } else if (res.cancel) {
                            console.log('用户点击取消')
                          }
                        }
                      })
                    }
                  },
                  fail: err => {
                    console.log(err)
                  }
                })
              }
            },
            fail: err => {
              console.log(err)
            }
          })
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  }
})